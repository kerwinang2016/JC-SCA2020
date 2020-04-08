{{#if node.showChildren}}

<div class="menu-tree-node" data-type="menu-tree-node-expandable" data-type="menu-tree-node-expandable" data-id='{{node.id}}' data-permissions="{{node.permission}}" data-permissions-operator="{{node.permissionOperator}}">

	<a class="menu-tree-node-item-anchor" data-target="#menu-tree-node-{{node.id}}" data-action="expander" data-id="{{node.id}}">
		{{node.name}}
		<i class="menu-tree-node-item-icon"></i>
	</a>

	<div id="menu-tree-node-{{node.id}}" data-type="menu-tree-node-expander" class="menu-tree-node-submenu menu-tree-node-submenu-level-{{level}} collapse">
		<div class="menu-tree-node-submenu-wrapper" data-view="MenuItems.Collection"></div>
	</div>

</div>

{{else}}

<div class="menu-tree-node" data-type="menu-tree-node" data-permissions="{{node.permission}}" data-permissions-operator="{{node.permissionOperator}}">

	<a class="menu-tree-node-item-anchor no-child" href="{{node.url}}" target="{{node.target}}" data-id="{{node.id}}">{{node.name}}</a>

</div>
<script>
	$(document).ready(function(){
		$('.menu-tree-node-submenu-wrapper .menu-tree-node-item-anchor, .no-child').on("click",function(){
		$(window).scrollTop(0);
		//$('html, body').animate({scrollTop:0}, 'slow');
		//return false;
	});
	// zain (19-06-19) start
		var $menuNoChild = $('.no-child').on("click",function(){
        $menuNoChild.removeClass('active-custom');
		$(this).addClass('active-custom');
		});
 
		$('.menu-tree-node-item-anchor').on("click",function(){
			setTimeout(function(){ $('.no-child').removeClass('active'); }, 100);
		
		});
	// zain (19-06-19) end  

	});
</script>

{{/if}}



{{!----
Use the following context variables when customizing this template: 
	
	node (Object)
	node.id (String)
	node.name (String)
	node.url (String)
	node.index (Number)
	node.children (Array)
	node.showChildren (Boolean)
	level (Number)

----}}
