/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
    'QuoteToSalesOrderWizard.Configuration'
,   [
    	'underscore'
    ,	'jQuery'

    ,	'OrderWizard.Module.CartSummary'
    ,	'OrderWizard.Module.CartItems'
    ,	'OrderWizard.Module.ShowShipments'
    ,	'OrderWizard.Module.ShowPayments'
    ,	'OrderWizard.Module.TermsAndConditions'
    ,	'OrderWizard.Module.SubmitButton'
    ,	'OrderWizard.Module.PaymentMethod.Creditcard'
    ,	'OrderWizard.Module.PaymentMethod.Invoice'
    ,	'OrderWizard.Module.Address.Billing'
    ,	'OrderWizard.Module.PaymentMethod.Selector'

    ,	'QuoteToSalesOrderWizard.Module.QuoteDetails'
    ,	'QuoteToSalesOrderWizard.Module.Confirmation'
    ,	'QuoteToSalesOrderWizard.Module.PaymentMethod.Selector'

    ,	'Header.View'
    ]
,   function (
    	_
    ,	jQuery

    ,	OrderWizardModuleCartSummary
    ,	OrderWizardModuleCartItems
    ,	OrderWizardModuleShowShipments
    ,	OrderWizardModuleShowPayments
    ,	OrderWizardModuleTermsAndConditions
    ,	OrderWizardModuleSubmitButton
    ,	OrderWizardModulePaymentMethodCreditcard
    ,	OrderWizardModulePaymentMethodInvoice
    ,	OrderWizardModuleAddressBilling
    ,	OrderWizardModulePaymentMethodSelector

    ,	QuoteToSalesOrderWizardModuleQuoteDetails
    ,	QuoteToSalesOrderWizardModuleConfirmation
    ,	QuoteToSalesOrderWizardModulePaymentMethodSelector

    ,	HeaderView
    )
{
    var quotesToSalesOrderWizard = {
        steps: [
            {
                name: _('REVIEW YOUR ORDER').translate()
            ,	steps: [
                    {
                        url: 'quotetosalesorder-review'
                    ,	name: _('Review Your Oder').translate()
                    ,	hideBackButton: true
                    ,	hideContinueButton: false
                    ,	continueButtonLabel: _('Place Order').translate()
                    ,	hideBreadcrumb: true
                    ,	showBottomMessage: true
                    ,	modules: [
                            QuoteToSalesOrderWizardModuleQuoteDetails
                        ,	[
                                OrderWizardModuleCartSummary
                            ,	{
                                    container: '#wizard-step-content-right'
                                ,	warningMessage: _('Total may include handling costs not displayed in the summary breakdown').translate()
                                }
                            ]
                        ,	[
                                OrderWizardModuleTermsAndConditions
                            ,	{
                                    container: '#wizard-step-content-right'
                                ,	showWrapper: true
                                ,	wrapperClass: 'order-wizard-termsandconditions-module-top-summary'
                                }
                            ]
                        ,	[
                                OrderWizardModuleTermsAndConditions
                            ,	{
                                    container: '#wizard-step-content-right'
                                ,	showWrapper: true
                                ,	wrapperClass: 'order-wizard-termsandconditions-module-bottom'
                                }
                            ]
                        ,	[
                                OrderWizardModuleSubmitButton
                            ,	{
                                    container: '#wizard-step-content-right'
                                ,	showWrapper: true
                                ,	wrapperClass: 'order-wizard-submitbutton-container'
                                }
                            ]
                        ,	[
                                QuoteToSalesOrderWizardModulePaymentMethodSelector
                            ,	{
                                    record_type: 'salesorder'
                                ,	modules: [
                                        {
                                            classModule: OrderWizardModulePaymentMethodCreditcard
                                        ,	name: _('Credit / Debit Card').translate()
                                        ,	type: 'creditcard'
                                        ,	options: {}
                                        }
                                    ,	{
                                            classModule: OrderWizardModulePaymentMethodInvoice
                                        ,	name: _('Invoice').translate()
                                        ,	type: 'invoice'
                                        ,	options: {}
                                        }
                                    ]
                                }
                            ]
                        ,	[
                                OrderWizardModuleAddressBilling
                            ,	{
                                    title: _('Billing Address').translate()
                                }
                            ]
                        ,	[
                                OrderWizardModuleShowShipments
                            ,	{
                                    hide_edit_cart_button: true
                                }
                            ]
                        ,	[
                                OrderWizardModuleTermsAndConditions
                            ,	{
                                    showWrapper: true
                                ,	wrapperClass: 'order-wizard-termsandconditions-module-default'
                                }
                            ]
                        ]
                    ,	save: function ()
                        {
                            _.first(this.moduleInstances).trigger('change_label_continue', _('Processing...').translate());

                            var self = this
                            ,	submit_opreation = this.wizard.model.submit();

                            submit_opreation.always(function ()
                            {
                                _.first(self.moduleInstances).trigger('change_label_continue', _('Placed Order').translate());
                            });

                            return submit_opreation;
                        }
                    }
                ]
            }
        ,	{
                steps: [
                    {
                        url: 'quotetosalesorder-confirmation'
                    ,	hideContinueButton: true
                    ,	name: _('Thank you').translate()
                    ,	hideBackButton: true
                    ,	hideBreadcrumb: true
                    ,	headerView: HeaderView
                    ,	modules: [
                            [
                                OrderWizardModuleCartSummary
                            ,	{
                                    container: '#wizard-step-content-right'
                                ,	warningMessage: _('Total may include handling costs not displayed in the summary breakdown').translate()
                                }
                            ]
                        ,	QuoteToSalesOrderWizardModuleConfirmation
                        ,	QuoteToSalesOrderWizardModuleQuoteDetails
                        ,	[
                                OrderWizardModuleShowPayments
                            ]
                        ,	[
                                OrderWizardModuleShowShipments
                            ,	{
                                    hide_edit_cart_button: true
                                ,	hide_edit_address_button: true
                                }
                            ]
                        ]
                    }
                ]
            }
        ]
    };

    return quotesToSalesOrderWizard;
});
