<style>
.col-wid-20{
    width:20%;
    float: left;
    }
.col-wid-10{
    width: 10%;
    float: left;
}
.col-wid-30{
    width:30%;
    float: left;
}
.col-wid-70{
    width:70%;
    float: left;
}
@media only screen and (max-width: 500px) {
    #favourite_fit_tools .label-fit-profile{
        font-size: 12px;
    }
    #favourite_fit_tools .col-wid-30{
        width: 40%;
    }
    #favourite_fit_tools .col-wid-20{
        width: 30%;
    }
}
</style>
<h2 class="profile-information-header">Favourite Fit Tools</h2>
<hr class="divider-small">
<form id="favourite_fit_tools">

    {{#if options_config}}
    <ul class="nav nav-tabs" id="favourite_fit_tools_us">
        {{#each options_config}}
        {{#ifEquals @index 0}}
        <li class="active">
            {{else}}
        <li>
            {{/ifEquals}}
            <a data-target="#fav-fit-tools-div-{{item_type}}" data-toggle="tab" data-type="{{item_type}}"
                href="{{item_type}}">
                {{item_type}}
            </a>
        </li>
        {{/each}}
    </ul>

    <div class="tab-content">
            <input type="hidden" id="customer_internal_id"  value="{{userInternId}}">
        {{#each options_config}}
        {{#ifEquals @index 0}}
        <div class="tab-pane active fav-fit-tools-{{item_type}}" id="fav-fit-tools-div-{{item_type}}">

            {{else}}
            <div class="tab-pane fav-fit-tools-{{item_type}}" id="fav-fit-tools-div-{{item_type}}">
                {{/ifEquals}}
                {{#if measurement}}

                {{#measureForm measurement 'favourite_fit_tools' '' '' '' true}}
                {{/measureForm}}

                {{/if}}
                <input type="hidden" name="fav-fit-tools-itemtype" value="{{item_type}}">
            </div>
            {{/each}}
        </div>
    </div>
    <div class="form-actions">
        <button class="btn btn-primary" type="submit" style="font-weight:bold;">Submit</button> <!-- zain 02-10-19 -->
        <button data-action="reset" class="btn hide" type="reset">Cancel</button>
    </div>
    {{/if}}

</form>
<!-- <div data-view="GlobalViews.MeasureForm"></div> -->