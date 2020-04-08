{{#if showBackToAccount}}
	<a href="/" class="profile-information-button-back">
		<i class="profile-information-button-back-icon"></i>
		{{translate 'Back to Account'}}
	</a>
{{/if}}

<div class="profile-information">
<h2 class="profile-information-header">{{pageHeader}}</h2>
<hr class="divider-small">
<div data-type="alert-placeholder"></div>
<section class="profile-information-row-fluid">

	<div class="profile-information-col">
		<form class="contact_info">
			<fieldset>
				{{#if isNotCompany}}

					<small class="profile-information-form-label">{{translate 'Required'}} <span class="profile-information-form-group-label-required">*</span></small>

					<div class="profile-information-row" data-input="firstname" data-validation="control-group">
						<label class="profile-information-label" for="firstname">{{translate 'First Name'}}
							<span class="profile-information-input-required">*</span>
						</label>
						<div class="profile-information-group-form-controls" data-validation="control">
							<input type="text" class="profile-information-input-large" id="firstname" name="firstname" value="{{firstName}}">
						<span id="companyname" name="companyname"></span>
						</div>
					</div>

					<div class="profile-information-row" data-input="lastname" data-validation="control-group">
						<label class="profile-information-label" for="lastname">{{translate 'Last Name'}}
							<span class="profile-information-input-required">*</span>
						</label>
						<div class="profile-information-group-form-controls" data-validation="control">
							<input type="text" class="profile-information-input-large" id="lastname" name="lastname" value="{{lastName}}">
						</div>
					</div>
				{{/if}}

				{{#if isCompanyAndShowCompanyField}}
					<div class="profile-information-row" data-input="companyname" data-validation="control-group">
						<label class="profile-information-label" for="companyname">
							{{translate 'Company Name'}}
							{{#if isCompanyFieldRequired}}
								<small class="profile-information-input-required">*</small>
							{{else}}
							<!-- 04/02/2020 {{translate '(optional)'}} -->
								<small class="profile-information-input-optional"></small>
							{{/if}}
						</label>
						<div class="profile-information-group-form-controls" data-validation="control">
							<input type="text" class="profile-information-input-large" id="companyname" name="companyname" value="{{companyName}}">
						</div>
					</div>
				{{/if}}

				<div class="profile-information-row" data-input="phone" data-validation="control-group">
					<label class="profile-information-label" for="phone">
						{{#if phoneFormat}}
							{{translate 'Phone Number (ex/$(0))' phoneFormat}}
						{{else}}
							{{translate 'Phone Number'}}
						{{/if}}
						{{#if isPhoneFieldRequired}}
							<small class="profile-information-input-required">*</small>
						{{else}}
							<small class="profile-information-input-optional">{{translate '(optional)'}}</small>
						{{/if}}
					</label>
					<div class="profile-information-group-form-controls" data-validation="control">
						<!-- <input type="tel" class="profile-information-input-large" id="phone" name="phone" data-type="phone" value="{{phone}}" readonly > --><!-- 04/02/2020 -->
						<p class="profile-information-input-phone">{{phone}}</p><!-- 04/02/2020 -->
					</div>
				</div>

				<div class="profile-information-row">
					<label class="profile-information-label">{{translate 'Email'}}</label>
						<p class="profile-information-input-email" id="email">{{email}} </p>
						<!-- | <a class="profile-information-change-email-address" data-action="change-email">{{translate 'Change Address'}}</a> --> <!-- zain 18-07-19 -->
				</div>

			</fieldset>
			<hr class="divider-small">
			<div class="profile-information-form-actions">
				<!-- <button type="submit" class="profile-information-button-update">{{translate 'Update'}}</button>  04/02/2020-->
			</div>
		</form>
	</div>
</section>
</div>




{{!----
Use the following context variables when customizing this template:

	pageHeader (String)
	isNotCompany (Boolean)
	phoneFormat (undefined)
	isCompanyAndShowCompanyField (Boolean)
	isCompanyFieldRequired (Boolean)
	isPhoneFieldRequired (Boolean)
	firstName (String)
	lastName (String)
	companyName (String)
	email (String)
	phone (String)
	showBackToAccount (Boolean)

----}}
