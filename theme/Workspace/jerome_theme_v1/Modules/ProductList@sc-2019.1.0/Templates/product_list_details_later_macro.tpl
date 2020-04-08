<article class="product-list-details-later-macro-selectable-actionable" data-id="{{model.internalid}}"
	data-item-id="{{itemId}}">
	<div class="saved-items-record">
		<!-- zain 02-07-19 start -->
		<table class="saved-items-record">
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
			<tbody>
				<tr id="product-list-details-later-macro-row-{{model.internalid}}" data-id="{{model.internalid}}" data-item-id="{{itemId}}" >
					<td>
						<p class="product-list-details-later-macro-name">
							{{lastModifiedDate}}
						</p>
					</td>
					<td>
						{{#if clientName}}
						<p class="product-list-details-later-macro-name">
							{{clientName}}
						</p>
						{{else}}
						<p id="product-list-details-later-macro-client-name-{{model.internalid}}">
						</p>
						{{/if}}
					</td>
					<td>
						<p class="product-list-details-later-macro-name">
							{{model.item._name}}
						</p>
					</td>
					<td>
						<input type="text" id="comment_{{model.internalid}}" value="{{commentValue}}">
					</td>
					<td>
						<button class="product-list-details-later-macro-button-remove" data-id="{{model.internalid}}"
							data-action="update-item">
							{{translate 'Update'}}
						</button>
					</td>
					<td>
						<button class="product-list-details-later-macro-button-remove" data-action="delete-item">
							{{translate 'Remove'}}
						</button>
					</td>
					<td>
						<button data-action="add-to-cart"
							class="product-list-details-later-macro-button-addtocart {{#unless canBeAddedToCart}}disabled{{/unless}}"
							{{#unless canBeAddedToCart}}disabled{{/unless}}>
							{{translate 'Add'}}
						</button>
					</td>
					<td>
						<input data-tag="saved-item" id="line_check_box_{{model.internalid}}" data-id="{{model.internalid}}" data-item-id="{{itemId}}" type="checkbox">
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<!-- <div>
		{{#if showActions}}
		{{/if}}
	</div> -->

	<!-- zain 02-07-19 end -->
</article>


<script>
$(document).ready(function () {
	var clientId = decodeURIComponent("{{{clientId}}}");
	var clientName = decodeURIComponent("{{{clientName}}}");
	var itemId = decodeURIComponent("{{{model.internalid}}}");
	if(!window.processedClientIds){
		window.processedClientIds = [];
		window.processedClientIdsTrackData = [];
	}


	if(clientName.length == 0){
		if(window.processedClientIds && window.processedClientIds){
			if(window.processedClientIds.indexOf(clientId) != -1){

				for(var i =0; i < window.processedClientIdsTrackData.length; i++){
					var objData = window.processedClientIdsTrackData[i];

					if(clientId == objData.clientId){
						var tempClientName = objData.clientName.toUpperCase();
							var clientNameFieldId = 'product-list-details-later-macro-client-name-' + itemId;
						if(window.clientNameFilter){

							if (tempClientName.indexOf(window.clientNameFilter.toUpperCase()) == -1) {
								var rowId = 'product-list-details-later-macro-row-' + itemId;
								$('#' + rowId).remove();
								break;
							} else {
								$("#" + clientNameFieldId).text(objData.clientName);
								break;
							}
						} else {
							$("#" + clientNameFieldId).text(objData.clientName);
							break;

						}
					}
				}

			} else {
				getClientNameDetailsForProduct(clientId, itemId)
			}
		} else {
			getClientNameDetailsForProduct(clientId, itemId)
		}

	} else {
		if(window.processedClientIds.indexOf(clientId) == -1){
			var obj = {clientId: clientId, clientName: clientName}
			window.processedClientIdsTrackData.push(obj);
			window.processedClientIds.push(clientId);

		}
	}


})

function getClientNameDetailsForProduct(clientId, itemId)
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

				var clientNameFieldId = 'product-list-details-later-macro-client-name-' + itemId;
				$("#" + clientNameFieldId).text(clientName);

				var obj = {clientId: clientId, clientName: clientName}
				window.processedClientIdsTrackData.push(obj);
				window.processedClientIds.push(clientId);

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
	model.item (Object)
	model.item.internalid (Number)
	model.item.type (String)
	model.quantity (Number)
	model.internalid (String)
	model.options (Array)
	model.options.0 (Object)
	model.options.0.cartOptionId (String)
	model.options.0.itemOptionId (String)
	model.options.0.label (String)
	model.options.0.type (String)
	model.options.0.values (Array)
	model.location (String)
	model.fulfillmentChoice (String)
	model.description (String)
	model.priority (Object)
	model.priority.id (String)
	model.priority.name (String)
	model.created (String)
	model.createddate (String)
	model.lastmodified (String)
	quantity (Number)
	itemId (Number)
	canBeAddedToCart (Boolean)
	itemDetailsUrl (String)
	isGiftCertificate (Boolean)
	showActions (Boolean)
	thumbnail (Object)
	thumbnail.altimagetext (String)
	thumbnail.url (String)

----}}
