<h2 class="profile-information-header">Design Options Restriction</h2>
<hr class="divider-small">
<form id="design_option">
    {{#designOptionFields options_config values mode}}
    {{/designOptionFields}}

	<div class="form-actions">
		<button class="btn btn-primary" type="submit" style="font-weight: bold;">Submit</button> <!--zain 02-10-19-->
		<button data-action="reset" class="btn hide" type="reset">Cancel</button>
	</div>
</form>
 