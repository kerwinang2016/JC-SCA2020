/*jshint esversion: 6 */

var fs = require('fs')
,   log = require('fancy-log')
,   c = require('ansi-colors')
,   inquirer = require('inquirer')
,   PromptCheckbox = require('prompt-checkbox')
,   nconf = require('nconf')
,   path = require('path')
,	semver = require('semver')
,   _ = require('underscore');

'use strict';

function prepareQuestions(manifest)
{
    var optional_questions = [
        {
            type: 'input'
        ,   name: 'vendor'
        ,   message: 'Vendor:'
        ,   default: manifest.vendor
        }
    ,   {
            type: 'input'
        ,   name: 'name'
        ,   message: 'Name:'
        ,   default: manifest.name
        ,   validate: function(input)
            {
                if(!extension_deploy_inquirer.validateExtensionName(input))
                {
                    return 'Name must include only alphanumeric characters, underscores and must start with an alphabetic character.';
                }

                return true;
            }
        }
    ,   {
            type: 'input'
        ,   name: 'fantasy_name'
        ,   message: 'Fantasy Name:'
        ,   default: manifest.fantasyName || manifest.name
        }
    ,   {
            type: 'input'
        ,   name: 'version'
        ,   message: 'Version:'
        ,   default: manifest.version
        ,   validate: function(input)
            {
                if(!semver.valid(input))
                {
                    return 'Please provide a valid version number (ie. 1.0.0)';
                }

                return true;
            }
        }
    ,   {
            type: 'input'
        ,   name: 'description'
        ,   message: 'Description:'
        ,   default: manifest.description
        }
    ];

    return optional_questions;
}

