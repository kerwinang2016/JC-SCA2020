/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
    'Instrumentation'
,   [
        'SC.Models.Init'
    ,   'ReleaseMetadata'
    ,   'underscore'
    ]
,   function (
        ModelsInit
    ,   ReleaseMetadata
    ,   _
    )
    {
    var logger = {

            info: [],

            flush: function flush(common_data)
            {
                try
                {
                    if (!this.info || !this.info.length)
                    {
                        return;
                    }

                    var product = BuildTimeInf.product.toLowerCase();

                    var url = nlapiResolveURL(
                        'SUITELET'
                    ,   'customscript_' + product + '_loggerendpoint'
                    ,   'customdeploy_' + product + '_loggerendpoint'
                    ,   'external'
                    );

                    var data = {
                        type: product.toUpperCase()
                    ,   info: this._mergeData(this.info, common_data)
                    ,   error: null
                    };

                    nlapiRequestURL(url, JSON.stringify(data), {'Content-Type': 'application/json'}, 'POST');
                }
                catch(error)
                {
                    console.log(JSON.stringify(error));
                }

                this.info = [];
            },

            log: function log(info)
            {
                var product = BuildTimeInf.product.toLowerCase();
                if (product === 'scis' || !info.method_name)
                {
                    return;
                }

                this.info.push({
                    suiteScriptAppVersion: ReleaseMetadata.getVersion()
                ,   extensibilityLayerMethodName: info.method_name
                ,   componentArea: info.componentArea
                })
            },

            _mergeData: function(data, common_data)
            {
                if(!common_data)
                {
                    return data;
                }

                var common_data_map = {
                    'url': {key: 'clientRequestURL', regex: '^https?:\/\/([^\/]*).*$', replace: '$1'}
                };

                return _.map(data, function(info)
                {
                    _.each(common_data, function (value, key)
                    {
                        var mapped_key = common_data_map[key];
                        if(mapped_key)
                        {
                            if(mapped_key.regex && mapped_key.replace)
                            {
                                value = value.replace(new RegExp(mapped_key.regex), mapped_key.replace);
                            }
                            info[mapped_key.key] = value;
                        }
                    });

                    return info;
                });
            }
        };

        return logger;
    }
);
