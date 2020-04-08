<div class="subscriptions-addon-summary-container">
    <h3 class="subscriptions-addon-summary-title">Summary</h3>
    <div class="subscriptions-addon-summary-subtotal">
        <p class="subscriptions-addon-summary-grid-float">
            <span class="subscriptions-addon-summary-grid-left">{{translate 'Subtotal'}} <span>{{itemQuantity}} {{translate 'item'}}(s)</span></span>
            <span class="subscriptions-addon-summary-grid-right">{{#if hasItemPrice}}{{itemPrice}}{{else}}{{translate '-'}}{{/if}}</span>
        </p>
    </div>
    <div class="subscriptions-addon-summary-total">
        <p class="subscriptions-addon-summary-grid-float">
            {{translate 'Total'}} <span class="subscriptions-addon-summary-grid-right">{{#if hasItemPrice}}{{itemPriceTotal}}{{else}}{{translate '-'}}{{/if}}</span>
        </p>
    </div>
</div>
