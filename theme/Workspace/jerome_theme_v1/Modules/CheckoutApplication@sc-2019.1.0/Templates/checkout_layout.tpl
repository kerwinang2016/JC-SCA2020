<div id="layout" class="checkout-layout">
	<header id="site-header" class="checkout-layout-header" data-view="Header"></header>
	<div id="main-container">
		<div class="checkout-layout-breadcrumb" data-view="Global.Breadcrumb" data-type="breadcrumb"></div>
		<div class="checkout-layout-notifications">
			<div data-view="Notifications"></div>
		</div>
		<!-- Main Content Area -->
		<div id="content" class="checkout-layout-content"></div>
		<!-- / Main Content Area -->
	</div>
	<footer id="site-footer" class="checkout-layout-footer" data-view="Footer"></footer>
</div>

<!-- zain (21-06-19) start (22-07-19 change url DONE)  28-10-19-->
<script>
$( document ).ready(function() {
  var loginPageLink = window.location.hash.substr(1);
  var forgetPageLink = window.location.hash.substr(1);
  if(loginPageLink == "login-register" || loginPageLink == "/login-register" || forgetPageLink == "forgot-password" || forgetPageLink == "/forgot-password"){ // zain 01-11-19
					   
	$(".checkout-layout-header").css("display","none");
  }
  
  var forgetPasswordPageLink = $(location).attr("href");
  if(forgetPasswordPageLink == "https://checkout.na2.netsuite.com/c.3857857/sca-dev-2019-1/checkout.ssp?whence=&is=login&login=T&n=3#/forgot-password"){
  $(".checkout-layout-header").css("display","none");
  }
  var billingPageCheckout2 = $(location).attr("href");
			 if(billingPageCheckout2 == "https://checkout.na0.netsuite.com/c.3857857_SB2/scadev2018/checkout-local.ssp?is=checkout&n=2#billing?force=true"){
				$("#wizard-content").css("display","none");
			 }
});


</script>
<!-- zain (21-06-19) end -->



{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
