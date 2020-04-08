/* jshint node: true */

const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const args = require('yargs').argv;
const jsonlint = require('jsonlint');
const map = require('map-stream');
const glob = require('glob');
const log = require('fancy-log');
const c = require('ansi-colors');
const xml2js = require('xml2js');
const through = require('through');
const override_logger = require('../library/batch-logger')();
const error_logger = require('../library/batch-logger')();

function loadEnvironmentVars(distroFolder) {
    const envJsonFile = path.join(distroFolder, 'env.json');
    let env;

    if (!fs.existsSync(envJsonFile)) {
        env = {};
    } else {
        env = jsonlint.parse(fs.readFileSync(envJsonFile, { encoding: 'utf8' }));
    }

    env = loadEnvironmentVarsFallbacks(env, distroFolder);
    return env;
}

function loadEnvironmentVarsFallbacks(env, distroFolder) {
    if (!env) {
        env = {};
    }

    if (!env.srcDir) {
        // Assume local Modules file. which don't create a env file
        env.srcDir = distroFolder;
        env.distro = args.distro || path.join(distroFolder, 'distro.json');
    }

    return env;
}

function getPathFromObject(object, path, default_value) {
    if (!path) {
        return object;
    }

    if (object) {
        const tokens = path.split('.');
        let prev = object;
        let n = 0;

        while (!_.isUndefined(prev) && n < tokens.length) {
            prev = prev[tokens[n++]];
        }

        if (!_.isUndefined(prev)) {
            return prev;
        }
    }

    return default_value;
}

function parseDistroAndModules() {
    if (PackageManager.distro) {
        return;
    }

    const nconf = require('nconf');
    let distro;
    let distroFolder = process.gulp_init_cwd || process.cwd();

    // Use first argv then .nsdeploy
    nconf.argv().file(path.join(distroFolder, '.nsdeploy'));

    const product = nconf.get('product') || 'Advanced';
    let available_distros = glob.sync(path.join(distroFolder, '*', 'distro.json'));

    available_distros = _.map(available_distros, distro => path.dirname(distro));
    available_distros = _.object(
        _.map(available_distros, distro => path.basename(distro)),
        available_distros
    );

    distroFolder = available_distros[product];
    if (!distroFolder) {
        throw new Error(`Unknown product ${product}`);
    }
    console.log(c.red(`Using ${product} distro.`));
    available_distros = _.keys(available_distros);
    available_distros.length > 1 &&
        console.log(c.red(`Use --product [${available_distros}] to set another one.`));

    nconf.set('product', product);
    try{
        nconf.save();

    }
    catch(e){}

    PackageManager.env = loadEnvironmentVars(distroFolder);
    try {
        distro = jsonlint.parse(fs.readFileSync(PackageManager.env.distro, { encoding: 'utf8' }));
    } catch (err) {
        err.message = 'Error parsing distro file ' + PackageManager.env.distro + ': ' + err.message;
        throw err;
    }

    PackageManager.distro = distro;
    PackageManager.distro.folders.distribution += product;
    PackageManager.distro.folders.deploy += product;

    if (distro.tasksConfig) {
        PackageManager.configuration = distro.tasksConfig;
    }

    _.each(distro.modules, function(module_path) {
        const nsPackageFile = path.join(PackageManager.env.srcDir, module_path, 'ns.package.json');

        if (fs.existsSync(nsPackageFile)) {
            try {
                module_path =
                    module_path.indexOf(distro.folders.thirdPartyModules) !== -1
                        ? path.dirname(module_path)
                        : module_path;

                PackageManager.add(
                    path.basename(module_path),
                    nsPackageFile,
                    jsonlint.parse(fs.readFileSync(nsPackageFile, { encoding: 'utf8' }).toString())
                );
            } catch (err) {
                err.message = 'Error parsing module file ' + nsPackageFile + ': ' + err.message;
                throw err;
            }
        }
    });

    if (!error_logger.isEmpty()) {
        error_logger.flush('+- SUMMARY OF OVERRIDE ERRORS');
        process.exit(1);
    } else if (!override_logger.isEmpty()) {
        override_logger.flush('+- SUMMARY OF OVERRIDES');
    }
}

