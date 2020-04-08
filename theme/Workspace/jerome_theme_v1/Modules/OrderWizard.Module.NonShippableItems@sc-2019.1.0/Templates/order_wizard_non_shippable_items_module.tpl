{{#if showNonShippableLines}}
<div class="order-wizard-non-shippable-items-module">
	<div class="order-wizard-non-shippable-items-module-accordion-divider">
		<div class="order-wizard-non-shippable-items-module-accordion-head">
			<a class="order-wizard-non-shippable-items-module-accordion-head-toggle-secondary {{#unless showOpenedAccordion}}collapsed{{/unless}}" data-toggle="collapse" data-target="#accordion-body-nonshipable-items" aria-expanded="true" aria-controls="accordion-body-nonshipable-items">
				<div class="order-wizard-non-shippable-items-module-accordion-head-title-container">
					<span class="order-wizard-non-shippable-items-module-accordion-head-info">
						{{#if showCustomTitle}}
							{{title}}
						{{else}}
							{{ translate 'Order Detail' }} <!-- zain 26-08-19 -->
						{{/if}}
					</span>
					<i class="order-wizard-non-shippable-items-module-accordion-toggle-icon-secondary"></i>
					<span class="order-wizard-non-shippable-items-module-accordion-head-count">
						({{ nonShippableLinesLength }})
					</span>
				</div>
			</a>
		</div>
		<div class="order-wizard-non-shippable-items-module-accordion-body collapse {{#if showOpenedAccordion}}in{{/if}}" id="accordion-body-nonshipable-items" role="tabpanel" data-target="accordion-body-nonshipable-items">
			<div class="order-wizard-non-shippable-items-module-accordion-container" data-content="order-items-body">
				<div class="order-wizard-non-shippable-items-module-multishipto-package">
					<table class="{{#if showMobile}}lg2sm-first{{/if}} order-wizard-non-shippable-items-module-headers-table">
						{{#if showTableHeader}}
						<thead class="order-wizard-non-shippable-items-module-headers-table-header">
							<tr>
								<th class="order-wizard-non-shippable-items-module-header-img"></th>
								<th class="order-wizard-non-shippable-items-module-header-details"><b>{{translate 'Items'}}</b></th>
								<th class="order-wizard-non-shippable-items-module-header-unit-price">&nbsp;</th>
								<th class="order-wizard-non-shippable-items-module-header-qty">&nbsp;</th>
								<th class="order-wizard-non-shippable-items-module-header-amount"><b>{{translate 'Total'}}</b></th>
							</tr>
						</thead>
						{{/if}}
						<tbody data-view="NonShippableItems.Collection"></tbody>
					</table>
				</div>
				{{#if showEditCartButton}}
					<div class="order-wizard-non-shippable-items-module-edit-cart-link-container">
						<a href="#" class="order-wizard-non-shippable-items-module-edit-cart-link" data-action="edit-module" data-touchpoint="viewcart">
							{{translate 'Edit Order'}} <!-- zain 26-08-19 -->
						</a>
					</div>
				{{/if}}
			</div>
		</div>
	</div>
</div>
{{/if}}


{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
