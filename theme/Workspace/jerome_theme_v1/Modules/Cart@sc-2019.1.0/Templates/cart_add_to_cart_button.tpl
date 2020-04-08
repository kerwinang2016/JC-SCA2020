{{#if isCurrentItemPurchasable}}
	<div class="cart-add-to-cart-button-container">
		<div class="cart-add-to-cart-button">
			<button data-type="add-to-cart"  class="cart-add-to-cart-button-button">
				{{#if isUpdate}}{{translate 'Update'}}{{else}}{{translate 'ADD TO ORDER'}}{{/if}}
			</button/>
		</div>
	</div>
{{/if}}

<!-- Start error modal window-->
<button id="show-error-cart-modal-btn" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#show-error-cart-modal"
    style="display: none;">Modal Butt</button>

<div style="opacity: 1;overflow: visible;padding-top: 150px;" class="fade modal" id="show-error-cart-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"> <!-- zain 22-08-19 -->
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button id="show-error-cart-modal-close" type="button" class="close" data-dismiss="modal"
					aria-hidden="true">&times;</button>
				<h3 id="show-error-cart-modal-header" class="modal-title global-views-modal-content-header"></h3>
			</div>
			<div id="show-error-cart-modal-body" class="modal-body"></div>
			<div class="show-error-cart-modal-footer" style="display: none;">
				<button id="butt-modal-close" type="button" class="btn-u btn-u-sea-shop btn-block" data-dismiss="modal"
					style="width: auto;">Close</button>
			</div>
		</div>
	</div>
</div>
<!-- End error modal window-->

{{!----
Use the following context variables when customizing this template: 
	
	isCurrentItemPurchasable (Boolean)
	isUpdate (Boolean)

----}}
