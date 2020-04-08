<div data-cms-area="cart_summary_cms_area_1" data-cms-area-filters="path"></div>

<div class="cart-summary">
	<div class="cart-summary-container">
		<h3 class="cart-summary-title">
			{{translate 'Order Summary'}}
		</h3>

		{{#if isPriceEnabled}}
			<div class="cart-summary-subtotal">
				<p class="cart-summary-grid-float">
					<span class="cart-summary-amount-subtotal">
						{{#if linesTotal}}
							{{currencSymbol}}{{linesTotal}}
						{{else}}
						{{currencSymbol}} 0.00
						{{/if}}
					</span>
					{{#if isSingleItem}}
						{{translate 'Subtotal <span class="cart-summary-item-quantity-subtotal">$(0) item</span>'itemCount}}
					{{else}}
						{{translate 'Subtotal <span class="cart-summary-item-quantity-subtotal">$(0) items</span>' itemCount}}
					{{/if}}
				</p>
				
			</div>	
		{{/if}}
	</div>

	<div data-cms-area="cart_summary_cms_area_2" data-cms-area-filters="path"></div>

	{{#if showActions}}
		<div class="cart-summary-button-container">
			<!-- <a style="padding-top:14px;padding-bottom:12px;margin-bottom:7px;" id="btn-proceed-checkout" class="cart-summary-button-proceed-checkout {{#if showProceedButton}} cart-summary-button-proceed-checkout-sb {{/if}}" href="#" data-touchpoint="checkout" data-hashtag="#"> -->
				<a style="padding-top:14px;padding-bottom:12px;margin-bottom:7px;" id="btn-proceed-checkout" class="cart-summary-button-proceed-checkout {{#if showProceedButton}} cart-summary-button-proceed-checkout-sb {{/if}}" > 
				<b>{{translate 'PROCESS ORDER'}}</b> <!--zain 11-09-19 -->
			</a>
			<a style="padding-top:14px;padding-bottom:12px;" id="btn-download-pdf" class="cart-summary-button-proceed-checkout"  >
				{{translate 'Download PDF quote'}}
			</a>

			{{#if showPaypalButton}}
				<div class="cart-summary-btn-paypal-express">
					<a href="#" data-touchpoint="checkout" data-hashtag="#" data-parameters="paypalexpress=T">
						<img src="{{paypalButtonImageUrl}}" class="cart-summary-btn-paypal-express-image" alt="PayPal Express" />
					</a>
				</div>
			{{/if}}

			{{#if isWSDK}}
				<a class="cart-summary-continue-shopping" href="{{continueURL}}">
					{{translate 'Continue Shopping'}}
				</a>
			{{/if}}
		</div>
	{{/if}}
</div>

<div data-cms-area="cart_summary_cms_area_3" data-cms-area-filters="path"></div>


{{!----
Use the following context variables when customizing this template:

	model (Object)
	model.addresses (Array)
	model.addresses.0 (Object)
	model.addresses.0.zip (String)
	model.addresses.0.country (String)
	model.addresses.0.company (undefined)
	model.addresses.0.internalid (String)
	model.shipmethods (Array)
	model.lines (Array)
	model.lines.0 (Object)
	model.lines.0.item (Object)
	model.lines.0.item.internalid (Number)
	model.lines.0.item.type (String)
	model.lines.0.quantity (Number)
	model.lines.0.internalid (String)
	model.lines.0.options (Array)
	model.lines.0.location (String)
	model.lines.0.fulfillmentChoice (String)
	model.paymentmethods (Array)
	model.internalid (String)
	model.confirmation (Object)
	model.confirmation.addresses (Array)
	model.confirmation.shipmethods (Array)
	model.confirmation.lines (Array)
	model.confirmation.paymentmethods (Array)
	model.multishipmethods (Array)
	model.lines_sort (Array)
	model.lines_sort.0 (String)
	model.latest_addition (undefined)
	model.promocodes (Array)
	model.ismultishipto (Boolean)
	model.shipmethod (undefined)
	model.billaddress (undefined)
	model.shipaddress (String)
	model.isPaypalComplete (Boolean)
	model.touchpoints (Object)
	model.touchpoints.logout (String)
	model.touchpoints.customercenter (String)
	model.touchpoints.serversync (String)
	model.touchpoints.viewcart (String)
	model.touchpoints.login (String)
	model.touchpoints.welcome (String)
	model.touchpoints.checkout (String)
	model.touchpoints.continueshopping (String)
	model.touchpoints.home (String)
	model.touchpoints.register (String)
	model.touchpoints.storelocator (String)
	model.agreetermcondition (Boolean)
	model.summary (Object)
	model.summary.discounttotal_formatted (String)
	model.summary.taxonshipping_formatted (String)
	model.summary.taxondiscount_formatted (String)
	model.summary.itemcount (Number)
	model.summary.taxonhandling_formatted (String)
	model.summary.total (Number)
	model.summary.tax2total (Number)
	model.summary.discountedsubtotal (Number)
	model.summary.taxtotal (Number)
	model.summary.discounttotal (Number)
	model.summary.discountedsubtotal_formatted (String)
	model.summary.taxondiscount (Number)
	model.summary.handlingcost_formatted (String)
	model.summary.taxonshipping (Number)
	model.summary.taxtotal_formatted (String)
	model.summary.totalcombinedtaxes_formatted (String)
	model.summary.handlingcost (Number)
	model.summary.totalcombinedtaxes (Number)
	model.summary.giftcertapplied_formatted (String)
	model.summary.shippingcost_formatted (String)
	model.summary.discountrate (String)
	model.summary.taxonhandling (Number)
	model.summary.tax2total_formatted (String)
	model.summary.discountrate_formatted (String)
	model.summary.estimatedshipping (Number)
	model.summary.subtotal (Number)
	model.summary.shippingcost (Number)
	model.summary.estimatedshipping_formatted (String)
	model.summary.total_formatted (String)
	model.summary.giftcertapplied (Number)
	model.summary.subtotal_formatted (String)
	model.options (Object)
	isWSDK (Boolean)
	continueURL (String)
	showActions (Boolean)
	showLabelsAsEstimated (Boolean)
	summary (Object)
	summary.discounttotal_formatted (String)
	summary.taxonshipping_formatted (String)
	summary.taxondiscount_formatted (String)
	summary.itemcount (Number)
	summary.taxonhandling_formatted (String)
	summary.total (Number)
	summary.tax2total (Number)
	summary.discountedsubtotal (Number)
	summary.taxtotal (Number)
	summary.discounttotal (Number)
	summary.discountedsubtotal_formatted (String)
	summary.taxondiscount (Number)
	summary.handlingcost_formatted (String)
	summary.taxonshipping (Number)
	summary.taxtotal_formatted (String)
	summary.totalcombinedtaxes_formatted (String)
	summary.handlingcost (Number)
	summary.totalcombinedtaxes (Number)
	summary.giftcertapplied_formatted (String)
	summary.shippingcost_formatted (String)
	summary.discountrate (String)
	summary.taxonhandling (Number)
	summary.tax2total_formatted (String)
	summary.discountrate_formatted (String)
	summary.estimatedshipping (Number)
	summary.subtotal (Number)
	summary.shippingcost (Number)
	summary.estimatedshipping_formatted (String)
	summary.total_formatted (String)
	summary.giftcertapplied (Number)
	summary.subtotal_formatted (String)
	itemCount (Number)
	isSingleItem (Boolean)
	isZipCodeRequire (Boolean)
	showEstimate (Boolean)
	showHandlingCost (Boolean)
	showGiftCertificates (Boolean)
	showPromocodeForm (Boolean)
	giftCertificates (Array)
	showDiscountTotal (Boolean)
	defaultCountry (String)
	isDefaultCountryUS (Boolean)
	countries (Array)
	singleCountry (Boolean)
	singleCountryCode (String)
	shipToText (String)
	singleCountryName (String)
	shippingZipCode (String)
	showPaypalButton (Boolean)
	paypalButtonImageUrl (String)
	showProceedButton (Boolean)
	urlLogin (String)
	isPriceEnabled (Boolean)
	showPickupInStoreLabel (Boolean)
	areAllItemsPickupable (Boolean)

----}}
