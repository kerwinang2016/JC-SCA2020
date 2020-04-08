{{#if showBreadcrumb}}
<header class="payment-wizard-layout-header">
	<h1 class="payment-wizard-layout-header-title">{{translate 'Make a Payment'}}</h1>
	<div data-view="Wizard.StepNavigation"></div>
	<!--zain 23-07-19 start -->
	<div class="navigate-button">
	<!-- 26/07/2019 -->
		<a href="#/overview" data-touchpoint="customercenter" data-hashtag="#/overview">
		<button class="custom-btn">Go to Account Overview</button>
	</a>
	</div>
	<!--zain 23-07-19 end -->
</header>
{{/if}}
<div id="wizard-content" class="payment-wizard-layout-content"></div>

<!-- zain 22-07-19 start change url DONE-->
<script> 
	$( document ).ready(function() {
	//   var paymentWizard = $(location).attr("href");
	  var paymentWizard = window.location.hash.substr(1);
	//   paymentWizard = paymentWizard.split("/");
	//   paymentWizard = paymentWizard[1];

	 if(paymentWizard == "/make-a-payment"){
$(".header-simplified-header").css({"border-bottom-width": "1px", "border-style": "solid", "border-color": "#e0e0e0"});
$(".myaccount-layout-breadcrumb").css("display", "none");
$(".myaccount-layout-main").css("margin-top", "25px");
$("#site-header").css("box-shadow", "none");

	 }
	});
	
	
	</script>
	<!-- zain 22-07-19 end-->

{{!----
Use the following context variables when customizing this template: 
	
	showBreadcrumb (Boolean)

----}}
