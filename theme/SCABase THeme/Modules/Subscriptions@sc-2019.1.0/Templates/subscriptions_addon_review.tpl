<div class="subscriptions-addon-review">
    <h2 class="subscriptions-addon-review-title">{{itemName}}</h2>
    <div class="subscriptions-addon-review-container">
        <div class="subscriptions-addon-review-left">
            <div class="subscriptions-addon-review-review">
                <section class="subscriptions-addon-review-review">
                    <div class="subscriptions-addon-review-review-image">
                        <img src="{{resizeImage itemImage 'thumbnail'}}" />
                    </div>
                    <div class="subscriptions-addon-review-review-data">
                        <h4>{{itemName}}</h4>
                        <p>{{itemPrice}}</p>
                        <p>{{translate 'Quantity'}}: {{itemQuantity}}</p>
                        <p>{{{itemDescription}}}</p>
                    </div>
                </section>
            </div>
        </div>
        <div class="subscriptions-addon-review-right">
            <div class="subscriptions-addon-review-summary" data-view="Summary.View"></div>
            <div class="subscriptions-addon-review-row-fluid">
                <button class="subscriptions-addon-review-button-continue" data-action="submit">
                    {{translate 'Place Order'}}
                </button>
            </div>
            {{#if showInfoMessage}}
                <p class="subscriptions-addon-review-summary-message-info">{{translate 'Costs will be prorated to the current subscription billing period'}}</p>
            {{/if}}
        </div>
    </div>
</div>

{{!----
Use the following context variables when customizing this template:


----}}
