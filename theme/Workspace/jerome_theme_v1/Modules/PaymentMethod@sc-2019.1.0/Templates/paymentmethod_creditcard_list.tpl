{{#if showBackToAccount}}
	<a href="/" class="paymentmethod-creditcard-list-button-back">
		<i class="paymentmethod-creditcard-list-button-back-icon"></i>
		{{translate 'Back to Account'}}
	</a>
{{/if}}

<!-- 23/08/2019 -->

<section class="paymentmethod-creditcard-list">     
	<h2>{{pageHeader}}</h2>
	<hr class="divider-small">
	<div class="paymentmethod-creditcard-list-button-container">
	<a class="creditcard-list-button" href="/creditcards/new" data-toggle="show-in-modal">{{translate 'Add Credit Card'}}</a>
	</div>
	<div class="paymentmethod-creditcard-list-collection" data-view="CreditCards.Collection"></div>
	<hr>
</section>



{{!----
Use the following context variables when customizing this template:

	pageHeader (String)
	showBackToAccount (Boolean)

----}}
