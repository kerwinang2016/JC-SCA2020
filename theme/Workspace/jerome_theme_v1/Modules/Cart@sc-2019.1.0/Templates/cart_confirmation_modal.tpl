<div class="cart-confirmation-modal">
	<div class="cart-confirmation-modal-img">
		<img data-loader="false" src="{{resizeImage thumbnail.url 'main'}}" alt="{{thumbnail.altimagetext}}">
	</div>
	<div class="cart-confirmation-modal-details" itemscope itemtype="https://schema.org/Product">
		<!-- 20/11/2019 Umar Zulfiqar RFQ:Shopping Cart Confirmation Modal - Show warning on No Fit Profile-->
		{{#if showFitProfileError}}
			<div class="alert alert-danger alert-dismissible fade in">Please note that you have not selected a fit profile(s).</div>
		{{/if}}<!-- End -->
		<a href="{{model.item._url}}" class="cart-confirmation-modal-item-name">{{itemName}}</a>
		<!-- <div class="cart-confirmation-modal-price">
			<div data-view="Line.Price"></div>
		</div> -->
		<!-- SKU -->
		<!-- <div data-view="Line.Sku" class="cart-confirmation-modal-sku"></div> -->
		<!-- Item Options -->
		<!-- <div class="cart-confirmation-modal-options">
			<div data-view="Line.SelectedOptions"></div>
		</div> -->
		<!-- Quantity -->
		{{#if showQuantity}}
			<!-- <div class="cart-confirmation-modal-quantity">
				<span class="cart-confirmation-modal-quantity-label">{{translate 'Quantity: '}}</span>
				<span class="cart-confirmation-modal-quantity-value">{{model.quantity}}</span>
			</div> -->
		{{/if}}
		<div class="cart-confirmation-modal-actions">
			<div class="cart-confirmation-modal-view-cart">
				<a href="/cart" class="cart-confirmation-modal-view-cart-button">{{translate 'View Order &amp; Process'}}</a>
			</div>
			<div class="cart-confirmation-modal-continue-shopping">
				<a href="/item-type?client={{clientId}}" class="cart-confirmation-modal-continue-shopping-button" data-dismiss="modal" data-hashtag="#/item-type?client={{clientId}}" data-touchpoint="home"> Continue Ordering</a> <!--salman 02-10-19-->
			</div>
			<div class="cart-confirmation-modal-continue-shopping">
				<!-- 16/12/2019 saad -->
				<a href="/fitprofile" class="cart-confirmation-modal-view-cart-button" data-dismiss="modal" data-hashtag='#/fitprofile' data-touchpoint='home'> Continue Ordering with New Client</a>
			</div>
			
		</div>
	</div>
</div>



{{!----
Use the following context variables when customizing this template: 
	
	model (Object)
	model.item (Object)
	model.item.internalid (Number)
	model.quantity (Number)
	model.options (Array)
	model.options.0 (Object)
	model.options.0.cartOptionId (String)
	model.options.0.itemOptionId (String)
	model.options.0.label (String)
	model.options.0.type (String)
	model.options.0.value (Object)
	model.options.0.value.internalid (String)
	model.options.0.value.label (String)
	model.location (String)
	model.fulfillmentChoice (String)
	thumbnail (Object)
	thumbnail.altimagetext (String)
	thumbnail.url (String)
	showQuantity (Boolean)
	itemName (String)

----}}
