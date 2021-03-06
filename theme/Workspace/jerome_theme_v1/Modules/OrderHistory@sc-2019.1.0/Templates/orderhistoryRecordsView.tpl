<tr class="recordviews-actionable" data-item-id="{{itemId}}" data-id="{{id}}" data-record-type="{{recordType}}" data-type="order-item">

	{{#each columns}}
		<td class="recordviews-actionable-{{type}}">
			{{#if showLabel}}
				<span class="recordviews-actionable-label">{{label}}</span>
			{{/if}}
			{{#if isComposite}}
				<span class="recordviews-actionable-composite" data-view="{{compositeKey}}"></span>
			{{else}}
				{{#if date_needed}}
					<input name="oh_dateneeded" data-name="{{name}}" class="date_needed_class" data-format="dd/mm/yyyy" placeholder="dd/mm/yyyy" type="date" value="{{value}}" style="width:100px;font-size:10px;"> <a id="" class="close clear-dates">&times;</a>
				{{else if status_image}}
					<img src="https://checkout.na2.netsuite.com/c.3857857/myaccount/img/{{value}}.png">
				{{else}}
					{{#ifEquals type 'checkbox'}}
						<input type="checkbox" data-id="{{name}}" {{#ifEquals value "T"}}checked{{/ifEquals}} data-name="{{name}}">
					{{else}}
						<span class="recordviews-actionable-value" data-name="{{name}}">{{value}}</span>
					{{/ifEquals}}
				{{/if}}
			{{/if}}
		</td>
	{{/each}}
	<td class="recordviews-actionable-title">
		<a href="#" data-touchpoint="{{touchpoint}}" data-hashtag="{{detailsURL}}">{{title}}</a>
	</td>
</tr>
