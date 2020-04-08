<!-- start salman 5/29/2019 -->

<style> 
/**** zain 11-09-19 start ****/
	@media (min-width: 768px){
.modal-dialog {width: 615px !important;}
}
/**** zain 11-09-19 end ****/
.global-views-modal-content{padding: 5px;} /**** 12-09-19 ****/
</style>


<div class="product-details-full">
	<div data-cms-area="item_details_banner" data-cms-area-filters="page_type"></div>

	<header class="product-details-full-header">
		<div id="banner-content-top" class="product-details-full-banner-top"></div>
	</header>
	<!-- zain (18-06-19) start-->
	<!-- <div class="product-details-full-divider-desktop"></div> -->
	<!-- zain (18-06-19) end-->
	<article class="product-details-full-content" itemscope itemtype="https://schema.org/Product">
		<meta itemprop="url" content="{{itemUrl}}">
		<div id="banner-details-top" class="product-details-full-banner-top-details"></div>

		<section class="product-details-full-main-content">
			<div class="product-details-full-content-header">

				<div data-cms-area="product_details_full_cms_area_1" data-cms-area-filters="page_type"></div>

				<h1 class="product-details-full-content-header-title" itemprop="name">{{pageHeader}}</h1>
				<!--zain 05-07-19 sart -->
				{{#if changeFabricUrl}}
					<a class="custom-btn" href="{{changeFabricUrl}}" >Change Fabric</a> <!-- 26/07/2019 --> 

				{{else}}
					<a class="custom-btn" onclick="goBack()" >Change Fabric</a> <!-- 26/07/2019 --> 

				{{/if}}
				<!--zain 05-07-19 end -->
				<hr>			
				<!-- <div class="product-details-full-rating" data-view="Global.StarRating"></div> -->
				<div data-cms-area="item_info" data-cms-area-filters="path"></div>
			</div>
			<div class="span7">
				<div id="default-options-container" class="options-container default-options-container"
					data-type="all-options" data-exclude-options="
						   custcol_designoptions_jacket,
						   custcol_designoptions_overcoat,
						   custcol_designoptions_shirt,
						   custcol_designoptions_trouser,
						   custcol_designoptions_waistcoat">
				</div>
			</div>
			<div class="product-details-full-main-content-left">
				<div class="product-details-full-image-gallery-container">
					<div id="banner-image-top" class="content-banner banner-image-top"></div>
					<div data-view="Product.ImageGallery"></div>
					<div id="banner-image-bottom" class="content-banner banner-image-bottom"></div>

					<div data-cms-area="product_details_full_cms_area_2" data-cms-area-filters="path"></div>
					<div data-cms-area="product_details_full_cms_area_3" data-cms-area-filters="page_type"></div>
				</div>
			</div>

			<div class="product-details-full-main-content-right">
				<div class="product-details-full-divider"></div>

				<div class="product-details-full-main">
					{{#if isItemProperlyConfigured}}
					<form id="product-details-full-form" data-action="submit-form" method="POST">

						{{#if vendorDetails}}
						<div id="vendor-detail-content">
							<h2 class="section-header">Fabric</h2>
							<hr/>
							<div class="accordion" id="fabric-availability">
								<div class="accordion-group">
									<div class="accordion-heading">
										<a class="accordion-toggle" data-toggle="collapse"
											data-target="#fabric-availability-options" data-parent="#fabric-availability">
											Fabric Availability
										<span class="accord-arrow-down">‣</span>
										</a>
									</div>
									<div id="fabric-availability-options" class="accordion-body collapse">
										{{#if vendorDetails.vendorLink}}
										<!-- zain 05-07-19 start -->
										<div class="control-group" style="padding-left:15px;">
											<label class="control-label"
												style="font-size: 13px;font-weight: normal;line-height: 18px;padding-left:0;">Vendor
												Link : </label>
											<a href='{{vendorDetails.vendorLink}}' style="text-decoration:underline;"
												target="_blank">{{vendorDetails.vendorLink}}</a>
										</div>
										{{else}}
										<div class="control-group" style="padding-left:15px;">
											<label class="control-label"
												style="font-size: 13px;font-weight: normal;line-height: 18px;padding-left:0;">Vendor
												File : </label>
											{{#if vendorDetails.vendorFileName}}
												<a href='{{vendorDetails.vendorFile}}' style="text-decoration:underline;"
													target="_blank">{{vendorDetails.vendorFileName}}</a>
											{{else}}
												<a href='{{vendorDetails.vendorFile}}' style="text-decoration:underline;"
													target="_blank">{{vendorDetails.vendorFile}}</a>
											{{/if}}
										</div>
										<!-- zain 05-07-19 end -->
										{{/if}}
										<div class="control-group">
											<label class="control-label"
												style="font-size: 13px;font-weight: normal;line-height: 18px;margin-right:10px;">Checked?</label>
											<label style="font-size: 1em">
												<input type="checkbox" value="" id='chkItem' {{setFabricCheckBox}}>
											</label>
										</div>
									</div>
								</div>
							</div>
							<div class="accordion" id="fabric-cmt">
								<div class="accordion-group">
									<div class="accordion-heading">
										<a class="accordion-toggle" data-toggle="collapse" data-target="#fabric-cmt-options"
											data-parent="#fabric-cmt">
											CMT Fabric
											<span class="accord-arrow-down">‣</span>
										</a>
									</div>
									<div id="fabric-cmt-options" class="accordion-body collapse">
										<div class="control-group">
											<div class="col-md-4">
											<label class="control-label" for="fabric-cmt-vendor"
												style="font-size: 13px;font-weight: normal;line-height: 18px;">Fabric
												Vendor</label></div>
												<div class="col-md-6">
											{{{vendorPickList}}}
										</div>
										</div>

										<!-- zain (19-06-19) start-->
										<div class="control-group" style="display: none;">
											<label class="col-md-4 control-label" for="fabric-cmt-othervendorname"
												style="font-size: 13px;font-weight: normal;line-height: 18px;padding-left: 11px;">*Other
												Fabric Vendor </label>
											<input type="text" value="" name="fabric-cmt-othervendorname"
												id="fabric-cmt-othervendorname" class="input-large col-md-6" style="height: 30px;padding: 5px;margin-left: 15px;min-width: auto;width: 44.5%;"
												value="{{selectedOtherVendor}}">
										</div>
										<!-- zain (19-06-19) end-->
										<div class="control-group">
												<div class="col-md-4">
											<label class="control-label" for="fabric-cmt-collection"
												style="font-size: 13px;font-weight: normal;line-height: 18px;">Fabric Collection {{selectedFabricCollection}}</label>
												</div>
												<div class="col-md-6">
											<input type="text" value="{{selectedFabricCollection}}" name="fabric-cmt-collection"
												id="fabric-cmt-collection" class="input-large">
										</div></div>
										<div class="control-group">
												<div class="col-md-4">
											<label class="control-label" for="fabric-cmt-code"
												style="font-size: 13px;font-weight: normal;line-height: 18px;">Fabric Code</label>
												</div>
												<div class="col-md-6">
											<input type="text" value="{{selectedFabricCode}}" name="fabric-cmt-code" id="fabric-cmt-code"
												class="input-large">
										</div></div>
									</div>
								</div>
							</div>
						</div>
						{{/if}}						


						<section class="product-details-full-info">
							<div id="banner-summary-bottom" class="product-details-full-banner-summary-bottom"></div>
						</section>

						<section data-view="Product.Options"></section>

						<div data-cms-area="product_details_full_cms_area_4" data-cms-area-filters="path"></div>

						<div class="product-details-full-actions-container">
							<div data-view="AddToProductList" class="product-details-full-actions-addtowishlist">
							</div>
						</div>
						
						<div data-view="FitProfile"></div>

						<!-- <div data-view="Product.Sku"></div> -->

						<!-- <div data-view="Product.Price"></div> --> 
						<!-- <div data-view="Quantity.Pricing"></div> -->

						<!-- -----------start---------------- -->
						{{#if clothinType}}
						<h2 style="border-bottom: 1px solid #eee;padding-bottom: 5px;margin-bottom: 10px;margin-top: 35px;">
							{{translate  'Fabric Quantity'}}
						</h2>
						{{else}}
						{{#if isNonInvtItemPart}}
						<h2>{{translate 'Fabric Quantity'}} </h2> <!-- zain 01-10-19 -->
						<hr style="margin-top: 0;" />
						{{/if}}
						{{/if}}
						<div id="quantity" style="margin-bottom:30px;">

							{{#if isNotEqualToGiftCert}}
							<div class="control-group" style="margin-bottom:5px;">
								<label class="control-label"
									style="width: 100px;float: left;font-size: 13px;font-weight: normal;line-height: 18px;">Design</label>
								<div id='extra-quantity-content'>{{{extraQuantityContent}}}</div>
							</div>
							{{#if isNonInvtItemPart}}

							{{#if clothingType}}
								<div><label style="width: 100px;float: left;font-size: 13px;font-weight: normal;line-height: 18px; padding-top: 5px;" for="quantity">{{translate 'Metres'}}</label></div>
							{{else}}
								<div><label style="width: 100px;float: left;font-size: 13px;font-weight: normal;line-height: 18px; padding-top: 5px;" for="quantity">{{translate 'Metres'}}</label></div>
							{{/if}}

							{{/if}}

							<div class="control-group">
								{{#if clothingType}}  <!-- 08/01/2019 -->
								<input style="float: left;" type="number" name="custcol_fabric_quantity" id="quantity" class="input-mini quantity"
									value="1" min="1" readonly>
									
								{{else}}
								{{#if isNonInvtItemPart}}  <!-- 08/01/2019 -->
								<input style="float: left;" type="number" name="custcol_fabric_quantity" id="quantity" class="input-mini quantity" value="{{fabricQuantity}}"
									readonly>
									
								{{/if}}
								{{/if}}
							<!-- 28/08/2019 -->
							<a style="float: left;margin-left: 5px;margin-top: 7px;" data-toggle="show-in-modal" href="/img/FABQTY|Fabric Usage Chart" data-touchpoint="home" data-hashtag="img/FABQTY|Fabric Usage Chart">
								<i style="color:black;" class="fa fa-question-circle"></i>
							</a>
							<!-- 28/08/2019 -->
								{{else}}
								<div class="control-group">
									<input type="hidden" name="custcol_fabric_quantity" id="quantity" value="1">
								</div>
								{{/if}}
						<!-- -----------end---------------- -->
						<div data-view="Product.Stock.Info"></div>

						{{#if isPriceEnabled}}
						<!-- <div data-view="Quantity"></div> -->

						<section class="product-details-full-actions">

							<div class="product-details-full-actions-container">
								<div data-view="MainActionView"></div>

							</div>
							<div class="product-details-full-actions-container">
								<div data-view="AddToProductList" class="product-details-full-actions-addtowishlist">
								</div>

								<div data-view="ProductDetails.AddToQuote"
									class="product-details-full-actions-addtoquote"></div>
							</div>

						</section>
						{{/if}}

						<!-- <div data-view="StockDescription"></div> -->

						<!-- <div data-view="SocialSharing.Flyout" class="product-details-full-social-sharing"></div> -->

						<div class="product-details-full-main-bottom-banner">
							<div id="banner-summary-bottom" class="product-details-full-banner-summary-bottom"></div>
						</div>
					</form>
					{{else}}
					<!-- <div data-view="GlobalViewsMessageView.WronglyConfigureItem"></div> -->
					{{/if}}

					<!-- <div id="banner-details-bottom" class="product-details-full-banner-details-bottom"
						data-cms-area="item_info_bottom" data-cms-area-filters="page_type"></div> -->
				</div>
			</div>

		</section>

		<div data-cms-area="product_details_full_cms_area_5" data-cms-area-filters="page_type"></div>
		<div data-cms-area="product_details_full_cms_area_6" data-cms-area-filters="path"></div>

		<section data-view="Product.Information"></section>

		<div class="product-details-full-divider-desktop"></div>

		<div data-cms-area="product_details_full_cms_area_7" data-cms-area-filters="path"></div>

		<!-- <div data-view="ProductReviews.Center"></div> -->

		<div data-cms-area="product_details_full_cms_area_8" data-cms-area-filters="path"></div>

		<!-- <div class="product-details-full-content-related-items">
			<div data-view="Related.Items"></div>
		</div> -->

		<!-- <div class="product-details-full-content-correlated-items">
			<div data-view="Correlated.Items"></div>
		</div> -->
		<!-- <div id="banner-details-bottom" class="content-banner banner-details-bottom"
			data-cms-area="item_details_banner_bottom" data-cms-area-filters="page_type"></div> -->
	</article>
</div>

<!-- 26/07/2019 -->
<script>
	function goBack() {
		window.history.back();
	}
	
	$(document).ready(function(){
		if(window.fabricQuantity){ //This work on when client edit profile
			jQuery('[name="custcol_fabric_quantity"]').val(fabricQuantity);
		}
	});
	// zain 06-09-19 start
	$("body").on("click",".header-menu-cart-dropdown",function(){
		$(".header-mini-cart").toggleClass("display-trigger");
	});
	// zain 06-09-19 end
	
	// zain 13-09-19 start 
	$(document).ready(function(){
		$("#product-details-full-form h1").html("Fit Profile"); // zain 01-10-19
	});
	// zain 13-09-19 end 
</script>


{{!----
Use the following context variables when customizing this template:

	model (Object)
	model.item (Object)
	model.item.internalid (Number)
	model.item.type (String)
	model.quantity (Number)
	model.options (Array)
	model.options.0 (Object)
	model.options.0.cartOptionId (String)
	model.options.0.itemOptionId (String)
	model.options.0.label (String)
	model.options.0.type (String)
	model.location (String)
	model.fulfillmentChoice (String)
	pageHeader (String)
	itemUrl (String)
	isItemProperlyConfigured (Boolean)
	isPriceEnabled (Boolean)

----}}