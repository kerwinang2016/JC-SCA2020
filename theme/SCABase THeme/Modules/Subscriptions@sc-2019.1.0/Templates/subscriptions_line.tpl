<section class="subscriptions-line">
    <h4 class="subscriptions-line-info-card-content">{{name}}</h4>
    <p class="subscriptions-line-info-card-content subscriptions-line-label-container">
        <span class="subscriptions-line-label-{{statusLowerCase}}">{{translate status}}</span>
    </p>
    <p class="subscriptions-line-info-card-content subscriptions-line-info-container">
        <span class="subscriptions-line-quantity">{{translate 'Quantity'}}: <strong>{{quantity}}</strong></span>
        <br>
        <span class="subscriptions-line-price"></span><strong>
            {{#if hasPrice}}
                {{price}}{{#if hasPeriodicity}} / {{translate frequency}}{{/if}}
            {{else}}
                {{translate 'N/A'}}
            {{/if}}</strong>
    </p>
    <p class="subscriptions-line-info-card-content subscriptions-line-date">
        <span>{{translate 'Added'}}: <strong>{{startDate}}</strong></span>
        <br>
        <span>{{translate 'Type'}}: <strong>{{type}}</strong></span>
     </p>
    <p class="subscriptions-line-info-card-content subscriptions-line-button">
        <a data-id="{{subscriptionLineNumber}}" data-action="change" class="subscriptions-line-button-edit">
            {{translate 'Change'}}
        </a>
    </p>
</section>
