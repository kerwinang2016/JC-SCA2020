<div class="cart-confirmation-modal">
	<div class="cart-copyproduct-modal-details">
		<ul>
			{{#each producttypes}}
			<li>
				<input type="checkbox" name={{name}} id="{{name}}">{{name}}
			</li>
			{{/each}}
		</ul>
		<a class="cart-copyproduct-btn" style="    display: block !important;
		    height: auto;
		    padding-right: 20px;
		    text-align: center;
		    color: #333333;
		    text-shadow: 0 -1px 0 #333333;
		    border-radius: 5px;
		    border: 1px solid #e6e6e6;
		    font-family: 'Raleway' , sans-serif;
		    text-shadow: none;
		    width: 64%;
		    float: right;
		    margin-right: 0px;
		    margin-bottom: 9px;
		    padding: 3px;
		    font-size: 13px;
		    background: linear-gradient(to bottom, white, #e6e6e6);
		    vertical-align: middle;" data-action="copy-products"> Copy </a>
	</div>
</div>
