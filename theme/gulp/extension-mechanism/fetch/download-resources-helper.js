/*jshint esversion: 6 */
'use strict';

var nconf = require('nconf')
,	_ = require('underscore');

var ResourcePromisesHelper = require('./resource-promises-helper')
,   RecordHelper = require('../extension-record-helper')
,   FileServiceClient = require('../client-script/FileServiceClient');

var DownloadResourcesHelper = {

	getManifestFilePromises: async function getManifestFilePromises(manifest)
	{
        let result = await RecordHelper.searchExtensions({manifest: manifest});

        //Get the manifest in order to use its path updated since the one that comes in the activationManifest may be old (generated before a SCEM push)
        const file_service_client = FileServiceClient.getInstance();
        const manifest_file = await file_service_client.getFiles([result.extension_record.manifest_id]);
        manifest.path = manifest_file[0].path;

		return this.downloadFiles(manifest);
	}

,	downloadFiles: function downloadFiles(manifest)
	{
		var allowed_resources = nconf.get('application:application_manifest').extensible_resources
		,	file_promises = [];

		_.each(manifest, function(resource_data, resource)
		{
			if(_.contains(allowed_resources, resource))
			{
				var message_finished = 'Finished downloading ' + resource + ' of ' + manifest.type + ': ' +  manifest.name + '...'
				,	resource_promises;

				switch(resource)
				{
					case 'templates':

						resource_promises = ResourcePromisesHelper.getFilesPromisesForAppResource({
                            manifest: manifest
                        ,	resource: resource
                        ,	message_finished: message_finished
                        });

						file_promises = file_promises.concat(resource_promises);
						break;

					case 'sass':

						resource_promises = ResourcePromisesHelper.getFilesPromisesForResource({
                            manifest: manifest
                        ,	resource: resource
                        ,	message_finished: message_finished
                        });

						file_promises.push(resource_promises);
						break;

					case 'assets':

						resource_promises = ResourcePromisesHelper.getAssetFilesPromises({
                            manifest: manifest
                        ,	resource: resource
                        ,	message_finished: message_finished
                        });

						file_promises.push(resource_promises);
						break;

					case 'skins':

						resource_promises = ResourcePromisesHelper.getSkinFilesPromises({
                            manifest: manifest
                        ,	resource: resource
                        ,	message_finished: message_finished
                        });

						file_promises.push(resource_promises);
						break;
				}
			}
		});

		return file_promises;
	}
};

module.exports = DownloadResourcesHelper;
