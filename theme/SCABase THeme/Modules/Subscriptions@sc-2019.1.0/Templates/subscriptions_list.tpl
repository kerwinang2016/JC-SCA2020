{{#if showBackToAccount}}
	<a href="/" class="subscriptions-list-button-back">
		<i class="subscriptions-list-button-back-icon"></i>
		{{translate 'Back to Account'}}
	</a>
{{/if}}

<section class="subscriptions-list">
	<header class="subscriptions-list-title">
		<h2>{{pageHeader}}</h2>
	</header>


		<div class="subscriptions-list-results-container">
			<table class="subscriptions-list-results-table">
				<thead class="subscriptions-list-actionable-header">
					<tr>
						<th class="subscriptions-list-title-header-details">
							<span>{{translate 'Details'}}</span>
						</th>
						<th class="subscriptions-list-table-header-row-date">
							<span>{{translate 'Last Bill'}}</span>
						</th>
						<th class="subscriptions-list-table-header-row-date">
							<span>{{translate 'Next Bill'}}</span>
						</th>
						<th class="subscriptions-list-title-header-activation-date">
							<span>{{translate 'Activation Date'}}</span>
						</th>
						<th class="subscriptions-list-title-header-status">
							<span>{{translate 'Status'}}</span>
						</th>
					</tr>
				</thead>
				<tbody data-view="Records.Collection" class="subscriptions-list-collection"></tbody>
			</table>

		</div>

		{{#if showPagination}}
			<div class="subscriptions-list-paginator">
				<div data-view="GlobalViews.Pagination"></div>
				{{#if showCurrentPage}}
					<div data-view="GlobalViews.ShowCurrentPage"></div>
				{{/if}}
			</div>
		{{/if}}

</section>




{{!----
Use the following context variables when customizing this template:

	pageHeader (String)
	hasTerms (Boolean)
	isThereAnyResult (Boolean)
	isLoading (Boolean)
	showPagination (Boolean)
	showBackToAccount (Boolean)

----}}
