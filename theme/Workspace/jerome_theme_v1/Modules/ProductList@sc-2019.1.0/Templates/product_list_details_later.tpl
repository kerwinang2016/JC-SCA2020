<style>
	#content {
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

	.cart-detailed-footer {
		margin-left: -14px;
	}

	.cart-detailed-footer .panel-title {
		font-family: 'Raleway', sans-serif;
		font-weight: 400;
		font-size: 20px;
		color: #a6a6a6;
		line-height: 24px;
	}

	.cart-detailed-footer #headingOne button {
		padding-left: 0;
		background: none;
		width: 100%;
		text-align: left;
	}

	.saved-item-btns button {
		font-weight: normal;
		font-size: 12px !important;
		background: linear-gradient(to bottom, white, #e6e6e6);
		border-radius: 5px;
		border: 1px solid #d9d9d9;
		font-family: 'Raleway', sans-serif;
		margin: 0px 0px 10px 5px;
	}

	.saved-for-later-filter {
		margin: 0px -7px 0px 0px;
		float: right;
	}

	.saved-item-btns button:hover {
		background: #ccc;
	}

	.saved-item-collapse-btn {
		outline: none;
		background: #fefefe;
		margin-bottom: 30px;
		border-bottom: 1px solid #e0e0e0;
		overflow: hidden;
	}

	.saved-items-button {
		outline: none !important;
		width: 97% !important;
		float: left !important;
	}

	.saved-items-record {
		width: 100%;
		white-space: nowrap;
	}

	.saved-items-record th {
		border-bottom: 1px solid #e0e0e0;
		padding-bottom: 0px;
		color: #797a7c;
	}

	.saved-items-record td {
		padding-top: 15px;
		padding-bottom: 10px;
		padding-right: 0;
		border-bottom: 1px solid #f2f2f2;
	}

	.list-header-view-datepicker-from {
		margin: 0px 10px 0px -10px !important;
	}

	.saved-items-record td button {
		background: linear-gradient(to bottom, white, #e6e6e6);
		border-radius: 5px;
		border: 1px solid #d9d9d9;
		font-family: 'Raleway', sans-serif;
		padding-top: 9px;
		/* zain 29-07-19 */
		padding-bottom: 9px;
		/* zain 29-07-19 */
	}

	.saved-items-record td button:hover,
	.saved-items-record td button.btn-primary:hover {
		background: #ccc;
	}

	.saved-items-record td button.btn-primary {
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

	.cart-detailed-body .cart-lines-table-middle .cart-lines-price {
		float: right;
		margin-top: -14px;
		border: 1px solid #ccc;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
		padding: 0 21px 0 5px;
	}

	.cart-detailed-body .cart-lines-table-middle .cart-lines-price .transaction-line-views-price-lead {
		color: black;
	}
</style>

<div class="product-list-details-later">

	<div class="product-list-details-later-row" data-action="pushable" data-id="cart-save-for-later">
		<div class="product-list-details-later-col">
			<div data-confirm-message class="product-list-details-later-confirm-message"></div>

			<!--accordian start for saved items-->
			<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
				<div class="panel panel-default">
					<div class="panel-heading" role="tab" id="headingOne">
						<h4 class="panel-title saved-item-collapse-btn">
							<button class="saved-items-button" data-toggle="collapse" data-parent="#accordion"
								href="#cart#collapseOne" aria-expanded="true" aria-controls="collapseOne">
								Saved Items
							</button>
							<i class="icon-chevron-down"
								style="float: right;margin-top: 11px;color: #9f9e9e;position:absolute;"></i>
						</h4>
					</div>
					<div id="collapseOne" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
						<div class="panel-body">
							<div class="row-fluid" style="overflow:hidden;">
								<div>
									<!-- zain 02-07-19 -->
									<p>To order an item now, click "Add"</p>
								</div><br />
								<div class="list-header-view-accordion-body-header" style="width: 60%;float:left;">
									<div class="list-header-view-datepicker-from">
										<label class="list-header-view-from" for="from">{{rangeFilterLabel}}</label>

										<div class="list-header-view-datepicker-container-input">
											<input class="list-header-view-accordion-body-input" id="from_save_later"
												name="from" type="date" autocomplete="off" data-format="yyyy-mm-dd"
												data-start-date="{{rangeFilterFromMin}}"
												data-end-date="{{rangeFilterFromMax}}" value="{{selectedRangeFrom}}"
												data-action="range-filter" data-todayhighlight="true"
												placeholder="yyyy-mm-dd" />

											<i class="list-header-view-accordion-body-calendar-icon"></i>
											<a class="list-header-view-accordion-body-clear" data-action="clear-value">
												<i class="list-header-view-accordion-body-clear-icon"></i>
											</a>
										</div>
									</div>

									<div class="list-header-view-datepicker-to">
										<label class="list-header-view-to" for="to">{{translate 'to'}}</label>

										<div class="list-header-view-datepicker-container-input">
											<input class="list-header-view-accordion-body-input" id="to_save_later"
												name="to" type="date" autocomplete="off" data-format="yyyy-mm-dd"
												data-start-date="{{rangeFilterToMin}}"
												data-end-date="{{rangeFilterToMax}}" value="{{selectedRangeTo}}"
												data-action="range-filter" data-todayhighlight="true"
												placeholder="yyyy-mm-dd" />

											<i class="list-header-view-accordion-body-calendar-icon"></i>
											<a class="list-header-view-accordion-body-clear" data-action="clear-value">
												<i class="list-header-view-accordion-body-clear-icon"></i>
											</a>
										</div>
									</div>
								</div>
								<div style="width: 40%;float:left;" class="saved-item-accordian-input1">
									<input style="width: 44%;float: left;" type="text"
										placeholder="Filter by client name" name="swx_filter_save_for_later_client"
										id="swx_filter_save_for_later_client">
									<select
										style="float: left;margin-left: 9px;height: 32px;padding: 0px 37px 0px 6px;background-size: 20px;"
										name="filter_fitter" id="filter_fitter">
										<option value="-1">Filter by fitter name</option>
										{{#if fitterDetailObjectArr}}
										{{#each fitterDetailObjectArr}}
										<option value="{{fitterId}}">{{fitterName}}</option>
										{{/each}}
										{{/if}}
									</select>
								</div>
							</div>
							<div class="row-fluid">
								<div style="width:37%;float: left;" class="saved-item-btns">
									<!-- zain 02-07-19 -->
									<button id="swx-butt-save-for-later-filter">Filter</button>
									<button id="swx-butt-save-for-later-filter-clear">Clear</button>
									<button data-action="archive">Archive</button>
									<button data-action="add-items-to-cart"
										id="add-multiple-save-for-later">Add</button>
								</div>
								<div class="archived-items saved-for-later-filter">
									<label style="display:inline;">Show archived Items</label><input
										style="margin-left:20px;" id="show-archived-items"
										data-action="show-archived-items" type="checkbox">
								</div>
								<div class="inactive-items saved-for-later-filter">
									<label style="display:inline;">Show Inactive Items</label><input
										style="margin-left:20px;" id="show-inactive-items"
										data-action="show-inactive-items" type="checkbox">
								</div>
							</div>
							<div class="row-fluid saved-item-table">
								<!-- zain 29-07-19 -->
								<!-- zain 02-07-19 start -->
								<!-- <table class="saved-items-record">
									<thead>
										<tr>
											<th><b>Date</b></th>
											<th><b>Client</b></th>
											<th><b>Item</b></th>
											<th><b>Comment</b></th>
											<th><b>&nbsp;</b></th>
											<th><b>&nbsp;</b></th>
											<th><b>&nbsp;</b></th>
											<th><b>&nbsp;</b></th>
										</tr>
									</thead>
								</table> -->
								<!-- zain 02-07-19 end -->
								{{#if hasItems}}
								<div data-view="ProductList.DetailsLater.Collection"></div>
								{{else}}
								<div class="product-list-details-later-header-no-items" style="text-align: center;font-size: large;">
									{{translate 'You don\'t have items in this list yet.'}}
								</div>
								{{/if}}
							</div>
						</div>
					</div>
				</div>
				<!--accordian end for saved items-->

			</div>
		</div>
	</div>




	{{!----
Use the following context variables when customizing this template:

	itemsLength (Number)
	hasItems (Boolean)
	isEmpty (Boolean)
	hasMoreThanOneItem (Boolean)

----}}