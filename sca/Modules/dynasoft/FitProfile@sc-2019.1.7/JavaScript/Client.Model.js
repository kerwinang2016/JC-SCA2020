// Client.Model.js
// -----------------------
// Model for handling addresses (CRUD)
define('Client.Model' 
, [	'underscore'

], function (_)
{
	'use strict';

	return Backbone.Model.extend(
	{
		validation: {
			custrecord_tc_first_name: { required: true, msg: 'First Name is required' } 
		,	custrecord_tc_last_name: { required: true, msg: 'Last Name is required' }
		,	custrecord_tc_email: { required: true, msg: 'Email is required'}
		,	custrecord_tc_phone: { fn: _.validatePhone }
		}
	});
});