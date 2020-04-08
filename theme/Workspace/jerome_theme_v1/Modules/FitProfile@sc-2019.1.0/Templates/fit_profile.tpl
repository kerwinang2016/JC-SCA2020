<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
<style>
  body {
    font-family: "Raleway", sans-serif !important;
  }

  .header-right-menu a.header-profile-welcome-link {
    font-size: 12px !important;
  }

  .header-mini-cart-menu-cart-icon {
    font-size: 22px !important;
  }

  .header-menu-myaccount-signout-icon {
    font-size: 15px !important;
  }

  #fitprofilesearch {
    overflow: hidden;
  }

  #fitprofilesearch label {
    font-size: 13px;
    font-weight: normal;
    line-height: 18px;
    font-family: 'Raleway', sans-serif;
    color: #777777;
  }

  #fitprofilesearch .span3 {
    width: 23%; /**** zain 02-09-19 ****/
    float: left;
    margin-right: 7px;
  }

  #swx-order-client-search {
    background: linear-gradient(to bottom, #f5f5f5, #cccccc);
    color: black;
    font-weight: 400;
    border-radius: 6px;
    text-transform: none;
    border: 1px solid #dbdbdb;
  }

  #fitprofilesearch .span6 {
    float: left;
  }

  #fitprofilesearch .span6 button#swx-order-client-search {
    background: linear-gradient(to bottom, #f5f5f5, #cccccc);
    color: black;
    font-weight: bold;
    border-radius: 6px;
    text-transform: none;
    border: 1px solid #dbdbdb;
    font-size: 13px;
    padding: 7px 27px;
  }

  #fitprofilesearch .span6 button {
    background: linear-gradient(to bottom, #f5f5f5, #cccccc);
    color: black;
    font-weight: bold;
    border-radius: 6px;
    text-transform: none;
    border: 1px solid #dbdbdb;
    font-size: 13px;
    padding: 7px 27px;
  }

  .custom-button {
    color: #5f5f5f;
    background: linear-gradient(to bottom, white, #e6e6e6) !important;
    border: 1px solid #e6e6e6 !important;
  }

  #fitprofilesearch .span6 button:hover,
  #fitprofilesearch .span6 button#swx-order-client-search:hover,
  .custom-button:hover {
    background: #cccccc !important;
  }

  #client_form label {
    font-size: 13px;
    font-weight: normal;
    line-height: 18px;
    font-family: 'Raleway', sans-serif;
    color: #777777;
  }

  #client_form .control-group {
    margin-bottom: 16px;
    width: 50%
  }

  #zipcode {
    width: 60%;
  }

  #client_form .control-group-big-zip {
    width: 100% !important;
  }

  #client_form .control-group-big-zip #notes {
    width: 100% !important;
    min-height: 50px;
    height: 50px;
  }

  .help-block {
    font-family: 'Raleway', sans-serif;
    color: #6b6b6b;
  }

  #myModal .modal-footer .actions {
    float: right;
  }

  #myModal .modal-footer .actions .save-action {
    background: linear-gradient(to bottom, #f2f2f2, #d9d9d9);
    color: black;
    border-radius: 9px;
    border: 1px solid #dbd9d9;
  }

  #myModal .modal-footer .actions .cancel-action {
    background: linear-gradient(to bottom, #f2f2f2, #d9d9d9);
    color: black;
    border-radius: 9px;
    border: 1px solid #dbd9d9;
  }

  #myModal .modal-footer .actions .save-action:hover,
  #myModal .modal-footer .actions .cancel-action:hover {
    background: #d9d9d9 !important;
    color: #333333 !important;
  }

  #client_form select {
    display: block;
    color: #4D5256;
    font-size: 13px;
    border: 1px solid #ccc;
    width: 100%;
    margin-bottom: 10px;
    webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
    -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
    -webkit-transition: border linear .2s, box-shadow linear .2s;
    -moz-transition: border linear .2s, box-shadow linear .2s;
    -o-transition: border linear .2s, box-shadow linear .2s;
    transition: border linear .2s, box-shadow linear .2s;
  }

  table {
    width: 100%;
    border-top: 1px solid #e5e5e5;
    clear: both;
    margin-top: 56px;
  }

  th {
    padding-top: 15px !important;
    padding-bottom: 15px !important;
    border-bottom: 1px solid #e5e5e5;
  }

  td {
    padding-top: 15px !important;
    padding-bottom: 15px !important;
  }

  #myModal2 .modal-dialog,
  #myModal .modal-dialog {
    width: 500px !important;
  }

  #myModal2 #clientmodal,
  #myModal #client_form {
    margin: 0 auto;
    width: 80%;
  }

  #myModal2 #clientedit_form .control-group,
  #myModal2 #clientedit_form .control-group input,
  #myModal #client_form .control-group,
  #myModal #client_form .control-group input {
    width: 100% !important;
  }

  .header-mini-cart-item-cell-product-title,
  .header-mini-cart-item-cell-product-price,
  .header-mini-cart-item-cell-quantity-label,
  .header-mini-cart-item-cell-quantity-value,
  .header-mini-cart-subtotal-items,
  .header-mini-cart-subtotal-amount,
  .header-mini-cart-buttons-left a,
  .header-mini-cart-buttons-right a {
    font-size: 16px !important;
  }

  .myaccount-layout-main .disappear {
    display: none;
  }
  /**** zain (19-06-19) start ****/
  .myaccount-layout-main .disappear{display:none;}  /**** zain 28/08/2019 ****/
  .shopping-layout-content #swx-client-profile-view{visibility:hidden;}
  .shopping-layout-content .fade{background: #00000091;}
  .alert-success{background-color: #dff0d8 !important;} /**** 27/08/2019 ****/
  /**** zain (19-06-19) end ****/
</style>
<!-- 26/07/2019 -->
<div class=show-remove-error-fitprofile></div>

<h1
  style="margin-top:0;font-family: 'Raleway', sans-serif;font-weight: 400;font-size: 20px;color: #a6a6a6;line-height: 24px;">
  Client Profiles</h1>

<!-- zain (19-06-19) start -->
<div id="fit-profile-shopflow"></div>
<!-- zain (19-06-19) end -->
{{#if isPdpTrue}}
<form id="fitprofilesearch">
  {{#fitprofilesearch objFilters profile_model isDisplayClientDetailsValue}}
  {{/fitprofilesearch}}
</form>
{{/if}}
<div class="container">
  <!-- Modal -->
    <div style="width: 100%;" class="modal fade" id="myModal" role="dialog" data-backdrop="static"> <!--zain (15-07-19) -->
    <div class="modal-dialog">

      <!-- Modal content-->
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close cancel-action" data-dismiss="modal">&times;</button>
          <h4 class="modal-title">Create Client</h4>
        </div>
        <div class="modal-body">
          {{#clientForm tailorId}}
          {{/clientForm}}

        </div>
        <div class="modal-footer">
          <p class="actions">
            <a class="btn btn-link save-action">
              Save
            </a>

            <a class="btn btn-link cancel-action" data-dismiss="modal">
              Cancel
            </a>
          </p>
        </div>
      </div>

    </div>
  </div>

</div>

<!--zain (07-08-19) start-->

<!--zain 26-08-19 start -->
<!-- zain (27-06-19) start (change url) DONE--> 
<!-- zain 06-09-19 start -->
<script>
// var titletext = $(location).attr("href");
//  titletext = window.location.hash.substr(1)
var titletext =  window.location.href.split("/");
// var titletext =  window.location.href.split("#"); // for local test
titletext = titletext[3]; // zain 28-08-19
// titletext = titletext[1]; // // for local test
// alert(titletext);
if(titletext == "fitprofile"){
$("h1").html("Tailor's Client");
// zain 28-10-19 start
$(".shopping-layout-breadcrumb").css("display", "none");
  $("#site-header").css("margin-bottom","0");
  $(".shopping-layout-content").css("border-bottom", "none");
// zain 28-10-19 end
}
var linkFitProfile = window.location.href;
var splintLinkFitProfile = window.location.href.split("/");
var domain = SC.ENVIRONMENT.embEndpointUrl.data.domain;
if (linkFitProfile == "http://"+domain+"/fitprofile" || splintLinkFitProfile[3] == "fitprofile"){
  $(".shopping-layout-breadcrumb").css("display", "none");
  $("#site-header").css("margin-bottom","0");
  $(".shopping-layout-content").css("border-bottom", "none");
}
else {
  $(".shopping-layout-breadcrumb").css("display", "block");
}
// zain 11-09-19 start
// $(document).ready (function (){
// $("body").on("click", "#clientsOptionDropdown .btn-primary", function () {
//   $("#site-header").css("margin-bottom", "15px");
// });
// });
// zain 11-09-19 end
</script>
<!--zain 06-09-19 end -->
<!-- zain (27-06-19) end -->
<!--zain 26-08-19 start -->

<!-- <script>
  $(document).ready(function(){
  setTimeout(function(){ 
    var $dates = $('.date_needed_class').datepicker();
    $('.clear-dates').on('click', function () {
      alert("hi");
    $(this).closest('tr').find('.date_needed_class').datepicker('setDate', null);
     // $(this).$dates.datepicker('setDate', null);
  });
  }, 3000);
  
  });
    </script> -->

<!--zain (07-08-19) end-->