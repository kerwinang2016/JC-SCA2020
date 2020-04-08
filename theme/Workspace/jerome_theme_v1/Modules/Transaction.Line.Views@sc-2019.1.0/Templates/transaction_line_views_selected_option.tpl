<!-- <div class="transaction-line-views-selected-option" name="{{label}}"> -->

	{{#if isProductType}}
		<p>
			<span class="transaction-line-views-selected-option-label">{{label}}: </span>
			<span class="transaction-line-views-selected-option-value">{{selectedValue.label}}</span>
		</p>
	{{/if}}

	{{#if isclientName}}
		<p>
			<span class="transaction-line-views-selected-option-label">{{label}}: </span>
			<span class="transaction-line-views-selected-option-value">{{selectedValue.label}}</span>
		</p>
	{{/if}}
	<!-- 29/09/2019 saad-->
	{{#if flagComment}}
	<p>
		<span class="transaction-line-views-selected-option-label">{{label}}: </span>
		<span class="transaction-line-views-selected-option-value">{{selectedValue.label}}</span>
	</p>
	{{/if}}
	<!-- 29/09/2019 saad-->
	{{#if isclientNameFlag}}
		<p>
			<span id="client-name-label-{{lineId}}" class="transaction-line-views-selected-option-label">Client Name:</span>
			<span id="client-name-value-{{lineId}}" class="transaction-line-views-selected-option-value transaction-line-views-selected-client-name-value-{{lineId}}" ></span>
		</p>
	{{/if}}

	{{#if isExpectedDate}}
		{{#if isProductList}}
		<div class="name"> <!-- JHD-10 -->
			{{translate 'Estimated Delivery Date:' }} <!-- JHD-23 -->
			<span id="expected-date-{{lineId}}" >{{selectedValue.label}}</span>
		</div>
		{{/if}}
	{{/if}}


	{{#if isExpectedDateFlag}}
		{{#if isProductList}}
		<div class="name"> <!-- JHD-10 -->
			{{translate 'Estimated Delivery Date:' }} <!-- JHD-23 -->
			<span id="expected-date-calculate-{{lineId}}" class="transaction-line-views-selected-expected-date-{{lineId}}"></span>
		</div>
		{{/if}}
	{{/if}}

	{{#if isDateNeeded}}
		{{#if isProductList}}
			<label for="custcol_avt_date_needed" class="date-needed-custom-class">
				<span style = "float:left;">{{translate 'Date Needed:'}} </span>  <!-- zain 17/12/2019 -->
				<input data-provide="datepicker" class="cart-date-need-input date-needed-cart col-md-6"
				data-internalid="{{lineId}}" id="custcol_avt_date_needed_{{lineId}}" placeholder="{{translate 'yyyy-mm-dd'}}" value="{{selectedValue.label}}" name="custcol_avt_date_needed" > <!-- zain 17/12/2019 -->
			</label>
		{{/if}}
	{{/if}}

	{{#if isShowDesignOption}}
		<!-- zain (19-06-19) start -->
		<div class="accordion-container">
			<a href="#" class="accordion-toggle">Design Options
				<span class="accord-arrow-down">‣</span>
			</a>
			<div class="accordion-content design-option-id-{{lineId}}" id="design-option-{{lineId}}">
				{{{designOptionsHtmlContent}}}
			</div>
		</div>
	{{/if}}

	{{#if isShowFitProfile}}
		<div class="accordion-container">
			<a href="#" class="accordion-toggle">Fit Profile
				<span class="accord-arrow-down">‣</span>
			</a>
			<div class="accordion-content fitprofile-option-id-{{lineId}} fit-profile-accordian" id="fitprofile-option-{{lineId}}"> <!-- zain 06-09-19 -->
				{{{fitProfileOptionHtmlContent}}}
			</div>
		</div>
	{{/if}}

	{{#if isFabricQty}}

		<div class="accordion-container">
			<a href="#" class="accordion-toggle">Fabric Quantity <!--zain 28-10-19-->
				<span class="accord-arrow-down">‣</span>
			</a>
			<div class="accordion-content quantity-options-{{lineId}}" id="quantity-options-{{lineId}}">
				<div style="padding-top: 5px; padding-bottom:5px;"> <!-- zain 06-09-19 -->
					<ul><li>{{translate "Fabric Quantity"}} : {{selectedValue.label}}</li></ul> <!-- zain 06-09-19 -->
				</div>
			</div>
		</div>
		<!-- zain (19-06-19) end -->
		<div data-type="alert-placeholder" class="alert-placeholder-class-{{lineId}}" id="alert-placeholder-{{lineId}}"></div>
	{{/if}}
	{{#if cogsHtmlContent}}
			<div class="accordion-container">
				<a href="#" class="accordion-toggle">COGS
					<span class="accord-arrow-down">‣</span>
				</a>
				<div class="accordion-content">
					{{{cogsHtmlContent}}}
				</div>
			</div>
	{{/if}}
<!-- </div> -->

<script>
$(document).ready(function () {

    $('.date-needed-cart').datepicker({
        format: "yyyy-mm-dd",
        autoclose: true
    });

	var isclientNameFlag = decodeURIComponent("{{{isclientNameFlag}}}");

	if(isclientNameFlag == 'true'){
		if(!window.count){
			window.count = 1;
		} else {
			window.count++;
		}
	}
	if (window.clientInfo && window.count > 0 ) {
		window.count = '';
	    var arrLength = window.clientInfo.length;
	    for (var i = 0; i < arrLength; i++) {
	        var detail = window.clientInfo[i];
					if (!window.linesDataTrack) {
	            window.linesDataTrack = [];
	            if (detail.clientId) {

	                getClientNameDetailsTransaction(detail.clientId, detail.lineId);
	            }

	            if (detail.customerId && detail.clientId) {
	                getExpectedDate(detail.customerId, detail.clientId, detail.lineId);
	            }
	            window.linesDataTrack.push(detail.lineId);

	        } else {
	            if (window.linesDataTrack.indexOf(detail.lineId) == -1) {
	                if (detail.clientId) {
	                    getClientNameDetailsTransaction(detail.clientId, detail.lineId);

	                }

	                if (detail.customerId && detail.clientId) {
	                    getExpectedDate(detail.customerId, detail.clientId, detail.lineId);
	                }
	                window.linesDataTrack.push(detail.lineId);
	            }
	        }

			if(i + 1 == arrLength){
				window.linesDataTrack = [];
			}
	    }
	}

});



	function getExpectedDate(customerId, itemId, lineId)
		{
			var expectedDate = '';
			var url = "/app/site/hosting/scriptlet.nl?script=260&deploy=1&compid=3857857&h=7c57ecf1ba2aea12e667";
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (xhttp.readyState == 4 && xhttp.status == 200) {
					var oResponse = JSON.parse(xhttp.responseText);
					expectedDate =  oResponse.expecteddate;
					var expectedDateFieldId = 'expected-date-calculate-' + lineId;
					var expectedDateFieldClass = 'transaction-line-views-selected-expected-date-' + lineId;
					$("#" + expectedDateFieldId).removeClass(expectedDateFieldClass);
					$("#" + expectedDateFieldId).text(expectedDate);
				}
			}
			xhttp.open('GET', url, true);
			xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhttp.send("itemid=" + itemId + "&customerid=" + customerId);
		}

	function getClientNameDetailsTransaction(clientId, lineId)
		{
			var clientName = '';

			var url = "/app/site/hosting/scriptlet.nl?script=109&deploy=1&compid=3857857&h=9f80a871404e05061ea5&type=get_client_name_details&id=" + clientId;
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (xhttp.readyState == 4 && xhttp.status == 200) {
					var oResponse = JSON.parse(xhttp.responseText);
					var data = oResponse;
					if(data[0]){
						clientName = data[0] + ' ';

					}

					if(data[1]) {
						clientName += data[1];
					} ;
					var clientNameFieldId = 'client-name-value-' + lineId;
					var clientNameFieldClass = 'transaction-line-views-selected-client-name-value-' + lineId;
					$("#" + clientNameFieldId).removeClass(clientNameFieldClass);
					$("#" + clientNameFieldId).text(clientName);

				}
			}
			xhttp.open('GET', url, true);
			xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhttp.send("type=get_client_name_details" + "&id=" + clientId);
		}

</script>


{{!----
Use the following context variables when customizing this template:

	model (Object)
	model.cartOptionId (String)
	model.itemOptionId (String)
	model.label (String)
	model.type (String)
	model.value (Object)
	model.value.label (String)
	model.value.internalid (String)
	values (Array)
	showSelectedValue (Boolean)
	isMandatory (Boolean)
	itemOptionId (String)
	cartOptionId (String)
	label (String)
	selectedValue (Object)
	selectedValue.label (String)
	selectedValue.internalid (String)
	selectedValue.isAvailable (Boolean)
	selectedValue.isActive (Boolean)
	selectedValue.color (String)
	selectedValue.isColorTile (Boolean)
	selectedValue.isImageTile (Boolean)
	selectedValue.image (Object)
	selectedValue.isLightColor (Boolean)
	isTextArea (Boolean)
	isEmail (Boolean)
	isText (Boolean)
	isSelect (Boolean)
	isCheckbox (Boolean)
	isDate (Boolean)
	htmlId (String)
	htmlIdContainer (String)

----}}
