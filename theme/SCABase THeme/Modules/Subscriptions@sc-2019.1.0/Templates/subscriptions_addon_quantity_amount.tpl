<section class="subscriptions-addon-quantity-amount">

    <div class="subscriptions-addon-quantity-amount-quantity-input" data-validation="control-group">
        <label for="quantity" class="subscriptions-addon-quantity-amount-quantity-input-title">{{translate 'Quantity'}}:</label>
        <div data-validation="control">
            <div class="subscriptions-addon-quantity-amount-quantity-input-container">
            {{#unless isReadOnly}}
                <button type="button" class="subscriptions-addon-quantity-amount-quantity-input-remove" data-action="minus" data-type="subscriptions-addon-quantity-amount-quantity-input-remove" data-value="-1" {{#if isMinusButtonDisabled}} disabled="disabled" {{/if}}>-</button>
            {{/unless}}
            <input{{#if isReadOnly}} disabled="disabled"{{/if}}  type="number" data-type="quantity-input" name="quantity" id="quantity" data-action="changeQuantity" class="subscriptions-addon-quantity-amount-quantity-input-value" value="{{quantity}}" min="1" step="1">
            {{#unless isReadOnly}}
                <button type="button" class="subscriptions-addon-quantity-amount-quantity-input-add" data-action="plus" data-value="+1">+</button>
            {{/unless}}
            </div>
        </div>
    </div>
    {{#if hasDiscount}}
        <div class="subscriptions-addon-quantity-amount-total-amount">
            <span class="subscriptions-addon-quantity-amount-total-amount-label">{{translate 'Discount'}}:</span>
            <div class="subscriptions-addon-quantity-amount-total-amount-value">{{discount}}</div>
        </div>
    {{/if}}
</section>


