/// <amd-module name="Handlebars.CompilerNameLookup"/>
define("Handlebars.CompilerNameLookup", ["require", "exports"], function (require, exports) {
    "use strict";
    return function (parent, name) {
        if (parent instanceof Backbone.Model) {
            if (name === '__customFieldsMetadata') {
                return parent.__customFieldsMetadata;
            }
            return parent.get(name);
        }
        return parent[name];
    };
});
