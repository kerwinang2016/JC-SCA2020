<style>
	@media (max-width: 1199px){
table.order-history-list-recordviews-actionable-table td {display: static !important;}
	}
</style>
{{#if showBackToAccount}}
	<a href="/" class="order-history-list-button-back">
		<i class="order-history-list-button-back-icon"></i>
		{{translate 'Back to Account'}}
	</a>
{{/if}}
<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
<section class="order-history-list">
	<header class="order-history-list-header">
		<h2>{{pageHeader}}</h2>

		<img id="searchhint" src="https://checkout.na2.netsuite.com/c.3857857/myaccount/img/info_icon.gif" class="weboption-tooltip ox-tooltip-icon tooltipstered" data-toggle="tooltip" data-original-title="Example:<br/>Searching orders: SO-XXXX <br/> Searching clients: Client Name" data-html="true">
		<div class="inner-addon right-addon pull-right">
			<form class="form-search">
				<div class=" input-append inner-addon right-addon pull-right" style="width: 68%;margin-right: 17px;margin-top: 3px;">
					<input type="search" class="form-control" placeholder="Search" name="keywords" autocomplete="off" maxlength="40" rel="search" value="{{searchvalue}}">
					<i class="fa fa-search" style="top: 5px;right: 0;"></i>
					<!--zain 04-07-19 (2) start-->
					<button type="submit" class="btn" rel="search" style="position: absolute;right: 0;top: 1px;height: 30px;opacity: 0;">
					</button><!--zain 04-07-19 (2) end-->

				</div>

			</form>
		</div>
		<!-- 22-06-2019 -->

	</header>
	<div class="orderfilters collapsed fa"type="button" data-toggle="collapse" data-target="#orderfilters" aria-expanded="false" aria-controls="orderfilters">
    Filters
  </div>
	<div class="collapse" id="orderfilters">
		<div class="list-header-view-datepicker-from">
			<div class="list-header-view-datepicker-container-input">
				<input class="list-header-view-accordion-body-input" id="from" name="from" type="date"
				autocomplete="off" data-format="dd/mm/yyyy" value="{{startdate}}" data-todayhighlight="true"
				placeholder="dd/mm/yyyy"/>
				<i class="list-header-view-accordion-body-calendar-icon" style="padding:8px;"></i>
				<a class="list-header-view-accordion-body-clear" data-action="clear-value">
					<i class="list-header-view-accordion-body-clear-icon"></i>
				</a>
			</div>
		</div>
		<div class="list-header-view-datepicker-to">
			<label class="list-header-view-to" for="to">{{translate 'to'}}</label>

			<div class="list-header-view-datepicker-container-input">
				<input class="list-header-view-accordion-body-input" id="to" name="to" type="date"
				autocomplete="off" data-format="dd/mm/yyyy" value="{{enddate}}" data-todayhighlight="true"
				placeholder="dd/mm/yyyy"/>
				<i class="list-header-view-accordion-body-calendar-icon" style="padding:8px;"></i>
				<a class="list-header-view-accordion-body-clear" data-action="clear-value">
					<i class="list-header-view-accordion-body-clear-icon"></i>
				</a>
			</div>
		</div>
		<div class="list-header-view-cmtstatus">
			<select style="{{#if cmtstatus}}color:#4D5256;{{else}}color:rgba(77,82,86,0.25);{{/if}}" id="filter_cmtstatus" class="cmtstatus">
				<option value="">CMT Status</option>
			  <option value="2" {{#ifEquals cmtstatus '2'}}selected{{/ifEquals}}>In Production</option>
			  <option value="3" {{#ifEquals cmtstatus '3'}}selected{{/ifEquals}}>Shipped</option>
			  <option value="[7,8]" {{#ifEquals cmtstatus '[7,8]'}}selected{{/ifEquals}}>Processed/Confirmed</option>
				<option value="[9,10]" {{#ifEquals cmtstatus '[9,10]'}}selected{{/ifEquals}}>Left Factory/Delivered</option>
			  <option value="14" {{#ifEquals cmtstatus '14'}}selected{{/ifEquals}}>Production Complete</option>
			</select>
		</div>
		<div class="list-header-view-datepicker-cmtdate" style="display:inline-block;margin-left:10px;">
			<div class="list-header-view-datepicker-container-input">
				<input class="list-header-view-accordion-body-input" id="cmtdate" name="cmtdate"
				type="date" autocomplete="off" data-todayhighlight="true" data-format='dd/mm/yyyy'
				placeholder="CMT Date" value="{{cmtdate}}"/>
			</div>
		</div>
		<div style="float:right;">
		<button class="custom-btn" id="searchorders">Search</button>
		<button class="custom-btn" id="clearfilters">Clear</button>
		<button id="sortred" class="custom-btn" style="width:30px;background-image: url(/myaccount/img/red.png);
		background-repeat: no-repeat;
		background-position: center;
		background-color: #e6e6e6;">&nbsp;</button>
		</div>
	</div>
	<!-- <div class="order-history-list-header-nav">
		<div class="order-history-list-header-button-group">
			{{#if openIsActive}}
				<span class="order-history-list-header-button-open-active">{{translate 'Open'}}</span>
			{{else}}
				<a href="/open-purchases" class="order-history-list-header-button-open">{{translate 'Open'}}</a>
			{{/if}}

			{{#if isSCISIntegrationEnabled}}
				{{#if inStoreIsActive}}
					<span class="order-history-list-header-button-instore-active">{{translate 'In Store'}}</span>
				{{else}}
					<a href="/instore-purchases" class="order-history-list-header-button-instore">{{translate 'In Store'}}</a>
				{{/if}}
			{{/if}}

			{{#if allIsActive}}
				<span class="order-history-list-header-button-all-active">{{translate 'All'}}</span>
			{{else}}
				<a href="/purchases" class="order-history-list-header-button-all">{{translate 'All'}}</a>
			{{/if}}
		</div>
	</div> -->

	<!--<div data-view="ListHeader" {{#if openIsActive}}style="display:none;"{{/if}}></div>-->

	<!-- 22-06-19 -->
	{{#if collectionLengthGreaterThan0}}
	<div class="order-history-list-recordviews-container table-responsive"> <!-- zain 18-07-19 -->
		{{#if showPagination}}
		<!-- 23/08/2019 -->
		<div class="order-history-list-case-list-paginator">
			<div data-view="GlobalViews.Pagination"></div>
			<div data-view="GlobalViews.ShowCurrentPage"></div>
			<!-- {{#if showCurrentPage}} -->

			<!-- {{/if}} -->
		</div>
	{{/if}}
	<div>
		<input type="checkbox" id="selectall">  Select All
		<div style="float:right;">
			<button class="custom-btn" id="downloadorders">Download</input>
		</div>
	</div>
	<table class="order-history-list-recordviews-actionable-table">
		<thead class="order-history-list-recordviews-actionable-header">
			<tr>
				<th class="order-history-list-recordviews-actionable-title-header">
					<span>{{translate 'Select'}}</span>
				</th>
				<th class="order-history-list-recordviews-actionable-date-header">
					<span>{{translate 'Date'}}</span>
				</th>
				<th class="order-history-list-recordviews-actionable-date-header">
					<span>{{translate 'Order#'}}</span>
				</th>
				<th class="order-history-list-recordviews-actionable-date-header">
					<span>{{translate 'Client'}}</span>
				</th>
				<th class="order-history-list-recordviews-actionable-date-header">
					<span>{{translate 'Item'}}</span>
				</th>
				<th class="order-history-list-recordviews-actionable-date-header">
					<span>{{translate 'Fabric'}}</span>
				</th>
				<th class="order-history-list-recordviews-actionable-date-header">
					<span>{{translate 'CMT'}}</span>
				</th>
				<th class="order-history-list-recordviews-actionable-date-header">
					<span>{{translate 'Date Needed'}}</span>
				</th>
				{{#if isSCISIntegrationEnabled}}
				{{#unless inStoreIsActive}}
					<th class="order-history-list-recordviews-actionable-origin-header">
						<span>{{translate 'Origin'}}</span>
					</th>
				{{/unless}}
			{{else}}
				<th class="order-history-list-recordviews-actionable-status-header">
					<span>{{translate 'Status'}}</span>
				</th>
			{{/if}}
				<!-- <th class="order-history-list-recordviews-actionable-currency-header">
					<span>{{translate 'Amount'}}</span>
				</th> -->

				<!-- <th class="order-history-list-recordviews-actionable-actions-header">
					<span>{{translate 'Track Items'}}</span>
				</th> -->
				<th class="order-history-list-recordviews-actionable-date-header">
					<span>{{translate 'Flag'}}</span>
				</th>
			<!-- zain 29-07-19 start -->
					<th>
						&nbsp;
					</th>
					<!-- zain 29-07-19 end -->
				</tr>
		</thead>
		<tbody class="order-history-list" data-view="Order.History.Results"></tbody>
		<!-- {{#if clearstauts}}
		<img src="https://checkout.na2.netsuite.com/c.3857857/myaccount/img/clear.png">
		{{else if tranline_status}}
		<img src="https://checkout.na2.netsuite.com/c.3857857/myaccount/img/red.png">
		{{else}}
		<img src="https://checkout.na2.netsuite.com/c.3857857/myaccount/img/green.png">
		{{/if}} -->

	</table>
	</div>
	{{else}}
		{{#if isLoading}}
			<p class="order-history-list-empty">{{translate 'Loading...'}}</p>
		{{else}}
			<div class="order-history-list-empty-section">
				<h5>{{translate 'Your search has zero results.'}}</h5>
			</div>
		{{/if}}

	{{/if}}

	{{#if showPagination}}
	<!-- 23/08/2019 -->
		<div class="order-history-list-case-list-paginator">
			<div data-view="GlobalViews.Pagination"></div>
			<div data-view="GlobalViews.ShowCurrentPage"></div>
			<!-- {{#if showCurrentPage}} -->

			<!-- {{/if}} -->
		</div>
	{{/if}}
</section>

<div class="modal fade" id="modalContainer" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered" role="document">
	  <div class="modal-content">
		<div class="modal-header">
		  <h5 class="modal-title" id="flagdetailstitle">Flag Details</h5>
		</div>
		<div class="modal-body">
		</div>
		<div class="modal-footer">
<!--zain 02-10-19 start-->
		  <button type="button" id="modalContainerSave" class="btn btn-primary">Save changes</button>
		  <button type="button" class="btn btn-secondary custom-btn" data-dismiss="modal" style="padding-left: 10px;padding-right: 10px;">Close</button>
<!--zain 02-10-19 end-->
		</div>
	  </div>
	</div>
</div>

<script>
$(document).ready(function(){
	// var $dates = $('.date_needed_class').datepicker({format:'dd/mm/yyyy'});
	$('.clear-dates').on('click', function () {
		$(this).closest('.recordviews-actionable-date').find('.date_needed_class').datepicker('setDate', null);
	});

});
	</script>	<!-- 02/08/2019 -->
{{!----
Use the following context variables when customizing this template:

	pageHeader (String)
	collectionLengthGreaterThan0 (Boolean)
	isLoading (Boolean)
	showPagination (Boolean)
	showBackToAccount (Boolean)
	isSCISIntegrationEnabled (Boolean)
	allIsActive (Boolean)
	openIsActive (Boolean)
	inStoreIsActive (Boolean)

----}}
