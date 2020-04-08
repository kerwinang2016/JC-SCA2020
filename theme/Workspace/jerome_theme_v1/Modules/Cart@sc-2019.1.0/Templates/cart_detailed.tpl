<style>
#content{
background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #f9f9f9), color-stop(50%, #ffffff), color-stop(50%, #ffffff), color-stop(100%, #ffffff));
}

.container {
    width: 100%;
  }

.panel-default>.panel-heading {
    color: #333;
    background-color: #fff;
    border-color: #e4e5e7;
    padding: 0;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

.panel-default>.panel-heading button {
    display: block;
    padding: 10px 15px;
  }

.panel-default>.panel-heading button:after {
    content: "";
    position: relative;
    top: 1px;
    display: inline-block;
    font-family: 'Glyphicons Halflings';
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    float: right;
    transition: transform .25s linear;
    -webkit-transition: -webkit-transform .25s linear;
  }
  .accordion-option {
    width: 100%;
    float: left;
    clear: both;
    margin: 15px 0;
  }

.accordion-option .title {
    font-size: 20px;
    font-weight: bold;
    float: left;
    padding: 0;
    margin: 0;
  }

.accordion-option .toggle-accordion {
    float: right;
    font-size: 16px;
    color: #6a6c6f;
  }

.accordion-option .toggle-accordion:before {
    content: "Expand All";
  }

.accordion-option .toggle-accordion.active:before {
    content: "Collapse All";
  }
.cart-detailed-footer{
	margin-left: -3px; // zain 17/12/2019
}
.cart-detailed-footer .panel-title{
	font-family: 'Raleway', sans-serif;
    font-weight: 400;
    font-size: 20px;
    color: #a6a6a6;
    line-height: 24px;
}
.cart-detailed-footer #headingOne button{
	padding-left: 0;
    background: none;
    width: 100%;
    text-align: left;
}
.saved-item-btns button{
	margin-left: 8px;
	color: #2A2B2D;
    text-shadow: 1px 1px 1px #f1f1f1;
		background: linear-gradient(to bottom, #f5f5f5, #cccccc);
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    border: 1px solid #d9d9d9;
    font-family: 'Raleway', sans-serif;
    font-weight: 700;
    padding: 4px 12px;
    padding-top: 4px;
    padding-right: 12px;
    padding-bottom: 3px;
    padding-left: 12px;
}
.saved-item-btns button:hover {
background: #ccc;
}
.saved-item-collapse-btn{
	outline: none;
	background: #fefefe;
	margin-bottom: 30px;
	border-bottom: 1px solid #e0e0e0;
	overflow: hidden;
}
.saved-items-button{
	outline: none !important;
	width: 97% !important;
  float: left !important;
}
.saved-items-record{
	width:100%;white-space: nowrap;
}
.saved-items-record th{
	border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0px;
	color: #797a7c;
}
.saved-items-record td{
	padding-top: 15px;
  padding-bottom: 10px;
	padding-right: 0;
	border-bottom: 1px solid #f2f2f2;
}
.saved-items-record td button{
	background: linear-gradient(to bottom, white, #e6e6e6);
	border-radius: 5px;
	border: 1px solid #d9d9d9;
	font-family: 'Raleway', sans-serif;
	padding-top: 4px;
	padding-bottom: 4px;
}
.saved-items-record td button:hover, .saved-items-record td button.btn-primary:hover{
	background: #ccc;
}
.saved-items-record td button.btn-primary{
	background: linear-gradient(to bottom, #f5f5f5, #cccccc);
	color: #2A2B2D;
	text-shadow: 1px 1px 1px #f1f1f1;
	-webkit-border-radius: 5px;
	-moz-border-radius: 5px;
	border-radius: 5px;
	border: 1px solid #d9d9d9;
	font-family: 'Raleway', sans-serif;
	font-weight: 700;
}
.cart-detailed-body .cart-lines-table-middle .cart-lines-price{
	float: right;
	margin-top: -14px;
	border: 1px solid #ccc;
	box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
	padding: 0 21px 0 5px;
}
.cart-detailed-body .cart-lines-table-middle .cart-lines-price .transaction-line-views-price-lead{
  color: black;
}

</style>
	<header class="shopping-cart-header">
		{{#if showLines}} <!--zain 11-09-19 -->
				
			<a class="pull-right btn btn-expanded continue-shopping custom-btn" href="/fitprofile" data-touchpoint="home" data-hashtag="#/fitprofile" style="margin-top: -60px; margin-right: 90px;font-size: 13px;padding: 4px 13px; color: #333333;"> <!-- zain 19-08-19 --> <!-- zain 22-01-2020 -->
				Continue Shopping
			</a>
		{{/if}} <!--zain 11-09-19 -->
			<h1 classs="no-margin-top" style="margin-left: 84px;margin-bottom: 16px; font-weight: normal;font-size: 27px;color: #A6A6A6"> Order List</h1> <!--  zain 17/12/2019 --> <!-- zain 22-01-2020 -->
	</header>
<div class="cart-detailed">
	<!-- <div class="cart-detailed-view-header">
		<header class="cart-detailed-header">
			{{#if showLines}}
			<h1 class="cart-detailed-title">
				{{pageHeader}}
				<small class="cart-detailed-title-details-count">
					{{productsAndItemsCount}}
				</small>
			</h1>
			{{else}}
				<h2 class="cart-detailed-title">{{translate 'Your Shopping Cart is empty'}}</h2>
			{{/if}}
		</header>
	</div> -->



	<div data-cms-area="cart_detailed_cms_area_1" data-cms-area-filters="path"></div>

	<div class="cart-detailed-body"> 
		<section class="{{#if showLines}}cart-detailed-left {{else}}cart-detailed-empty{{/if}}">
			{{#unless showLines}}
				<!-- <div data-view="Quick.Order.EmptyCart"> -->
					<p class="cart-detailed-body-info">
						{{translate 'Continue Ordering on the <a href="/" data-touchpoint="home">Home Page</a>.' }} <!-- zain 26-08-19 --> <!-- zain 11-09-19 -->
					</p>
				</div>
			{{/unless}}

			<!-- <div data-view="Quick.Order"></div> -->

			{{#if showLines}}
			<div class="cart-detailed-proceed-to-checkout-container">
				<a class="cart-detailed-proceed-to-checkout" data-action="sticky" href="#" data-touchpoint="checkout" data-hashtag="#">
					{{translate 'Proceed to Checkout'}}
				</a>
			</div>
			<div data-confirm-message class="cart-detailed-confirm-message"></div>

			<div class="cart-detailed-item-view-cell-actionable-table cart-detailed-table-row-with-border">
				<div data-view="Item.ListNavigable">
				</div>
			</div>

			<!-- <div class="cart-detailed-item-free-info" data-view="FreeGift.Info"></div> -->
			<!-- <div class="cart-detailed-item-free" data-view="Item.FreeGift"></div> -->
			{{/if}}

			<div data-cms-area="cart_detailed_cms_area_2" data-cms-area-filters="path"></div>
		</section>

		{{#if showLines}}
		<section class="cart-detailed-right">
			<div data-view="Cart.Summary"></div>
		</section>
		{{/if}}
		<!-- zain 19-08-19 start -->
		<div class="cart-detailed-footer" style="width: 77%;float: left;">
			<div data-view="SavedForLater" class="cart-detailed-savedforlater"></div>
		</div>
		<!-- zain 19-08-19 end -->
	</div>
	
		
</div>

<script>
	$(document).ready(function () {
  
	  $(".toggle-accordion").on("click", function () {
		var accordionId = $(this).attr("accordion-id"),
		  numPanelOpen = $(accordionId + ' .collapse.in').length;
  
		$(this).toggleClass("active");
  
		if (numPanelOpen == 0) {
		  openAllPanels(accordionId);
		} else {
		  closeAllPanels(accordionId);
		}
	  })
  
	  openAllPanels = function (aId) {
		//console.log("setAllPanelOpen");
		$(aId + ' .panel-collapse:not(".in")').collapse('show');
	  }
	  closeAllPanels = function (aId) {
		//console.log("setAllPanelclose");
		$(aId + ' .panel-collapse.in').collapse('hide');
		}
		
		// $( "#design-option" ).accordion();
		$('.accordion-toggle').on('click', function(event){
    	event.preventDefault();
    	// create accordion variables
    	var accordion = $(this);
    	var accordionContent = accordion.next('.accordion-content');
    	
    	// toggle accordion link open class
    	accordion.toggleClass("open");
    	// toggle accordion content
    	accordionContent.slideToggle(250);
    	
    });
	});

	var linkCart =  window.location.href;
	var domain = SC.ENVIRONMENT.embEndpointUrl.data.domain;
if  (linkCart == "http://"+domain+"/cart"){
	$(".shopping-layout-breadcrumb").css("display", "block");
}

  </script>
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
	showLines (Boolean)
	lines (Array)
	productsAndItemsCount (String)
	productCount (Number)
	itemCount (Number)
	pageHeader (String)

----}}
