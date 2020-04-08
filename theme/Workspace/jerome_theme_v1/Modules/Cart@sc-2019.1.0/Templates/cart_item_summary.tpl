{{#if isPriceEnabled}}
<div class="cart-item-summary-item-list-actionable-qty">
	<div class="accordion" id="quantity-options-{{lineId}}">
		<div class="accordion-group">
			<div class="accordion-heading">
				<a class="accordion-toggle" data-toggle="collapse" data-target="#quantity-option-{{lineId}}">
					Fabric Details
					<span class="accord-arrow-down">‣</span>
				</a>
			</div>
			<div id="quantity-option-{{lineId}}" class="accordion-body collapse" style="padding-left:50px;">
				<div>
					<b>{{translate "Fabric Quantity"}} : {{line.quantity}}</b>
				</div>
			</div>
		</div>
	</div>
</div>


{{/if}}




{{!----
Use the following context variables when customizing this template:

	line (Object)
	line.item (Object)
	line.item.internalid (Number)
	line.item.type (String)
	line.quantity (Number)
	line.internalid (String)
	line.options (Array)
	line.location (String)
	line.fulfillmentChoice (String)
	lineId (String)
	isMinusButtonDisabled (Boolean)
	showQuantity (Boolean)
	showComparePrice (Boolean)
	showMinimumQuantity (Boolean)
	minimumQuantity (Number)
	isPriceEnabled (Boolean)

----}}