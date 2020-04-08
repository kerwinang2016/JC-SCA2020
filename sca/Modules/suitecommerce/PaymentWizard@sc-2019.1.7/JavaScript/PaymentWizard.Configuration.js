/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
    'PaymentWizard.Configuration'
,   [
    	'underscore'
    ,   'jQuery'
    ,	'PaymentWizard.Module.Invoice'
    ,	'PaymentWizard.Module.Summary'
    ,	'PaymentWizard.Module.ShowInvoices'
    ,	'PaymentWizard.Module.CreditTransaction'
    ,	'PaymentWizard.Module.PaymentMethod.Creditcard'
    ,	'PaymentWizard.Module.Addresses'
    ,	'PaymentWizard.Module.Confirmation'
    ,	'PaymentWizard.Module.ShowCreditTransaction'
    ,	'PaymentWizard.Module.ShowPayments'
    ,	'PaymentWizard.Module.ConfirmationSummary'
    ,	'PaymentWizard.Module.PaymentMethod.Selector'
    ]
,   function (
        _
    ,   jQuery
    ,	PaymentWizardModuleInvoice
    ,	PaymentWizardModuleSummary
    ,	PaymentWizardModuleShowInvoices
    ,	PaymentWizardModuleCreditTransaction
    ,	PaymentWizardModulePaymentMethodCreditcard
    ,	PaymentWizardModuleAddresses
    ,	PaymentWizardModuleConfirmation
    ,	PaymentWizardModuleShowCreditTransaction
    ,	PaymentWizardModuleShowPayments
    ,	PaymentWizardModuleConfirmationSummary
    ,	PaymentWizardModulePaymentMethodSelector
    )
{
    var paymentWizardSteps = [
        {
            name: _('SELECT INVOICES TO PAY').translate()
        ,	steps: [{
                url: 'make-a-payment'
            ,	hideBackButton: true
            ,	hideContinueButton: false
            ,	modules: [
                    PaymentWizardModuleInvoice
                ,	[
                        PaymentWizardModuleSummary
                    ,	{
                            container: '#wizard-step-content-right'
                        ,	show_estimated_as_invoices_total: true
                        }
                    ]
                ]
            ,	save: function ()
                {
                    return jQuery.Deferred().resolve();
                }
            }]
        }
    ,	{
            name: _('PAYMENT AND REVIEW').translate()
        ,	steps: [
                {
                    url: 'review-payment'
                ,	hideBackButton: false
                ,	hideContinueButton: false
                ,	modules: [
                        [
                            PaymentWizardModuleCreditTransaction
                        ,	{
                                transaction_type: 'deposit'
                            }
                        ]
                    ,	[
                            PaymentWizardModuleCreditTransaction
                        ,	{
                                transaction_type: 'credit'
                            }
                        ]
                    ,	[
                            PaymentWizardModulePaymentMethodSelector
                        ,	{
                                title: _('Payment Method').translate()
                            ,	record_type: 'customerpayment'
                            ,	modules: [
                                    {
                                        classModule: PaymentWizardModulePaymentMethodCreditcard
                                    ,	name: _('Credit / Debit Card').translate()
                                    ,	type: 'creditcard'
                                    ,	options: {}
                                    }
                                ]
                            }
                        ]
                    ,	[
                            PaymentWizardModuleSummary
                        ,	{
                                container: '#wizard-step-content-right'
                            ,	total_label: _('Payment Total').translate()
                            ,	submit: true
                            }
                        ]
                    ,	[
                            PaymentWizardModuleShowInvoices
                        ,	{
                                container: '#wizard-step-content-right'
                            }
                        ]
                    ]
                ,	save: function ()
                    {
                        return this.wizard.model.save();
                    }
                }
            ,	{
                    url: 'payment-confirmation'
                ,	hideBackButton: true
                ,	hideBreadcrumb: true
                ,	hideContinueButton: true
                ,	modules: [
                        PaymentWizardModuleConfirmation
                    ,	PaymentWizardModuleShowInvoices
                    ,	[
                            PaymentWizardModuleShowCreditTransaction
                        ,	{
                                transaction_type: 'deposit'
                            }
                        ]
                    ,	[
                            PaymentWizardModuleShowCreditTransaction
                        ,	{
                                transaction_type: 'credit'
                            }
                        ]
                    ,	PaymentWizardModuleShowPayments
                    ,	[
                            PaymentWizardModuleConfirmationSummary
                        ,	{
                                container: '#wizard-step-content-right'
                            ,	submit: true
                            }
                        ]
                    ]
                }
            ]
        }
    ];

    return paymentWizardSteps;
});
