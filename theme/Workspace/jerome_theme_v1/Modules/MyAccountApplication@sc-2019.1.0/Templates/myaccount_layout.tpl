<div id="layout" class="myaccount-layout">
	<header id="site-header" class="myaccount-layout-header" data-view="Header"></header>
	<div class="myaccount-layout-breadcrumb" data-view="Global.Breadcrumb" data-type="breadcrumb"></div>
<div class="container-wrapper">
	<div id="main-container" class="myaccount-layout-container">

		
		<div class="myaccount-layout-notifications">
			<div data-view="Notifications"></div>
		</div>
		<div class="myaccount-layout-error-placeholder"></div>

		<h2 class="myaccount-layout-title">{{translate 'My Account'}}</h2>
		<div class="myaccount-layout-row">
			<nav id="side-nav test" class="myaccount-layout-side-nav" data-view="MenuTree"></nav>

			<div id="content" class="myaccount-layout-main"></div>
		</div>

	</div>

	<footer id="site-footer" class="myaccount-layout-footer" data-view="Footer"></footer>

</div>

</div>
<script src="//cdn.jsdelivr.net/noty/2.2.2/packaged/jquery.noty.packaged.min.js"></script>
{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}

