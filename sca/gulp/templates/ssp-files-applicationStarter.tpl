if(!window.loadedResourcesPromises){
    require(["{{starterName}}"]);
    {{{afterapplicationstarts}}}
} else {

    Deferred.all(window.loadedResourcesPromises)
        .done(function(){
        {{#if is_shopping}}
            try
            {
        {{/if}}
                require(["{{starterName}}"]);
                {{{afterapplicationstarts}}}
        {{#if is_shopping}}
            }
            catch(e)
            {
                document.getElementById('main').style.display = "block";
            }
        {{/if}}
        });
}
