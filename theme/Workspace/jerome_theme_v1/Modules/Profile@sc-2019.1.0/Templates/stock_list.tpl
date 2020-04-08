<div class="stock-table-wrap table-responsive">
<table class="table">
  <th>Vendor</th>
  <th>Stock List Link</th>
{{#each stocklist }}
  <tr>
    <td>
       {{vendor}}
    </td>
    <td>
      {{#if file}}
          <a href="{{stocklink}}">{{text}}</a>
      {{else}}
        <a target="_blank" href="{{stocklink}}">{{stocklink}} </a>
      {{/if}}
    </td>
  </tr>
{{/each}}
</table>
</div>
