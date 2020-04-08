<section class="facets-facet-browse">
	<div data-cms-area="item_list_banner" data-cms-area-filters="page_type"></div>


	<div class="facets-facet-browse-content">

		<div class="facets-facet-browse-facets" data-action="pushable" data-id="product-search-facets">
			<!-- zain (27-06-19) start -->
			<h2 style="font-weight: normal;">
				Fabric Selection
			</h2>
			<!-- zain 18-07-19 start -->
			<div>
				<div style="width:100%" class="cmt-search pull-left">
					<div class="" data-type="site-search">
						<div class="site-search-content">
							<!-- <form class="site-search-content-form" method="GET" action="/search" data-action="search"> -->
							<div class="site-search-content-input">
								<div data-view="ItemsSeacher">
									<input style="width:230px;" data-type="search-input"
										class="itemssearcher-input typeahead" placeholder="Search" type="search"
										autocomplete="off" id="item-search-key-value" name="keywords"
										maxlength="{{maxLength}}" />
								</div>
								<i class="site-search-input-icon"></i>
								<a class="site-search-input-reset" data-type="search-reset"><i
										class="site-search-input-reset-icon"></i></a>
							</div>
							<button style="right: 97px;z-index: 999;opacity: 0;"
								class="site-search-button-submit custom-btn"
								id="search-item-keyword">{{translate 'GO'}}</button>
							{{#if showCmtBtn}}
							<a class="site-search-button-submit custom-btn" href="{{cmtUrl}}">CMT ITEM</a>
							{{/if}}
							<!-- </form> -->
						</div>
					</div>

				</div>
			</div>
			<!-- zain 18-07-19 end -->
			<!-- zain (27-06-19) end -->

			<div data-cms-area="facet_navigation_top" data-cms-area-filters="page_type"></div>

			{{#if isCategory}}
			<div data-view="Facets.CategorySidebar" class="facets-facet-browse-facets-sidebar"></div>
			{{/if}}

			<div style="margin-top:50px;" class="materials-sidebar-inner" data-view="Facets.FacetedNavigation"
				data-exclude-facets="commercecategoryname,category"></div> <!-- zain 18-07-19 -->

			<div data-cms-area="facet_navigation_bottom" data-cms-area-filters="page_type"></div>
		</div>

		<!--
			Sample of how to add a particular facet into the HTML. It is important to specify the data-facet-id="<facet id>"
			properly <div data-view="Facets.FacetedNavigation.Item" data-facet-id="custitem1"></div>
			 -->

		<div class="facets-facet-browse-results" itemscope="" itemtype="https://schema.org/ItemList">

			{{#if isCategory}}
			<div class="facets-facet-browse-category">
				<!-- zain (18-06-19) start -->
				<!-- <div data-view="Facets.Browse.CategoryHeading"></div> -->
				<!-- zain (18-06-19) end -->
				<div class="mensbanner fa" style="color: #494949;border-bottom: solid 1px black;font-size: 20px;width: 300px;font-weight: bold;line-height: 50px;margin-bottom: 35px;">
					Mens
				</div>
				<div data-view="Facets.CategoryCellsMen">

				</div>

				<button style="border: 0;border-bottom: solid 1px black;font-size: 20px;width: 300px;font-weight: bold;line-height: 50px;background: transparent;color: #494949;border-radius: 0;text-align: left;padding-bottom: 0px;padding-left: 0;clear: both; display: block;margin-bottom: 35px;" type="button" class="btn btn-info" data-toggle="collapse" data-target="#demo2">Womens</button>
				<div id="demo2" class="collapse">
				<div data-view="Facets.CategoryCellsWomen">

				</div>
				</div>
			</div>
			{{/if}}

			<header class="facets-facet-browse-header">

				{{#if showItems}}
				<!-- zain (18-06-19) start -->
				<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
					rel="stylesheet">
				<h3 class="font-style">Fabric Selection</h3>
				<div class="cmt-search pull-left">
					<div class="" data-type="site-search">
						<div class="site-search-content">
							<!-- <form class="site-search-content-form" method="GET" action="/search" data-action="search"> -->
							<div class="site-search-content-input">
								<div data-view="ItemsSeacher">
									<!-- umar RFC-->
									<input data-type="search-input" class="itemssearcher-input typeahead"
										placeholder="Search" type="search" autocomplete="off" id="item-search-key-value1"
										name="keywords" maxlength="{{maxLength}}" />
								</div>
								<i class="site-search-input-icon"></i>
								<a class="site-search-input-reset" data-type="search-reset"><i
										class="site-search-input-reset-icon"></i></a>
							</div>
							<button style="right: 97px;z-index: 999;opacity: 0;"
								class="site-search-button-submit custom-btn"
								id="search-item-keyword">{{translate 'GO'}}</button>
							{{#if showCmtBtn}}
							<a class="site-search-button-submit custom-btn" href="{{cmtUrl}}">CMT ITEM</a>
							{{/if}}
							<!-- </form> -->
						</div>
					</div>

				</div>



				<!-- <h1 class="facets-facet-browse-title" data-quantity="{{total}}">
											{{#if keywords}}
												{{#if isTotalProductsOne}}
													{{translate '1 Result for <span class="facets-facet-browse-title-alt">$(0)</span>' keywords}}
												{{else}}
													{{translate '$(0) Results for <span class="facets-facet-browse-title-alt">$(1)</span>' total keywords}}
												{{/if}}
											{{else}}
												{{#if isTotalProductsOne}}
													{{translate '1 Product'}}
												{{else}}
													{{translate '$(0) Products' total}}
												{{/if}}
											{{/if}}
										</h1> -->

				<!-- zain (18-06-19) end -->

				<nav class="facets-facet-browse-list-header">
					<!-- <div class="facets-facet-browse-list-header-actions" data-view="Facets.ItemListDisplaySelector"></div> -->

					<div class="facets-facet-browse-list-header-expander">
						<button class="facets-facet-browse-list-header-expander-button collapsed" data-toggle="collapse"
							data-target="#list-header-filters" aria-expanded="true" aria-controls="list-header-filters">
							{{translate 'Sort & Filter'}}
							<i class="facets-facet-browse-list-header-expander-icon"></i>
						</button>
					</div>

					{{#if isEmptyList}}
					<div class="facets-facet-browse-empty-items" data-view="Facets.Items.Empty"></div>
					{{/if}}
					<div class="facets-facet-browse-list-header-filters collapse" id="list-header-filters">
						<div class="facets-facet-browse-list-header-filters-wrapper">

							<div class="facets-facet-browse-list-header-filters-row">

								{{#if total}}  <!--04/02/2020-->
									<div class="facets-facet-browse-list-header-filter-column"
										data-view="Facets.ItemListShowSelector">
									</div>	
								{{/if}}
								<!-- <div class="facets-facet-browse-list-header-filter-column" data-view="Facets.ItemListSortSelector">
									</div> -->

								{{#if hasItemsAndFacets}}
								<div class="facets-facet-browse-list-header-filter-column">
									<button class="facets-facet-browse-list-header-filter-facets" data-type="sc-pusher"
										data-target="product-search-facets">
										{{translate 'Narrow By'}}
										<i class="facets-facet-browse-list-header-filter-facets-icon"></i>
									</button>
								</div>
								{{/if}}
							</div>

						</div>
					</div>
					<p class="searchable-vendors">* The following vendors are searchable: AC Shirt, Ariston, Carnet,
						Dormeuil, Drago, Dugdale Bros, Long Wear, Loro Piana, Solbiati, Thomas Mason</p>
					<!--zain 26-08-19 -->

				</nav>
				{{/if}}

			</header>

			<meta itemprop="name" content="{{title}}" />

			<div data-cms-area="facets_facet_browse_cms_area_1" data-cms-area-filters="page_type"></div>

			<div id="banner-section-top" class="content-banner banner-section-top" data-cms-area="item_list_banner_top"
				data-cms-area-filters="path"></div>

			{{#if showItems}}
			<div class="facets-facet-browse-narrowedby" data-view="Facets.FacetsDisplay"></div>

			{{#if isEmptyList}}
			{{else}}
			<div class="facets-facet-browse-pagination no-margin-custom" data-view="GlobalViews.Pagination"></div>
			<div class="facets-facet-browse-items" data-view="Facets.Items"></div>
			<style>
				.my-product-list-btn {
					display: none;
				}
			</style>
			{{/if}}
			{{/if}}
			{{#if showResults}}
			<!-- zain (18-06-19) start -->
			<div class="row-fluid view-body my-product-list-btn">
				<div class="span3">
					<div class="category-cell">
						<div class="category-cell-name">
							<!-- 26/07/2019 --> 
							<a href="/wishlist" data-touchpoint="customercenter" data-hashtag="#wishlist{{client}}" class="custom-btn wishlist-custom-button" style="margin-top: 1px; margin-right: 2px; position:absolute; top:0; right:0;line-height: 12px;">  <!-- 16/12/2019 saad // zain 17-01-2020 20-01-2020 -->
								 My Product List
							</a>
						</div>
					</div>
				</div>
			</div>
			<!-- zain (18-06-19) end -->
			{{/if}}
		</div>

		<div class="facets-facet-browse-pagination" data-view="GlobalViews.Pagination"></div>
	</div>

	<div class="facets-facet-browse-cms-area-2" data-cms-area="facets_facet_browse_cms_area_2"
		data-cms-area-filters="page_type"></div>

	<div id="banner-section-bottom"
		class="content-banner banner-section-bottom facets-facet-browse-banner-section-bottom"
		data-cms-area="item_list_banner_bottom" data-cms-area-filters="page_type"></div>
</section>
<!-- 19-08-19 start -->
<!-- zain 27-06-19 start (change url) -->
<script>
	// zain 20-01-2020 start
var itemtypeSplit;
var itemtype = window.location.href.split('/')[3];
var itemtypeSplit = itemtype.split('?')[0];
if (itemtypeSplit == "item-type"){
	$(".wishlist-custom-button").css("display", "block");
}

var selectItem = window.location.href.split('/')[3];
if (selectItem == "item-type"){
	$(".wishlist-custom-button").css("display", "none");
}
// zain 20-01-2020 end

	var facetPage = window.location.href.split('/')[3];
	facetPage = facetPage.split('?');
	facetPage = facetPage[0];

	var facetPageClothSearch = window.location.href.split('/')[3];
	// facetPageClothSearch = facetPageClothSearch.split('/');
	// facetPageClothSearch = facetPageClothSearch[1];

	var facetPageClrSearch = window.location.href.split('/')[3];
	// facetPageClrSearch = facetPageClrSearch.split('/');
	// facetPageClrSearch = facetPageClrSearch[1];

	var facetPageVendorSearch = window.location.href.split('/')[3];
	// facetPageVendorSearch = facetPageVendorSearch.split('/');
	// facetPageVendorSearch = facetPageVendorSearch[1];
	// zain 02-07-19 start
	var custItem = window.location.href.split('/')[3];
	// custItem = custItem.split('#');
	// custItem = custItem[1];
	// custItem = custItem.split('/');
	// custItem = custItem[0];

	var linkFabric = window.location.href.split('/')[3];
	// alert(linkFabric);

	if (linkFabric == "search" || facetPage == "search" || facetPageClothSearch == "custitem_clothing_type" ||
		facetPageClrSearch == "custitem_fabric_color" || facetPageVendorSearch == "custitem_vendor_name" || custItem ==
		"custitem_clothing_type") {
		// zain 02-07-19 end
		$(".facets-facet-browse-header h3").css("display", "none");
		$(".facets-facet-browse-header .cmt-search").css("display", "none");
		$(".facets-facet-browse-header .facets-facet-browse-list-header").css({
			"float": "left",
			"border": "0"
		});
		$(".facets-item-list-show-selector").css("width", "120px");
		$(".facets-item-list-show-selector").css({
			"top": "0",
			"position": "absolute"
		});
		$(".facets-facet-browse-facets").css({
			"display": "block",
			"width": "20%"
		});
		$(".facets-facet-browse-results").css("width", "80%");
		$(".facets-facet-browse").css("width", "100%");
		$(".fabric-search-input").css({
			"margin-top": "20px",
			"margin-bottom": "2px",
			"height": "40px",
			"border-radius": "4px"
		});
		$(".fabric-search-icon").css({
			"position": "absolute",
			"bottom": "285px",
			"left": "250px",
			"font-size": "22px",
			"color": "#bebaba"
		});
		$(".facets-faceted-navigation-facets-clear").css("padding-left", "15px");
		$(".facets-items-collection-view-cell-span3").css("pointer-events", "none");
		$(".searchable-vendors").css("display", "none"); // zain 26-08-19
	}

	var linkBread = window.location.href;
	var linkBread2 = linkBread.split("/");
	var linkBread3 = linkBread2[3];
	var linkBread4 = linkBread3.split("?");
	var linkBread5 = linkBread4[0];
	// saad 16-01-2020 start
	// if (linkBread5 == "item-type") {
	// 	$(".global-views-breadcrumb li:nth-child(3)").html("Item Types");
		$(".shopping-layout-breadcrumb").css("display", "block");
	// }
	// saad 16-01-2020 end
	var linkFabric = window.location.href;
	var domain = SC.ENVIRONMENT.embEndpointUrl.data.domain;
	if (linkFabric == "http://"+domain+"/search") {
		$(".shopping-layout-breadcrumb").css("display", "block");
	}
</script>
<!-- zain 27-06-19 end -->

<!--19-08-19 end -->


{{!----
Use the following context variables when customizing this template:

	total (Number)
	isTotalProductsOne (Boolean)
	title (String)
	hasItemsAndFacets (Boolean)
	collapseHeader (Boolean)
	keywords (undefined)
	showResults (Boolean)
	isEmptyList (Boolean)
	isCategory (Boolean)
	showItems (Number)

----}}