var PackageManager = {
    contents: [],

    overrides: {
        // index of all override files
        index: {},
        // {originalPath: string, {isOverriden: boolean, overridePath: string, moduleName: string }}
        map: {}
    },

    getOverrideInfo: function(original_file_path) {
        let override_info = this.overrides.map[original_file_path];
        if (!override_info) {
            override_info = { isOverriden: false };
        }

        return override_info;
    },

    isOverrideFile: function(file_path) {
        const normalized_path = path.resolve(file_path);
        return !!this.overrides.index[normalized_path];
    },

    add: function(module_name, file_path, content) {
        const self = this;
        const base_dir = path.dirname(file_path);
        const module_exist = _.some(this.contents, function(module) {
            return module.moduleName === module_name;
        });

        if (module_exist) {
            error_logger.push(
                '+- Module ',
                c.cyan(module_name),
                ' is defined twice. Please use a different name when overriding.'
            );
        }

        this.contents.push({
            path: file_path,
            baseDir: base_dir,
            absoluteBaseDir: path.resolve(process.cwd(), base_dir),
            moduleName: module_name,
            content: content.gulp,
            jshint: content.jshint !== 'false'
        });

        function shortenModulePath(path) {
            if (path.split('Modules').length > 1) {
                return 'Modules' + path.split('Modules')[1];
            }

            return path;
        }
        _.each(content.overrides, function(val, key) {
            const original_path = path.resolve(path.join(path.dirname(self.env.srcDir), key));
            const override_path = path.resolve(path.join(base_dir, val));

            // check for duplicate overrides
            const override_info = self.getOverrideInfo(original_path);
            if (override_info.isOverriden) {
                error_logger.push(
                    '+- ',
                    c.cyan(path.normalize(original_path)),
                    ' is overridden more than once. Overridden in modules: ',
                    c.cyan(override_info.moduleName),
                    ' and ',
                    c.cyan(module_name)
                );
            }

            // check to see if original file exists
            if (!fs.existsSync(original_path)) {
                error_logger.push(
                    '+- Source file: ',
                    c.cyan(original_path),
                    ' does not exists. Defined in module ',
                    c.cyan(module_name)
                );
            }

            // check to see if override file exists
            if (!fs.existsSync(override_path)) {
                error_logger.push(
                    '+- Override file: ',
                    c.cyan('Modules' + override_path.split('Modules')[1]),
                    ' does not exists. Defined in module ',
                    c.cyan(module_name)
                );
            }

            console.log('OVERRIDE', override_path);
            const normalized_path = override_path.replace(/\.ts$/, '.js');
            const normalized_original_path = original_path.replace(/\.ts$/, '.js');
            self.overrides.map[normalized_original_path] = {
                isOverriden: true,
                moduleName: module_name,
                overridePath: normalized_path
            };
            self.overrides.index[normalized_path] = true;

            override_logger.push(
                '+- File: ',
                c.cyan(shortenModulePath(original_path)),
                ' overridden with: ',
                c.cyan(shortenModulePath(override_path))
            );
        });
    },

    handleOverrides: function() {
        const self = this;
        return through(
            function(file) {
                const normalized_path = path.resolve(file.path);
                const is_override_file = !!self.overrides.index[normalized_path];

                if (is_override_file) {
                    self.overrides.index[normalized_path] = file.contents.toString();
                    return;
                }

                const override_info = self.getOverrideInfo(normalized_path);
                if (override_info.isOverriden) {
                    // if original file is overridden replace its stat and content.
                    // stat needs to change for other
                    // gulp-plugins to work properly (i.e. changed)

                    override_info.file = file;
                    override_info.file.stat = fs.statSync(
                        override_info.overridePath.replace(/\.js$/, '.ts')
                    );
                    return;
                }

                this.emit('data', file);
            },
            function() {
                // Emit overriden files
                _.each(self.overrides.map, override => {
                    const content = self.overrides.index[override.overridePath];
                    if (!override.file || !_.isString(content)) {
                        return;
                    }
                    override.file.contents = Buffer.from(content);

                    this.emit('data', override.file);

                    // Undo this to avoid emit more than once
                    self.overrides.index[override.overridePath] = true;
                    delete override.file;
                });

                this.emit('end');
            }
        );
    },

    getGlobsFor: function() {
        const keys = arguments;
        const globs = _.chain(this.contents)
            .map(function(ns_pkg) {
                return this.getGlobsForNSPackage(ns_pkg, keys);
            }, this)
            .flatten()
            .value();

        return _.map(globs, name => name.replace(/\\/g, '/'));
    },

    getGlobsForNSPackage: function(ns_pkg, keys) {
        const pkg_keys = Object.keys(ns_pkg.content || {});
        const key_to_use = _.filter(keys, function(key) {
            return ~pkg_keys.indexOf(key);
        });

        const results = [];
        const value = _.flatten(
            _.map(key_to_use, function(key) {
                return ns_pkg.content[key];
            })
        );

        if (key_to_use && value.length) {
            value.forEach(function(oneglob) {
                results.push(path.join(ns_pkg.baseDir, oneglob));
            });
        }

        return results;
    },

    parseFile: function(file) {
        const fileParts = /\/([a-zA-Z.]+)@.*\/([a-zA-Z.]+.js)/gi.exec(file);
        const fileModule = fileParts[1];
        const fileName = fileParts[2];
        return { file: file, module: fileModule, name: fileName };
    },

    getAutogeneratedServices: function() {
        const keys = ['autogenerated-services'];
        return _.chain(this.contents)
            .map(function(ns_pkg) {
                const pkg_keys = Object.keys(ns_pkg.content || {});
                const key_to_use = _.find(keys, function(key) {
                    return ~pkg_keys.indexOf(key);
                });

                const new_keys = {};
                const values = ns_pkg.content[key_to_use];

                _.each(_.keys(values), function(key) {
                    new_keys[key] = values[key];
                });
                return new_keys;
            }, this)
            .flatten()
            .value()
            .filter(_.identity);
    },

    // @method getContents Getter of 'contents' property
    // @return {Array<{Objects}>} Array of literal objects containing data about modules
    getContents: function() {
        return this.contents;
    },

    getGlobsForModule: function(module) {
        const keys = _.rest(arguments);
        const ns_pkg = _.findWhere(this.contents, { moduleName: module });
        if (!ns_pkg) {
            throw new Error('Module not found: ' + module);
        }
        return this.getGlobsForNSPackage(ns_pkg, keys);
    },

    getFlattenGlobsFor: function(keys, modules, ignoreJsHint) {
        let c = _.chain(this.contents);

        if (!ignoreJsHint) {
            c = c.where({ jshint: true });
        }

        return c
            .filter(function(module) {
                if (!modules) {
                    return true;
                }
                return _.indexOf(modules, module.moduleName) >= 0;
            })
            .map(function(ns_pkg) {
                return this.getGlobsForNSPackage(ns_pkg, keys);
            }, this)
            .flatten()
            .value();
    },

    getNonManageResourcesPath: function() {
        if (this.distro.isSCLite && process.generateAllJavaScript) {
            return path.join(process.gulp_dest, 'default');
        }
        if (this.distro.isSCLite) {
            return path.join(process.gulp_dest, 'tmp');
        }

        return path.join(process.gulp_dest);
    },

    getGlobsForJSHint: function(modules) {
        return this.getFlattenGlobsFor(
            ['javascript', 'ssp-libraries', 'services', 'services:new'],
            modules
        );
    },

    getFilesMapFor: function(key) {
        const result = {};
        this.contents.forEach(function(ns_pkg) {
            ns_pkg.content &&
                ns_pkg.content[key] &&
                Object.keys(ns_pkg.content[key]).length &&
                Object.keys(ns_pkg.content[key]).forEach(function(file_path) {
                    result[path.resolve(ns_pkg.baseDir + '/' + file_path)] =
                        ns_pkg.content[key][file_path];
                });
        });
        return result;
    },

    getTaskConfig: function(path, default_value) {
        return getPathFromObject(this.configuration, path, default_value);
    },

    getLicensePathForModuleName: function(module_id) {
        if (!this.license_paths) {
            const licence_glob = path.join(process.cwd(), 'Modules', '**/*.license');
            this.license_paths = glob.sync(licence_glob);
        }

        const suffix = module_id + '.license';

        const module_license_path = _.find(this.license_paths, function(path) {
            // ends with the module_id.license
            return path.indexOf(suffix, path.length - suffix.length) >= 0;
        });

        return module_license_path;
    },

    _IIFEVariableDeclaration_last_module: null,

    IIFEVariableDeclaration: function(module_name, module_id) {
        // TODO: don't add the SCModulebegin/end markings if we are not in lite.
        const module_license_path = this.getLicensePathForModuleName(module_id);
        let result =
            '\n/*! __SCModuleBegin ' +
            module_id +
            " */\nSCM['" +
            module_id +
            "'] = " +
            module_name;

        if (this._IIFEVariableDeclaration_last_module) {
            result =
                '\n/*! __SCModuleEnd ' +
                this._IIFEVariableDeclaration_last_module +
                '*/\n' +
                result;
        }
        if (module_license_path) {
            const license = fs.readFileSync(module_license_path, { encoding: 'utf8' });
            result = license + result;
        }

        this._IIFEVariableDeclaration_last_module = module_id;

        return result;
    },

    getModuleFolder: function(moduleName) {
        return _.chain(this.contents)
            .findWhere({ moduleName: moduleName })
            .result('baseDir')
            .value();
    },

    getModuleForPath: function(file_path, is_relative) {
        return _.find(this.contents, function(module) {
            const module_path = (is_relative ? module.baseDir : module.absoluteBaseDir) + path.sep;
            return file_path.indexOf(module_path) === 0;
        });
    },

    getProjectMetadata: function() {
        const modules = [];
        _(this.distro.modules).each(function(version, name) {
            modules.push(name + '@' + version);
        });
        const jsEntryPoints = _(this.distro.tasksConfig.javascript).map(function(js) {
            return js.entryPoint;
        });

        return {
            name: this.distro.name,
            version: this.distro.version,
            'javascript entrypoints': jsEntryPoints,
            'ssp-libraries entrypoint': this.distro.tasksConfig['ssp-libraries'].entryPoint,
            modules: modules // .join(', ')
        };
    },

    _getReleaseMetadataPayload: function(cb) {
        let releaseMetadataFile = path.join(this.env.srcDir, 'release.xml');
        if (!fs.existsSync(releaseMetadataFile)) {
            releaseMetadataFile = this.env.release;
        }

        try {
            fs.readFile(releaseMetadataFile, { encoding: 'utf8' }, cb);
        } catch (err) {
            cb(err);
        }
    },

    getReleaseMetadata: function(cb) {
        // keys allowed to be returned from the XML
        const keys = ['name', 'prodbundle_id', 'baselabel', 'version', 'datelabel', 'buildno'];

        this._getReleaseMetadataPayload(function(err, xml) {
            if (err) {
                cb(err);
                return;
            }

            xml2js.parseString(xml, js2Metadata);
        });

        function js2Metadata(err, parsedMetadata) {
            if (err) {
                cb(err);
                return;
            }

            const metadata = _.chain(parsedMetadata)
                .find(_.isObject)
                .result('param')
                .first()
                .value();

            const mappedKeys = _.map(keys, function(key) {
                return _.first(_.result(metadata, key));
            });

            const res = _.object(keys, mappedKeys);

            cb(null, res);
        }
    }
};

PackageManager.pipeErrorHandler = function(error) {
    log(c.red('SOURCE CODE ERROR'));
    if (_(error).keys().length === 0) {
        log(error);
    } else {
        _(error).each(function(val, key) {
            log(c.red(key), val);
        });
    }
    if (PackageManager.isGulpLocal) {
        this.emit('end');
    } else {
        process.exit(1);
    }
};

parseDistroAndModules();

module.exports = PackageManager;
