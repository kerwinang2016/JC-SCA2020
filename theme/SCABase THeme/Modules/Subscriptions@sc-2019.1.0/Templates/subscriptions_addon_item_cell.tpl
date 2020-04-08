<div class="subscriptions-addon-item-cell-view-span3" data-type="item" data-id="{{lineNumber}}">
	<meta itemprop="url" content="{{itemurl}}"/>

	<div class="subscriptions-addon-item-cell-grid-image-wrapper">
		<a class="subscriptions-addon-item-cell-grid-link-image" data-action="add">
			<img class="subscriptions-addon-item-cell-grid-image" src="{{image}}" alt="{{thumbnail.altimagetext}}" itemprop="image"/>
		</a>
	</div>

	<div class="subscriptions-addon-item-cell-grid-details">
		<div class="subscriptions-addon-item-cell-grid-title">
            <a class="subscriptions-addon-item-cell-grid-title-link" href="" data-action="add" data-id="{{lineNumber}}">{{title}}</a>
		</div>

		<div class="subscriptions-addon-item-cell-grid-price">
            {{price}}
		</div>
		<div class="subscriptions-addon-item-cell-grid-description">
			{{{description}}}
		</div>
	</div>
</div>



{{!----
Use the following context variables when customizing this template:

	url (String)
	itemurl (String)
	thumbnail (Object)
	thumbnail.url (String)
	thumbnail.altimagetext (String)
	price (Number)
	description (String)

----}}
