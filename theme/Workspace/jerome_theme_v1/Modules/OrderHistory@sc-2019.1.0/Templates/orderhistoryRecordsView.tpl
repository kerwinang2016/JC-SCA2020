<tr class="recordviews-actionable" data-item-id="{{itemId}}" data-id="{{id}}" data-record-type="{{recordType}}" data-type="order-item">

	{{#each columns}}
		<td class="recordviews-actionable-{{type}}" data-name="{{name}}">
			{{#if showLabel}}
				<span class="recordviews-actionable-label">{{label}}</span>
			{{/if}}
			{{#if isComposite}}
				<span class="recordviews-actionable-composite" data-view="{{compositeKey}}"></span>
			{{else}}
				{{#if date_needed}}
					<input name="oh_dateneeded" class="date_needed_class" placeholder="mm/dd/yyyy" id="" type="text" value="{{value}}" style="width:100px;font-size:10px;"> <a id="" class="close clear-dates">&times;</a>
				{{else if status_image}}
					<img src="https://checkout.na2.netsuite.com/c.3857857/myaccount/img/{{value}}.png">
				{{else}}
					{{#ifEquals type 'checkbox'}}
						<input type="checkbox" data-id="{{name}}" {{#ifEquals value "T"}}checked{{/ifEquals}} data-name="{{name}}">
					{{else}}
						<span class="recordviews-actionable-value">{{value}}</span>
					{{/ifEquals}}
				{{/if}}
			{{/if}}
		</td>
	{{/each}}
	<td class="recordviews-actionable-title">
		<a href="#" data-touchpoint="{{touchpoint}}" data-hashtag="{{detailsURL}}">{{title}}</a>
	</td>
</tr>