var extension_deploy_inquirer = {

    inquireDeployExtension: function inquireDeployExtension(first_cb)
    {
        var extensions_path = nconf.get('folders:extensions_path');

        if(extensions_path.length)
        {
            var manifest_path
            ,   manifest;

            if(extensions_path.length === 1)
            {
                manifest_path = path.join(extensions_path[0], 'manifest.json');
                manifest = JSON.parse(fs.readFileSync(manifest_path).toString());

                if(manifest.type !== 'extension')
                {

                    first_cb(new Error('Manifest type for extension ' + manifest.name + '-' + manifest.version +
                         ' is not valid. Type must be "extension".'));
                }
                else
                {
                   first_cb(null, {
                       manifest: manifest
                   ,   manifest_path: manifest_path
                   ,   ext_folder: extensions_path[0]
                   });
                }
            }
            else
            {
                var extensions = _.map(extensions_path, function(path)
                {
                    return path.replace(nconf.get('folders:source:source_path') + '/', '');
                });

                inquirer.prompt([
                    {
                        type: 'list'
                    ,   name: 'extension'
                    ,   message: 'Select extension:'
                    ,   default: extensions[0]
                    ,   choices: extensions
                    }
                ])
                .then(
                    function selectedExt(ext_answer)
                    {
                        ext_answer = ext_answer.extension;
                        manifest_path = path.join(nconf.get('folders:source:source_path'), ext_answer, 'manifest.json');
                        manifest = JSON.parse(fs.readFileSync(manifest_path).toString());

                        if(manifest.type !== 'extension')
                        {

                            first_cb(new Error('Manifest type for extension ' + manifest.name + '-' + manifest.version +
                                ' is not valid. Type must be "extension".'));
                        }
                        else
                        {
                             first_cb(null, {
                                manifest: manifest
                            ,   manifest_path: manifest_path
                            ,   ext_folder: path.join(nconf.get('folders:source:source_path'), ext_answer)
                            });
                        }
                    }
                );
            }
        }
        else
        {
            first_cb(new Error('There is no extension to deploy, sorry.\n' +
                'Check if it\'s correctly setted in your configuration file the keys folders -> extensions_path.'));
        }
    }

,   inquireNewExtensionData: function inquireNewExtensionData(data, cb)
    {
        var questions = prepareQuestions(data.manifest);

        if(data.has_bundle || data.create_new_record)
        {
            inquirer.prompt(
                questions
            )
            .then(
                function(answers)
                {
                    if(data.has_bundle)
                    {
                        log(c.green('Deploying from a published ' + data.manifest.type + '. Preparing to create a new one...'));
                    }

                    if(!data.create_new_record &&
                        answers.name === data.extension_record.name &&
                        answers.vendor === data.extension_record.vendor &&
                        answers.version === data.extension_record.version)
                    {
                        cb(new Error('There is already a ' + data.manifest.type +
                                    ' called: ' + data.extension_record.name + ' - ' + data.extension_record.version +
                                    '. Vendor: ' + data.extension_record.vendor + '. You need to deploy a new ' + data.manifest.type + '.'));
                        return;
                    }

                    nconf.set('deploy_config:create', true);
                    extension_deploy_inquirer.askTarget(data)
                    .then(function(target_answers)
                    {
                        const target = target_answers.target
                        ,   target_version = target_answers.version;

                        var new_extension = {
                            vendor: answers.vendor
                        ,   name: answers.name
                        ,   fantasy_name: answers.fantasy_name
                        ,   version: answers.version
                        ,   targets: target
                        ,   target_version: target_version
                        ,   description: answers.description
                        };

                        data.new_extension = new_extension;
                        data.record_operation = 'create';
                        data.folder_changed = true;
                        log(c.green('Preparing to ' + data.record_operation + ' the ' + data.manifest.type + ' record...'));
                        cb(null, data);
                    })
                    .catch(function(err)
                    {
                        cb(err);
                    });
                }
            );
        }
        else
        {
            //create case ask all the questions except operation
            //or update advanced, cutomize all metadata and update the record
            if(nconf.get('deploy_config:create') ||
               nconf.get('deploy_config:update') && nconf.get('deploy_config:advanced'))
            {
                inquirer.prompt(
                    questions
                )
                .then(
                    function(answers)
                    {
                        if(nconf.get('deploy_config:create'))
                        {
                            if(answers.name === data.extension_record.name &&
                                answers.vendor === data.extension_record.vendor &&
                                answers.version === data.extension_record.version)
                            {
                                cb(new Error('There is already a ' + data.manifest.type +
                                    ' called: ' + data.extension_record.name + ' - ' + data.extension_record.version +
                                    '. Vendor: ' + data.extension_record.vendor + '.'));
                                return;
                            }

                            data.record_operation = 'create';
                        }
                        else
                        {
                            data.record_operation = 'update';
                        }

                        extension_deploy_inquirer.askTarget(data)
                        .then(function(target_answers)
                        {
                            const target = target_answers.target
                            ,   target_version = target_answers.version;

                            var new_extension = {
                                vendor: answers.vendor
                            ,   name: answers.name
                            ,   fantasy_name: answers.fantasy_name
                            ,   version: answers.version
                            ,   targets: target
                            ,   target_version: target_version
                            ,   description: answers.description
                            };

                            data.new_extension = new_extension;
                            data.folder_changed = extension_deploy_inquirer.folderChanged(data);

                            log(c.green('Preparing to ' + data.record_operation + ' the ' + data.manifest.type + ' record...'));
                            cb(null, data);
                        })
                        .catch(function(err)
                        {
                            cb(err);
                        });
                    }
                );
            }
            else
            {
                //update simple case
                data.folder_changed = false;

                log(c.green('Uploading the ' + data.manifest.type + ' files. No record data has changed...'));
                data.record_operation = 'update';
                cb(null, data);
            }
        }
    }

,   validateExtensionName: function validateExtensionName(input)
    {
        var re = new RegExp(/^[a-z0-9_]+$/i);

        if (!re.test(input))
        {
            return false;
        }

        re = new RegExp(/^[a-z][a-z0-9_]+$/i);

        if (!re.test(input))
        {
            return false;
        }

        return true;
    }

,   askTarget: function askTarget(data)
    {
        var parsed_targets = _.indexBy(data.targets, 'name');
        var target_map = {
            'SCA': 'SuiteCommerce Online',
            'SCS': 'SuiteCommerce Online',
            'SCIS': 'SuiteCommerce InStore'
        };

        var extension_target
        ,   record_target;

        //get the name to show
        if(data.manifest)
        {
            extension_target = data.manifest.target.split(',').map((name) => target_map[name.trim()]);
            extension_target = _.uniq(extension_target);
        }

        if(data.extension_record.targets)
        {
            record_target = _.pluck(data.extension_record.targets, 'name').map((name) => target_map[name]);
            record_target = _.uniq(record_target);
        }

        var get_from_manifest = nconf.get('deploy_config:create') || (nconf.get('deploy_config:update') && nconf.get('deploy_config:advanced'));
        var targets_promise = new PromptCheckbox({
                name: 'targets'
            ,   message: 'Select supported products (Press ' + c.cyan('<space>') + ' to select)'
            ,   choices:  [ 'SuiteCommerce Online', 'SuiteCommerce InStore']
            ,   default: get_from_manifest ? extension_target : record_target
            ,   validate: function(input)
                {
                    return input.length > 0 || 'Please enter an application';
                }
            ,   transform: function(answer)
                {
                    var target_id_selected =  _.compact(_.map(target_map, function(pretty_name, name)
                    {
                        if(_.contains(answer, pretty_name))
                        {
                            return parsed_targets[name].target_id;
                        }
                    }));

                    return target_id_selected;
                }
            });

        targets_promise = targets_promise.run().then((targets) =>
        {
            const pjson = require('../../../package.json');
            const default_target_version = pjson.version.replace(/^.*(\d\d\.\d\d?\.\d\d?)$/, '$1');

            data.manifest.target_version = data.manifest.target_version || {};

            parsed_targets = _.indexBy(data.targets, 'target_id');
            const questions = _.map(targets, (target) =>
            {
                const selected_target = parsed_targets[target].name;

                return {
                    type: 'input'
                ,   name: `${selected_target}_target_version`
                ,   message: `Set the target version of ${selected_target}`
                ,   default: data.manifest.target_version[selected_target] || default_target_version
                ,   validate: function(input)
                    {
                        if(!semver.validRange(input))
                        {
                            return 'Please provide a valid version number (ie. 1.0.0)';
                        }

                        return true;
                    }
                };
            });

            return inquirer.prompt(_.compact(questions))
            .then((answers) =>
            {
                let target_version = {};

                _.each(answers, (answer, question) =>
                {
                    const match = question.match(/^(.*)_target_version$/);
                    if(!match)
                    {
                        return;
                    }
                    target_version[match[1]] = answer;
                });

                return {target: targets, version: target_version};
            });
        });

        return targets_promise;
    }

,   folderChanged: function folderChanged(data)
    {
        return data.extension_record.name !== data.new_extension.name ||
            data.extension_record.vendor !== data.new_extension.vendor ||
            data.extension_record.version !== data.new_extension.version;
    }
};

module.exports = {
    inquireNewExtensionData: extension_deploy_inquirer.inquireNewExtensionData
,   inquireDeployExtension: extension_deploy_inquirer.inquireDeployExtension
,   validateExtensionName: extension_deploy_inquirer.validateExtensionName
};
