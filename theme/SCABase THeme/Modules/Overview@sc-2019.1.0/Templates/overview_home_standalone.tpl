<section class="overview-home-standalone">

  <div class="overview-home-invoices">
    <div class="overview-home-invoices-header">
      <h2 class="overview-home-title">Account Overview</h2>
      <hr>
      <h3 class="overview-home-invoices-title">{{translate 'Recent Invoices'}}</h3>
        <a href="/invoices" data-type="invoices-list" class="overview-home-anchor-invoices-list">
          {{translate 'View Invoices List'}}
        </a>
      </div>
		  <div class="overview-home-invoices-results-container">

            {{#if collectionLengthGreaterThan0}}

            <table class="overview-home-invoices-list-table">
                <thead class="overview-home-content-table">
                    <tr class="overview-home-content-table-header-row">
                        <th class="overview-home-content-table-header-row-title">
                            <span>{{translate 'Invoice No.'}}</span>
                        </th>
                        <th class="overview-home-content-table-header-row-date">
                            <span>{{translate 'Date'}}</span>
                        </th>

                        {{#if isSCISIntegrationEnabled}}

                        <th class="overview-home-content-table-header-row-amount">
                            <span>{{translate 'Amount'}}</span>
                        </th>

                        {{else}}

                        <th class="overview-home-content-table-header-row-amount">
                            <span>{{translate 'Amount'}}</span>
                        </th>
                        <th class="overview-home-content-table-header-row-status">
                            <span>{{translate 'Status'}}</span>
                        </th>

                        {{/if}}
                    </tr>
                </thead>
                <tbody class="overview-home-invoices-list" data-view="Invoices.Results"></tbody>
            </table>

		    {{else}}

            <div class="overview-home-invoices-empty-section">
                <h5>{{translate 'You don\'t have any invoice in your account right now.'}}</h5>
            </div>

    		{{/if}}

		</div>
	</div>
</section>

<section class="overview-home-mysettings">
    <h3>{{translate 'My Settings'}}</h3>
    <div class="overview-home-mysettings-row">
        <div class="overview-home-mysettings-profile">
            <div data-view="Overview.Profile"></div>
        </div>
        <div class="overview-home-mysettings-shipping">
            <div data-view="Overview.Shipping"></div>
        </div>
        <div class="overview-home-mysettings-payment">
            <div data-view="Overview.Payment"></div>
        </div>
    </div>
</section>
<div data-view="Overview.Banner"></div>

{{#if hasCustomerSupportURL}}
	<div class="overview-home-header-links">
		{{translate 'Need Help? Contact <a href="$(0)">Customer Service</a>' customerSupportURL}}
	</div>
{{/if}}



{{!----
Use the following context variables when customizing this template:

	collectionLengthGreaterThan0 (Boolean)
	hasCustomerSupportURL (Boolean)
	customerSupportURL (String)
	firstName (String)
	isSCISIntegrationEnabled (Boolean)
	purchasesPermissions (String)

----}}
