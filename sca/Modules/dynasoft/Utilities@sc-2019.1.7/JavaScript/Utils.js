/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* globals session */

// @module Utilities
// --------
// @class Utils
// A collection of utility methods. This are added to both SC.Utils, and Underscore.js
// eg: you could use SC.Utils.formatPhone() or _.formatPhone()
define('Utils', [
	'jQuery', 'underscore', 'Backbone', 'String.format', 'Backbone.Validation'
], function (
	jQuery, _, Backbone
) {
	'use strict';

	//@function deepCopy Deep Copy of the object taking care of Backbone models
	//@param {Object} obj Object to be copy
	//@return {Object}
	function deepCopy(obj) {
		if (_.isFunction(obj)) {
			return null;
		}

		var copy = {};

		if (obj instanceof Backbone.Model) {
			obj = obj.deepCopy();
		} else if (obj instanceof Backbone.Collection) {
			obj = obj.models || [];
		}

		if (_.isArray(obj)) {
			copy = [];
			_.each(obj, function (value) {
				!_.isFunction(value) && copy.push(_.deepCopy(value));
			});
		} else if (_.isObject(obj)) {
			_.each(obj, function (value, attr) {
				if (!_.isFunction(value) && attr.indexOf('_') !== 0) {
					copy[attr] = _.deepCopy(value);
				}
			});
		} else {
			copy = obj;
		}

		return copy;
	}

	function deepExtend(target, source) {
		if (_.isArray(target) || !_.isObject(target)) {
			return source;
		}

		_.each(source, function (value, key) {
			if (key in target) {
				target[key] = deepExtend(target[key], value);
			} else {
				target[key] = value;
			}
		});

		return target;
	};

	//@function trim Remove starting and ending spaces
	//@param {String} str String to be trimmed
	//@return {String}
	var trim = jQuery.trim;

	// @method formatPhone
	// Will try to reformat a phone number for a given phone Format,
	// If no format is given, it will try to use the one in site settings.
	// @param {String} phone @param {String} format @return {String}
	function formatPhone(phone, format) {
		// fyi: the tilde (~) its used as !== -1
		var extentionSearch = phone.search(/[A-Za-z#]/),
			extention = ~extentionSearch ? ' ' + phone.substring(extentionSearch) : '',
			phoneNumber = ~extentionSearch ? ' ' + phone.substring(0, extentionSearch) : phone;

		format = format || SC.ENVIRONMENT.siteSettings.phoneformat;

		if (/^[0-9()-.\s]+$/.test(phoneNumber) && format) {
			var format_tokens = {},
				phoneDigits = phoneNumber.replace(/[()-.\s]/g, '');

			switch (format) {
				// c: country, ab: area_before, aa: area_after, d: digits
				case '(123) 456-7890':
					format_tokens = {
						c: ' ',
						ab: '(',
						aa: ') ',
						d: '-'
					};
					break;
				case '123 456 7890':
					format_tokens = {
						c: ' ',
						ab: '',
						aa: ' ',
						d: ' '
					};
					break;
				case '123-456-7890':
					format_tokens = {
						c: ' ',
						ab: '',
						aa: '-',
						d: '-'
					};
					break;
				case '123.456.7890':
					format_tokens = {
						c: ' ',
						ab: '',
						aa: '.',
						d: '.'
					};
					break;
				default:
					return phone;
			}

			switch (phoneDigits.length) {
				case 7:
					return phoneDigits.substring(0, 3) + format_tokens.d + phoneDigits.substring(3) + extention;
				case 10:
					return format_tokens.ab + phoneDigits.substring(0, 3) + format_tokens.aa + phoneDigits.substring(3, 6) + format_tokens.d + phoneDigits.substring(6) + extention;
				case 11:
					return phoneDigits.substring(0, 1) + format_tokens.c + format_tokens.ab + phoneDigits.substring(1, 4) + format_tokens.aa + phoneDigits.substring(4, 7) + format_tokens.d + phoneDigits.substring(7) + extention;
				default:
					return phone;
			}
		}

		return phone;
	}

	// @method dateToString Convert a date object to string using international format YYYY-MM-dd
	// Useful for inputs of type="date" @param {Date} date @return {String}
	function dateToString(date) {
		var month = '' + (date.getMonth() + 1),
			day = '' + date.getDate();

		if (month.length === 1) {
			month = '0' + month;
		}

		if (day.length === 1) {
			day = '0' + day;
		}

		return date.getFullYear() + '-' + month + '-' + day;
	}

	// @method addTimeToDate Add the amount of time in mmilliseconds to a date
	// @param {Date} date
	// @param {Number} offset (time in milliseconds)
	// @return {Date}
	function addTimeToDate(date, offset) {
		var date_time = new Date().getTime();
		return new Date(date_time + offset);
	}

	// @method stringToDate parse a string date into a date object.
	// @param {String} str_date
	// @param {format:String,plusMonth:Number} options.format: String format that specify the format of the input string. By Default YYYY-MM-dd.
	// options.plusMonth: Number that indicate how many month offset should be applied whne creating the date object.
	function stringToDate(str_date, options) {
		options = _.extend({
			format: 'YYYY-MM-dd',
			plusMonth: -1,
			dateSplitCharacter: '-'
		}, options || {});

		//plumbing
		var date_parts = str_date ? str_date.split(options.dateSplitCharacter) : [],
			format_parts = options.format ? options.format.split('-') : [],
			year_index = _.indexOf(format_parts, 'YYYY') >= 0 ? _.indexOf(format_parts, 'YYYY') : 2,
			month_index = _.indexOf(format_parts, 'MM') >= 0 ? _.indexOf(format_parts, 'MM') : 1,
			day_index = _.indexOf(format_parts, 'dd') >= 0 ? _.indexOf(format_parts, 'dd') : 0
			//Date parts
			,
			year = parseInt(date_parts[year_index], 10),
			month = parseInt(date_parts[month_index], 10) + (options.plusMonth || 0),
			day = parseInt(date_parts[day_index], 10),
			result = new Date(year, month, day);

		if (!(result.getMonth() !== month || day !== result.getDate() || result.getFullYear() !== year)) {
			return result;
		}
	}

	// @method isDateValid @param {Date} date @return {Boolean}
	function isDateValid(date) {
		if (Object.prototype.toString.call(date) === '[object Date]') {
			// it is a date
			if (isNaN(date.getTime())) {
				// d.valueOf() could also work
				// date is not valid
				return false;
			} else {
				// date is valid
				// now validate the values of day, month and year
				var dtDay = date.getDate(),
					dtMonth = date.getMonth() + 1,
					dtYear = date.getFullYear(),
					pattern = /^\d{4}$/;

				if (!pattern.test(dtYear)) {
					return false;
				} else if (dtMonth < 1 || dtMonth > 12) {
					return false;
				} else if (dtDay < 1 || dtDay > 31) {
					return false;
				} else if ((dtMonth === 4 || dtMonth === 6 || dtMonth === 9 || dtMonth === 11) && dtDay === 31) {
					return false;
				} else if (dtMonth === 2) {
					var isleap = (dtYear % 4 === 0 && (dtYear % 100 !== 0 || dtYear % 400 === 0));
					if (dtDay > 29 || (dtDay === 29 && !isleap)) {
						return false;
					}
				}

				return true;
			}
		} else {
			// not a date
			return false;
		}
	}

	function getCurrencyByName(currency_name) {
		var selected_currency, currencies = SC.ENVIRONMENT.availableCurrencies;

		if (currency_name && currencies) {
			selected_currency = _.find(currencies, function (currency) {

				return currency.currencyname === currency_name;
			});
		}

		return selected_currency;
	}

	// @method validateSecurityCode @param {String} value @return a non empty string with a internationalized warning message
	function validateSecurityCode(value) {
		if (value !== null) {

			var ccsn = trim(value);

			if (!ccsn) {
				return _('Security Number is required').translate();
			}

			if (!(Backbone.Validation.patterns.number.test(ccsn) && (ccsn.length === 3 || ccsn.length === 4))) {
				return _('Security Number is invalid').translate();
			}
		}
	}

	// @method validatePhone @param {String} phone @return {String} an error message if the passed phone is invalid or falsy if it is valid
	function validatePhone(phone) {
		var minLength = 7;


		if (_.isNumber(phone)) {
			// phone is a number so we can't ask for .length
			// we elevate 10 to (minLength - 1)
			// if the number is lower, then its invalid
			// eg: phone = 1234567890 is greater than 1000000, so its valid
			//     phone = 123456 is lower than 1000000, so its invalid
			if (phone < Math.pow(10, minLength - 1)) {
				return _('Phone Number is invalid').translate();
			}
		} else if (phone) {
			// if its a string, we remove all the useless characters
			var value = phone.replace(/[()-.\s]/g, '');
			// we then turn the value into an integer and back to string
			// to make sure all of the characters are numeric

			//first remove leading zeros for number comparison
			while (value.length && value.substring(0, 1) === '0') {
				value = value.substring(1, value.length);
			}
			if (parseInt(value, 10).toString() !== value || value.length < minLength) {
				return _('Phone Number is invalid').translate();
			}
		} else {
			return _('Phone is required').translate();
		}

	}

	// @method validateState @param {String} value @param {String} valName @param {Object} form @return {String} an error message if the passed state is invalid or falsy if it is valid
	function validateState(value, valName, form) {
		var countries = SC.ENVIRONMENT.siteSettings.countries || {};
		if (countries[form.country] && countries[form.country].states && value === '') {
			return _('State is required').translate();
		}
	}

	// @method validateZipCode @param {String} value @param {String} valName @param {Object} form @return {String} an error message if the passed zip code is invalid or falsy if it is valid
	function validateZipCode(value, valName, form) {
		var countries = SC.ENVIRONMENT.siteSettings.countries || {};

		value = trim(value);

		if (!value && (!form.country || countries[form.country] && countries[form.country].isziprequired === 'T')) {
			return _('Zip Code is required').translate();
		}
	}

	// @method translate
	// Used on all of the hardcoded texts in the templates. Gets the translated value from SC.Translations object literal.
	// Please always use the syntax _('string').translate(1, 2) instead of the syntax _.translate('string', 1, 2)
	// Example: ```_('There are $(0) apples in the tree').translate(appleCount)```
	// @param {String} text @return {String}
	function translate(text) {
		if (!text) {
			return '';
		}

		text = text.toString();
		// Turns the arguments object into an array
		var args = Array.prototype.slice.call(arguments)

			,
			parameters

			// Checks the translation table
			, result = SC.Translations && SC.Translations[text] ? SC.Translations[text] : text;

		if (args.length && result) {
			if (_.isArray(args[1]) && args[1].length) {
				parameters = args[1];
			} else {
				// Mixes in inline variables
				parameters = _.map(args.slice(1), function (param) {
					return _.escape(param);
				});
			}

			result = result.format.apply(result, parameters);
		}

		return result;
	}

	// @method getFullPathForElement
	// @param {HTMLElement} el
	// @returns {String} a string containing the path in the DOM tree of the element
	function getFullPathForElement(el) {
		var names = [],
			c, e;

		while (el.parentNode) {
			if (el.id) {
				// if a parent element has an id, that is enough for our path
				names.unshift('#' + el.id);
				break;
			} else if (el === document.body) {
				names.unshift('HTML > BODY');
				break;
			} else if (el === (document.head || document.getElementsByTagName('head')[0])) {
				names.unshift('HTML > HEAD');
				break;
			} else if (el === el.ownerDocument.documentElement) {
				names.unshift(el.tagName);
				break;
			} else {
				e = el;
				for (c = 1; e.previousElementSibling; c++) {
					e = e.previousElementSibling;
				}
				names.unshift(el.tagName + ':nth-child(' + c + ')');
				el = el.parentNode;
			}
		}

		return names.join(' > ');
	}

	// @method formatCurrency @param {String} value @param {String} symbol @return {String}
	function formatCurrency(value, symbol, noDecimalPosition) {
		var value_float = parseFloat(value),
			negative = value_float < 0,
			groupseparator = ',',
			decimalseparator = '.',
			negativeprefix = '(',
			negativesuffix = ')',
			thousand_string = '',
			beforeValue = true,
			sessionInfo = SC.getSessionInfo && SC.getSessionInfo('currentCurrency');

		if (isNaN(value_float)) {
			return value;
		}

		value_float = parseInt((Math.abs(value_float) + 0.005) * 100, 10) / 100;

		var value_string = value_float.toString(),
			settings = SC && SC.ENVIRONMENT && SC.ENVIRONMENT.siteSettings ? SC.ENVIRONMENT.siteSettings : {};

		if (Object.prototype.hasOwnProperty.call(window, 'groupseparator')) {
			groupseparator = window.groupseparator;
		} else if (Object.prototype.hasOwnProperty.call(settings, 'groupseparator')) {
			groupseparator = settings.groupseparator;
		}

		if (Object.prototype.hasOwnProperty.call(window, 'decimalseparator')) {
			decimalseparator = window.decimalseparator;
		} else if (Object.prototype.hasOwnProperty.call(settings, 'decimalseparator')) {
			decimalseparator = settings.decimalseparator;
		}

		if (Object.prototype.hasOwnProperty.call(window, 'negativeprefix')) {
			negativeprefix = window.negativeprefix;
		} else if (Object.prototype.hasOwnProperty.call(settings, 'negativeprefix')) {
			negativeprefix = settings.negativeprefix;
		}

		if (Object.prototype.hasOwnProperty.call(window, 'negativesuffix')) {
			negativesuffix = window.negativesuffix;
		} else if (Object.prototype.hasOwnProperty.call(settings, 'negativesuffix')) {
			negativesuffix = settings.negativesuffix;
		}

		value_string = value_string.replace('.', decimalseparator);
		var decimal_position = value_string.indexOf(decimalseparator);

		// if the string doesn't contains a .
		if (!~decimal_position) {
			if (!noDecimalPosition) {
				value_string += decimalseparator + '00';
			}
			decimal_position = value_string.indexOf(decimalseparator);
		}
		// if it only contains one number after the .
		else if (value_string.indexOf(decimalseparator) === (value_string.length - 2)) {
			value_string += '0';
		}

		for (var i = value_string.length - 1; i >= 0; i--) {
			//If the distance to the left of the decimal separator is a multiple of 3 you need to add the group separator
			thousand_string = (i > 0 && i < decimal_position && (((decimal_position - i) % 3) === 0) ? groupseparator : '') +
				value_string[i] + thousand_string;
		}

		if (!symbol) {
			if (!sessionInfo) {
				if (settings.shopperCurrency) {
					beforeValue = settings.shopperCurrency.beforeValue;
					symbol = settings.shopperCurrency.symbol;

					if (!beforeValue && symbol) {
						var matchingcurrency = _.findWhere(settings.currencies, {
							symbol: symbol
						});

						if (matchingcurrency) {
							beforeValue = (matchingcurrency.symbolplacement == 1);
						}
					}
				}
			} else {
				beforeValue = sessionInfo.beforeValue;
				symbol = sessionInfo.symbol;
			}

			if (!symbol) {
				symbol = '$';
			}
		}

		value_string = negative ? (negativeprefix + thousand_string + negativesuffix) : thousand_string;

		return beforeValue || _.isUndefined(beforeValue) ? symbol + value_string :
			value_string + symbol;
	}

	// @method formatQuantity Formats with commas as thousand separator (e.g. for displaying quantities)
	// @param {String} number @return {String} the formatted quantity.
	function formatQuantity(number) {
		var result = [],
			parts = ('' + number).split('.'),
			integerPart = parts[0].split('').reverse();

		for (var i = 0; i < integerPart.length; i++) {
			if (i > 0 && (i % 3 === 0) && integerPart[i] !== '-') {
				result.unshift(',');
			}

			result.unshift(integerPart[i]);
		}

		if (parts.length > 1) {
			result.push('.');
			result.push(parts[1]);
		}

		return result.join('');
	}

	// @method highlightKeyword  given a string containing a keyword it highlights it using html strong @param {String} text @param {String} keyword
	function highlightKeyword(text, keyword) {
		text = text || '';
		text = _.escape(text);
		if (!keyword) {
			return text;
		}

		keyword = trim(keyword).replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');

		return text.replace(new RegExp('(' + keyword + ')', 'ig'), function ($1, match) {
			return '<strong>' + match + '</strong>';
		});
	}

	// @method collectionToString iterates a collection of objects, runs a custom function getValue on each item and then joins them
	// @param {Object} options @returns {String}
	function collectionToString(options) {
		var temp = [];
		_.each(options.collection, function (item) {
			temp.push(options.getValue(item));
		});

		return temp.join(options.joinWith);
	}

	// @method addParamsToUrl
	// @param {String} baseUrl
	// @param {Object} params the params mapping to add @return {String}
	// @param {Boolean} avoidDoubleRedirect If true it will modify all the url parameters to be prepended with __. We do this to prevent Netsuite platform to process some parameters and generate a double redirect. See searchApi.ssp
	// @return {String}
	function addParamsToUrl(baseUrl, params, avoidDoubleRedirect) {
		if (avoidDoubleRedirect) {
			var new_params = {};
			_.each(params, function (param_value, param_key) {
				new_params['__' + param_key] = param_value;
			});
			params = new_params;
		}

		// We get the search options from the config file
		if (baseUrl && !_.isEmpty(params)) {
			var paramString = jQuery.param(params),
				join_string = ~baseUrl.indexOf('?') ? '&' : '?';

			return baseUrl + join_string + paramString;
		}

		return baseUrl;
	}

	// @method getDecodedURLParameter
	// Takes an url parameter and returns a decoded version of it, if decodeURIComponent() wasn't previously called.
	// Otherwise, returns the character itself.
	// It prevents decodeURIComponent() function gets called twice over the same url parameter (EX: url_parameter = 10%+%20OFF)
	// @param  {String} url_parameter
	// @return {String}
	function getDecodedURLParameter(url_parameter) {
		url_parameter = url_parameter || '';
		var position;
		for (var temporal = '';
			(position = url_parameter.indexOf('%')) >= 0; url_parameter = url_parameter.substring(position + 3)) {
			temporal += url_parameter.substring(0, position);
			var extract = url_parameter.substring(position, position + 3);
			try {
				temporal += decodeURIComponent(extract);
			} catch (e) {
				temporal += extract;
			}
		}
		return temporal + url_parameter;
	}

	// @method parseUrlOptions
	// Takes a url with options (or just the options part of the url) and returns an object. You can do the reverse operation (object to url string) using jQuery.param()
	// @param {String} options_string
	// @return {ParameterOptions}
	function parseUrlOptions(options_string) {
		options_string = options_string || '';

		if (~options_string.indexOf('?')) {
			options_string = _.last(options_string.split('?'));
		}

		if (~options_string.indexOf('/')) {
			options_string = _.last(options_string.split('/')); //02/07/2019 Saad
		}

		if (~options_string.indexOf('#')) {
			options_string = _.first(options_string.split('#'));
		}
		//@class ParameterOptions @extend Dictionary<String,String>
		//This class is used as a dictionary where each string key is a parameter from the passed in string and each value
		//is the corresponding value from the string being decodeURIComponent.
		//Example
		// input: /some-item?quantity=2&custcol3=12
		// output: {quantity: decodeURIComponent(2), custcol3: decodeURIComponent(12)}

		var options = {};

		if (options_string.length > 0) {
			var tokens = options_string.split(/\&/g),
				current_token;

			while (tokens.length > 0) {
				current_token = tokens.shift().split(/\=/g);
				if (current_token[0].length === 0) {
					continue;
				}
				options[current_token[0]] = Utils.getDecodedURLParameter(current_token[1]);
			}
		}

		return options;
	}


	// @method hyphenate simple hyphenation of a string, replaces non-alphanumerical characters with hyphens
	// @param {String} string
	// @returns {String}
	function hyphenate(string) {
		return string.replace(/[\W]/g, '-');
	}

	var objectToAtrributesKeyMap = [
		'href', 'id', 'title'

		, 'data', 'data-hashtag', 'data-touchpoint', 'data-permissions'
	];

	// @method objectToAtrributes @param {Object} obj @param {String} prefix @return {String}
	function objectToAtrributes(obj, prefix) {
		prefix = prefix || '';

		return _.reduce(obj, function (memo, value, key) {
			var prefixKey = prefix + key;

			//filters attributes
			if (_.contains(objectToAtrributesKeyMap, prefixKey) === false) {
				return memo;
			}

			if (_.isObject(value)) {
				return memo + objectToAtrributes(obj[key], key + '-');
			} else if (_.isArray(value) === true) {
				return memo + ' ' + _.escape(prefixKey) + '="' + _.escape(value.join(' ')) + '"';
			} else {
				return memo + ' ' + _.escape(prefixKey) + '="' + _.escape(value) + '"';
			}

		}, '');
	}

	// @method isTargetActionable
	// @param {Event} event
	// @return {Boolean}
	function isTargetActionable(event) {
		//return true if the target is actionable
		var target = jQuery(event.target),
			targetTagName = target.prop('tagName').toLowerCase(),
			targetParentTagName = target.parent().prop('tagName').toLowerCase(),
			isCheckbox = target.prop('type') === 'checkbox';

		return targetTagName === 'a' || targetParentTagName === 'a' ||
			targetTagName === 'i' || targetParentTagName === 'button' ||
			targetTagName === 'button' ||
			(targetTagName === 'input' && isCheckbox === false);
	}

	// @method resizeImage @param {Array<Object>} sizes @param {String} url @param {String} size the size id @return {String}
	function resizeImage(sizes, url, size) {
		var resize = _.where(sizes, {
			name: size
		})[0];
		url = url || '';

		if (!!resize) {
			return url + (~url.indexOf('?') ? '&' : '?') + resize.urlsuffix;
		}

		return url;
	}


	function getArrObjOrderClientList(paramArrObjClientList, paramObjFilters) { // 03/07/2019 Saad
		var retArrObj = [];
		var filterName = '';
		var filterEmail = '';
		var filterPhone = '';

		var hasFilters = false;
		var hasFilterName = false;
		var hasFilterEmail = false;
		var hasFilterPhone = false;

		var arrObjClientList = paramArrObjClientList;
		var objFilters = paramObjFilters;
		var arrObjClientListTotal = (!_.isNull(arrObjClientList)) ? arrObjClientList.length : 0;
		var hasArrObjClientList = (arrObjClientListTotal != 0) ? true : false;


		var hasObjFilters = (!_.isNull(objFilters)) ? true : false;
		var checkFullName = false;
		if (hasObjFilters) {
			filterName = (isObjectExist(objFilters['name'])) ? $.trim(objFilters['name']) : '';
			filterEmail = (isObjectExist(objFilters['email'])) ? $.trim(objFilters['email']) : '';
			filterPhone = (isObjectExist(objFilters['phone'])) ? $.trim(objFilters['phone']) : '';
		}

		hasFilterName = (!_.isNull(filterName)) ? true : false;
		hasFilterEmail = (!_.isNull(filterEmail)) ? true : false;
		hasFilterPhone = (!_.isNull(filterPhone)) ? true : false;
		hasFilters = (hasFilterName || hasFilterEmail || hasFilterPhone) ? true : false;

		try {
			if (hasArrObjClientList && hasFilters) {

				filterName = (hasFilterName) ? filterName.toUpperCase() : '';
				filterEmail = (hasFilterEmail) ? filterEmail.toUpperCase() : '';
				filterPhone = (hasFilterPhone) ? filterPhone.toUpperCase() : '';

				var arrFilterName = (hasFilterName) ? filterName.split(' ') : [];
				var arrFilterNameTotal = (!_.isNull(arrFilterName)) ? arrFilterName.length : 0;
				var hasArrFilterName = (arrFilterNameTotal != 0) ? true : false;
				if (arrFilterNameTotal > 1) checkFullName = true;

				for (var dx = 0; dx < arrObjClientListTotal; dx++) {
					var isAlreadyAdded = false;
					var refFirstNameValue = (!_.isNull(arrObjClientList[dx]['custrecord_tc_first_name'])) ? $.trim(arrObjClientList[dx]['custrecord_tc_first_name']).toUpperCase() : '';
					var refLastNameValue = (!_.isNull(arrObjClientList[dx]['custrecord_tc_last_name'])) ? $.trim(arrObjClientList[dx]['custrecord_tc_last_name']).toUpperCase() : '';
					var refEmailValue = (!_.isNull(arrObjClientList[dx]['custrecord_tc_email'])) ? $.trim(arrObjClientList[dx]['custrecord_tc_email']).toUpperCase() : '';
					var refPhoneValue = (!_.isNull(arrObjClientList[dx]['custrecord_tc_phone'])) ? $.trim(arrObjClientList[dx]['custrecord_tc_phone']) : '';
					var hasRefFirstName = (!_.isNull(refFirstNameValue)) ? true : false;
					var hasRefLastName = (!_.isNull(refLastNameValue)) ? true : false;
					var hasRefEmail = (!_.isNull(refEmailValue)) ? true : false;
					var hasRefPhone = (!_.isNull(refPhoneValue)) ? true : false;

					if (!isAlreadyAdded && hasFilterName) {
						if (!isAlreadyAdded && hasArrFilterName) {
							for (var xj = 0; xj < arrFilterNameTotal; xj++) {
								if (!checkFullName) {
									var stFilterName = arrFilterName[xj];
									if (!isAlreadyAdded && stFilterName == refFirstNameValue) {
										retArrObj.push(arrObjClientList[dx]);
										isAlreadyAdded = true;
									}

									if (!isAlreadyAdded && stFilterName == refLastNameValue) {
										retArrObj.push(arrObjClientList[dx]);
										isAlreadyAdded = true;
									}
								} else {
									var completename = refFirstNameValue + ' ' + refLastNameValue
									if (!isAlreadyAdded && completename.indexOf(filterName) != -1) { // 19/11/2019 Umar Zulfiqar {RFQ: Fix for Getting Client Names}
										retArrObj.push(arrObjClientList[dx]);
										isAlreadyAdded = true;
									}
								}
							}
						}
					}

					if (!isAlreadyAdded && hasFilterEmail) {
						//if (refEmailValue.indexOf(filterEmail) >= 0)
						if (refEmailValue == filterEmail) {
							retArrObj.push(arrObjClientList[dx]);
							isAlreadyAdded = true;
						}
					}

					if (!isAlreadyAdded && hasFilterPhone) {
						if (refPhoneValue.indexOf(filterPhone) >= 0) {
							retArrObj.push(arrObjClientList[dx]);
							isAlreadyAdded = true;
						}
					}

				}

			}


		} catch (ex) {
			retArrObj = [];
		}
		return retArrObj;
	}

	function isObjectExist(objFld) {
		var isObjExist = (typeof objFld != "undefined") ? true : false;
		return isObjExist;
	}

	// @method getThemeAbsoluteUrlOfNonManagedResources @param {String} file @returns {String}
	function getThemeAbsoluteUrlOfNonManagedResources(default_value, file) {
		if (!file) {
			file = '';
			if (SC.ENVIRONMENT.isExtended) {
				file = (SC.ENVIRONMENT.themeAssetsPath || '');
			} else if (SC.ENVIRONMENT.BuildTimeInf && SC.ENVIRONMENT.BuildTimeInf.isSCLite) {
				if (SC.CONFIGURATION.unmanagedResourcesFolderName) {
					file = 'site/' + SC.CONFIGURATION.unmanagedResourcesFolderName + '/';
				} else {
					file = 'default/';
				}
			}

			file += default_value;
		}

		return getAbsoluteUrl(file);

	}

	// @method urlIsAbsolute @param {String} url @returns {Boolean}
	function isUrlAbsolute(url) {
		return /^https?:\/\//.test(url);
	}

	// @method getAbsoluteUrl @param {String} file @returns {String}
	function getAbsoluteUrl(file, isServices2) {
		var base_url = SC && SC.ENVIRONMENT && SC.ENVIRONMENT.baseUrl || '',
			fileReplace = file ? file : '';
		return base_url && !isUrlAbsolute(file) ? (isServices2 ? base_url.replace('-dev-', '-src-').replace('/{{file}}', '_ss2/' + fileReplace) : base_url.replace('{{file}}', fileReplace)) : file;
	}

	// @method getAbsoluteUrlOfNonManagedResources @param {String} file @returns {String}
	function getAbsoluteUrlOfNonManagedResources(file) {
		return getAbsoluteUrl(file);
	}

	// @method getDownloadPdfUrl @param {Object} params @returns {String}
	function getDownloadPdfUrl(params) {
		params = params || {};
		params.n = SC && SC.ENVIRONMENT && SC.ENVIRONMENT.siteSettings && SC.ENVIRONMENT.siteSettings.siteid || '';

		return _.addParamsToUrl(_.getAbsoluteUrl('download.ssp'), params);
	}

	// @method getWindow The reason for this method is be able to test logic regarding window.location - so tests can mock the window object @return {HTMLElement} the window global object
	function getWindow() {
		return window;
	}

	// @method doPost Performs a POST operation to a specific url @param {String} url
	function doPost(url) {
		var form = jQuery('<form id="do-post" method="POST" action="' + url + '"></form>').hide();

		// we have to append it to the dom  for browser compatibility
		// check if the form already exists (user could cancel the operation before it gets to the submit)
		var do_post = jQuery('#do-post');
		if (do_post && do_post[0]) {
			do_post[0].action = url;
			do_post[0].method = 'POST';
		} else {
			jQuery('html').append(form);
			do_post = jQuery('#do-post');
		}

		do_post[0].submit();
	}

	// @method getPathFromObject @param {Object} object @param {String} path a path with values separated by dots @param {Any} default_value value to return if nothing is found.
	function getPathFromObject(object, path, default_value) {
		if (!path) {
			return object;
		} else if (object) {
			var tokens = path.split('.'),
				prev = object,
				n = 0;

			while (!_.isUndefined(prev) && n < tokens.length) {
				prev = prev[tokens[n++]];
			}

			if (!_.isUndefined(prev)) {
				return prev;
			}
		}

		return default_value;
	}

	// @method setPathFromObject @param {Object} object @param {String} path a path with values separated by dots @param {Any} value the value to set
	function setPathFromObject(object, path, value) {
		if (!path) {
			return;
		} else if (!object) {
			return;
		}

		var tokens = path.split('.'),
			prev = object;

		for (var token_idx = 0; token_idx < tokens.length - 1; ++token_idx) {
			var current_token = tokens[token_idx];

			if (_.isUndefined(prev[current_token])) {
				prev[current_token] = {};
			}
			prev = prev[current_token];
		}

		prev[_.last(tokens)] = value;
	}

	// @method ellipsis creates the ellipsis animation (used visually while waiting to something) @param {String} selector
	function ellipsis(selector) {
		if (!jQuery(selector).data('ellipsis')) {
			var values = ['', '.', '..', '...', '..', '.'],
				count = 0,
				timer = null,
				element = jQuery(selector);

			element.data('ellipsis', true);
			element.css('visibility', 'hidden');
			element.html('...');
			element.css('width', element.css('width'));
			element.css('display', 'inline-block');
			element.html('');
			element.css('visibility', 'visible');

			timer = setInterval(function () {
				if (jQuery(selector).length) {
					element.html(values[count % values.length]);
					count++;
				} else {
					clearInterval(timer);
					element = null;
				}
			}, 250);
		}
	}

	// @method reorderUrlParams
	// @param {String} url
	// @return {String} the url with reordered parameters
	function reorderUrlParams(url) {
		var params = [],
			url_array = url.split('?');

		if (url_array.length > 1) {
			params = url_array[1].split('&');
			return url_array[0] + '?' + params.sort().join('&');
		}

		return url_array[0];
	}

	// @method isShoppingDomain determines if we are in shopping domain (secure or non secure)
	// or single domain
	// @return {Boolean} true if in checkout or in single domain
	function isShoppingDomain() {
		return SC.ENVIRONMENT.siteSettings.shoppingSupported;
	}

	// @method isCheckoutDomain determines if we are in a secure checkout
	// domain or in a secure single domain environment
	// @return {Boolean} true if in checkout or in single domain
	function isCheckoutDomain() {
		return SC.ENVIRONMENT.siteSettings.checkoutSupported;
	}

	// @method isSingleDomain determines if we are in a single domain environment
	// @return {Boolean} true if single domain
	function isSingleDomain() {
		return SC.ENVIRONMENT.siteSettings.isSingleDomain;
	}

	// @method isInShopping determines if we are in shopping ssp
	// used when there are frontend features only shown in the shopping domain
	// @return {Boolean} true if in shopping domain, false if in checkout or myaccount
	function isInShopping() {
		return _.isShoppingDomain() && (SC.ENVIRONMENT.SCTouchpoint === 'shopping' || SC.ENVIRONMENT.siteSettings.sitetype === 'STANDARD');
	}


	// @method isInCheckout determines if we are in checkout or my account ssp
	// @return {Boolean} true if in checkout domain
	function isInCheckout() {
		return !_.isSingleDomain() ? _.isCheckoutDomain() : _.isCheckoutDomain() && (SC.ENVIRONMENT.SCTouchpoint === 'checkout' || SC.ENVIRONMENT.SCTouchpoint === 'myaccount');
	}

	// @method getParameterByName @param {String} url @param {String} param_name
	function getParameterByName(url, param_name) {
		param_name = param_name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + param_name + '=([^&#]*)'),
			results = regex.exec(url);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	function isPageGenerator() {
		return _.result(SC, 'isPageGenerator') || _.result(SC, 'isPageGenerator');
	}

	var SCRIPT_REGEX = /<\s*script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

	//@function Remove script tags in a html text @param {String} text
	function removeScripts(text) {
		if (isPageGenerator() && text) {
			text = text.replace(/(<!--[\s\S]*?-->)/g, ' $1 '); //invalidates de XSS attack like <scr<!--cheat-->ipt> - keep the comment and add spaces
			while (SCRIPT_REGEX.test(text)) {
				text = text.replace(SCRIPT_REGEX, '');
			}
		}
		return text || '';
	}

	//@function Reduce unnecessary spaces in html texts @param {String} text
	function minifyMarkup(text) {
		return text
			// remove spaces between tags.
			.replace(/\>\s+</g, '><')
			// remove html comments that our markup could have.
			.replace(/<!--[\s\S]*?-->/g, '')
			// replace multiple spaces with a single one.
			.replace(/\s+/g, ' ');
	}

	function oldIE(version) {
		var ie_version = version || 7;
		// IE7 detection courtesy of Backbone
		// More info: http://www.glennjones.net/2006/02/getattribute-href-bug/
		var isExplorer = /msie [\w.]+/,
			docMode = document.documentMode;

		return (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= ie_version));
	}

	// @method require The motive for this method is being able to call require() of modules in-line without breaking amd-optimizer because we cannot use require() directly passing variables as dependencies because amd-optimizer will try to parse that and fail.
	// @param {Array<String>} dependencies
	// @param {Function} fn
	var requireModules;

	if (_.isFunction(window.require)) {
		requireModules = window.require;
	} else if (window.SCM) {
		requireModules = function (moduleName) {
			return window.SCM[moduleName];
		};
	} else {
		requireModules = function () {
			console.error('Impossible to retrieve dependencies');
		};
	}

	// we are caching window width so this won't work on window resize. Same for data-templates in views.
	var viewport_width = 0,
		viewport_height = 0;

	// @method resetViewportWidth resets viewport width explicitly to be updated on resize.
	function resetViewportWidth() {
		viewport_width = 0;
	}

	// @method getViewportWidth @return {Number} the width of the viewport in pixels
	function getViewportWidth() {
		return viewport_width || (viewport_width = jQuery(window).width());
	}

	// @method getViewportHeight @return {Number} the height of the viewport in pixels
	function getViewportHeight() {
		return viewport_height || (viewport_height = jQuery(window).height());
	}

	// @method selectByViewportWidth depending on current viewport width it will return one of the passed options that are named 'phone', 'tablet' or 'desktop'
	// @param {Object<String,Any>} options @param defaultValue @return {Any}
	function selectByViewportWidth(options, defaultValue) {
		var device = getDeviceType();
		return options[device] || defaultValue;
	}

	function getDeviceType(widthToCheck) {
		var width = widthToCheck ? widthToCheck : Utils.getViewportWidth();

		if (width < 768) {
			return 'phone';
		} else if (width < 992) {
			return 'tablet';
		} else {
			return 'desktop';
		}
	}

	function isPhoneDevice() {
		return getDeviceType() === 'phone';
	}

	function isTabletDevice() {
		return getDeviceType() === 'tablet';
	}

	function isDesktopDevice() {
		return getDeviceType() === 'desktop';
	}

	function isNativeDatePickerSupported() {
		var input = document.createElement('input');
		input.setAttribute('type', 'date');

		//if special input is not supported browser will fall back to text
		return input.type !== 'text';
	}

	function initBxSlider($element, options) {
		if ($element.bxSlider && !oldIE() && !SC.isPageGenerator()) {
			$element.bxSlider(options);
		}
		return $element;
	}

	function countItems(lines) {
		var item_count = 0;

		_.each(lines.models ? lines.models : lines, function (line) {
			item_count += line.get('quantity');
		});

		return item_count;
	}

	function getExponentialDelay(options) {
		var settings = options.settings || {
			base: 1.5,
			y: 0.8,
			retries: 2
		};

		return (Math.pow(settings.base, options.x) - settings.y) * 1000;
	}

	// @function imageFlatten
	// Helper function that receives the itemimages_detail (returned by the search api)
	// and flattens it into an array of objects containing url and altimagetext
	// @param {Object} images Receives the itemimages_detail (returned by the search api) which is a multi-level tree-like object grouped by "categories"
	// @return {Array<ImageContainer>}
	function imageFlatten(images) {
		if ('url' in images && 'altimagetext' in images) {
			return [images];
		}

		return _.flatten(_.map(images, function (item) {
			if (_.isArray(item)) {
				return item;
			}

			return imageFlatten(item);
		}));
	}

	// @method generateUrl
	// Generate site from url
	// @param {String} site - Ssp file name
	// @param {String} [omitSearchParameter] - Parameter to be omitted in the search
	// @return {String} Url genearated from site
	function generateUrl(site, omitSearchParameter) {
		var ssp = site + (window.location.href.indexOf('-local.ssp') !== -1 ? '-local.ssp' : '.ssp');
		var url = ssp + window.location.search;
		if (omitSearchParameter) {
			url = omitParameter(window.location.search, omitSearchParameter, ssp);
		}

		return window.location.pathname.replace(/\/c.(\w+)\/pos\/(.*)/, '/c.$1/pos/' + url);
	}

	// @method omitParameter
	// Omit parameter from url
	// @param {String} url - Url where the parameter is ommited
	// @param {String} parameter - Parameter to be omitted
	// @param {String} site - Site where params are added
	// @return {String} Url genearated from site without the parameter
	function omitParameter(url, parameter, site) {
		var url_data = parseUrlOptions(url);
		delete url_data[parameter];
		return _.addParamsToUrl(site, url_data);

	}

	function getConfigurableImages(urls) {
		var deferreds = [];
		_.forEach(urls, function (url, name) {
			var deferred = jQuery.Deferred();
			deferreds.push(deferred);
			getBase64Image(url, function (imageAsString) {
				var result = {};
				result[name] = imageAsString;

				deferred.resolve(result);
			});
		});
		return deferreds;
	}

	// @method getBase64Image
	// Get a base64 representation of an image
	// @param {String} src - Url for the image to download
	// @param {String} callback - Function to invoke when the image is loaded and transformed
	// @param {String} outputFormat - format of the image to download (defaults to image/png)
	function getBase64Image(src, callback, outputFormat) {
		var img = new Image();
		// img.crossOrigin = 'Anonymous';
		img.onload = function () {
			var canvas = document.createElement('CANVAS'),
				context = canvas.getContext('2d');

			canvas.height = this.naturalHeight;
			canvas.width = this.naturalWidth;
			context.drawImage(this, 0, 0);

			var dataURL = canvas.toDataURL(outputFormat);
			callback(dataURL);
		};

		img.onerror = function (err) {
			callback();
		}

		img.src = src;
	}

	//Removes empty objects and arrays and deletes null, undefined and empty strings properties. This diminishes the total output weight and helps the templates
	//use ifs with the "has_content" function and get expected results.
	function cleanObject(json) {
		_.each(_.keys(json), function (key) {
			if ((!json[key] && json[key] !== 0 && json[key] !== false) || (_.isObject(json[key]) && _.isEmpty(json[key]))) {
				delete json[key];
			} else {
				cleanObject(json[key]);
			}

			//Check again in case all of the inner keys were deleted
			if (_.isObject(json[key]) && _.isEmpty(json[key])) {
				delete json[key];
			}
		});
	}


	function addFunc(collection, data) {

		var updatedCollection = collection.add(data);

		return updatedCollection;

	}

	// function replace(value)
	// {
	// 	var r1=value.replace("+", " ");

	// 	return r1;

	// }

	function resetFunc(collection) {

		// var updatedCollection = collection.reset();

		// return updatedCollection;

	}

	//Generate Block Measure Field values html.
	function blockMeasureField(field, value, increment, fieldset, blockSizes) { //19/08/2019 Saad //27-11-2019 saad
		if (field.name == "block") { //22/01/2020
			if (window.location.hash.indexOf('favouritefittools') != -1) {
				return "";
			}
		}

		var type = field.type,
			label = field.label,
			name = field.name,
			tempHtml = "",
			inputHtml = "";
		if (field.name == 'block' && blockSizes != undefined && !_.isEmpty(blockSizes)) {
			field.options = _.union(["Select"], blockSizes);
		} //27-11-2019 saad
		if (type == "select") {

			if (field.options && field.options.length) {
				tempHtml = '<div style="margin:0;" class="span2 col-wid-70"><select class="input input-small" data-field="' + name + '" id="body-' + name + '" name="' + name + '">';
				_.each(field.options, function (option) {
					var selected = value == option ? 'selected' : '';
					tempHtml = tempHtml + '<option value="' + option + '" ' + selected + '>' + option + '</option>'
				});
				tempHtml = tempHtml + '</select></div>';
			} else {
				if (!_.isUndefined(field.max) && !_.isNull(field.max)) {
					tempHtml = tempHtml + '<div style="margin:0;" class="span2 col-wid-20"><select class="input input-small block-measurement-fld" data-field="' + name + '" id="' + name + '-max" name="' + name + '-max">'
					for (var i = 0; i <= field.max; i = i + increment) {
						var selected = !_.isUndefined(value[1]) && parseFloat(value[1].value) == i ? 'selected' : '';
						tempHtml = tempHtml + '<option value="' + i + '" ' + selected + '>' + i + '</option>'
					}
					tempHtml = tempHtml + '</select></div>'
				}
				if (_.isNull(field.max)) {
					tempHtml = tempHtml + '<div style="margin:0;" class="span2 col-wid-20"><select class="input input-small block-measurement-fld" data-field="' + name + '" id="' + name + '-max" name="' + name + '-max">'
					tempHtml = tempHtml + '<option value="' + 0 + '">' + 0 + '</option>'
					tempHtml = tempHtml + '</select></div>'
				}
				if (!_.isUndefined(field.min) && !_.isNull(field.min)) {
					tempHtml = tempHtml + '<div style="margin:0;" class="span2 offset5p col-wid-20"><select class="input input-small block-measurement-fld" data-field="' + name + '" id="' + name + '-min" name="' + name + '-min">'
					for (var i = 0; i >= field.min; i = i - increment) {
						var selected = !_.isUndefined(value[0]) && parseFloat(value[0].value) == i ? 'selected' : '';
						tempHtml = tempHtml + '<option value="' + i + '" ' + selected + '>' + i + '</option>'
					}
					tempHtml = tempHtml + '</select></div>'
				}

				if (_.isNull(field.min)) {
					tempHtml = tempHtml + '<div style="margin:0;" class="span2 offset5p col-wid-20"><select class="input input-small block-measurement-fld" data-field="' + name + '" id="' + name + '-min" name="' + name + '-min">'
					tempHtml = tempHtml + '<option value="' + 0 + '">' + 0 + '</option>'
					tempHtml = tempHtml + '</select></div>'
				}

				if (window.location.hash.indexOf("favouritefittools") != -1) //27-11-2019 saad
				{
					tempHtml = tempHtml + '<div style="margin:0;" class="span3 col-wid-10"><input id="' + name + '-hide-checkbox" type="checkbox" name="' + name + '-hide-checkbox" value="true"/><br></br></div>';
				} else //27-11-2019 saad

				{
					if (fieldset.name == 'length' || fieldset.name == 'horizontals') {
						tempHtml = tempHtml + '<div style="margin:0;text-align:left; color:#c1c1c1;" class="span3 col-wid-10"><label style="font-weight:normal;color:#c1c1c1;" class="fav-fit-tools-default" id="' + name + '-default">---</label></div>' //06/01/2020 saad
						tempHtml = tempHtml + '<span style="margin:0;padding-left: 7px; color:#c1c1c1;" class="span-w-10 offset5p col-wid-10" data-container="' + name + '-block">&nbsp;</span>'
						tempHtml = tempHtml + '<span style="margin:0; color:#c1c1c1;" class="span-w-10 col-wid-10" data-container="' + name + '-finished">&nbsp;</span>'
					} else {
						tempHtml = tempHtml + '<div style="margin:0;text-align:left; color:#c1c1c1;" class="span3 col-wid-10"><label style="font-weight:normal;color:#c1c1c1;" class="fav-fit-tools-default" id="' + name + '-default">---</label></div>' //06/01/2020 saad
						tempHtml = tempHtml + '<div style="margin:0;" class="span3 col-wid-10">&nbsp;</div>'
						tempHtml = tempHtml + '<div style="margin:0;" class="span3 col-wid-10">&nbsp;</div>'

					}
					tempHtml = tempHtml + '<span id="' + name + '-hide-checkbox" type="hidden" name="' + name + '-hide-checkbox"></span>';
				} //27-11-2019 saad end

			}

		} else {
			tempHtml = '<input class="input input-small" type="text" data-field="' + name + '" id="' + name + '" name="' + name + '" />'
		}

		inputHtml = inputHtml + '<div class="row-fluid">';
		inputHtml = inputHtml + '<div class="span3 col-wid-30 label-fit-profile">' + label + '</div>';
		inputHtml = inputHtml + tempHtml;
		inputHtml = inputHtml + '</div>';
		return inputHtml;
	}


	//Generate Body Measure Field values html. // 29-11-2019 saad
	function bodyMeasureField(field, value, fieldset, baseAllowance, allowance, selectedItemType) {
		var type = field.type,
			label = field.label,
			name = field.name,
			tempHtml = "",
			inputHtml = "",
			finishValue = 0;

		var range = {
			"Neck": {
				min: 31,
				max: 59
			},
			"Shoulder": {
				min: 37,
				max: 67
			},
			"Chest": {
				min: 86,
				max: 184
			},
			"Waist": {
				min: 76,
				max: 182
			},
			"Hips": {
				min: 82,
				max: 184
			},
			"Upperarm": {
				min: 32,
				max: 60
			},
			"Sleeve-Left": {
				min: 52,
				max: 79
			},
			"Sleeve-Right": {
				min: 52,
				max: 79
			},
			"Cuff-Left": {
				min: 21,
				max: 33
			},
			"Cuff-Right": {
				min: 21,
				max: 33
			},
			"Back-Length": {
				min: 67,
				max: 95
			}
		};

		var measurementConfiguration = window.itemRangeConfig;

		var selectedProductType = selectedItemType;
		if (selectedProductType === '' || selectedProductType === null || selectedProductType === undefined) {
			selectedProductType = jQuery("#in-modal-custrecord_fp_product_type").val();
			if (selectedProductType === undefined || selectedProductType === null || selectedProductType === '') {
				selectedProductType = jQuery("#custrecord_fp_product_type").val();
			}
		}
		var selectedMeasurementConfig = _.findWhere(measurementConfiguration, {
			type: selectedProductType
		});

		if (selectedMeasurementConfig == null || selectedMeasurementConfig == undefined) {
			return "";
		}
		var config = _.findWhere(selectedMeasurementConfig.config, {
			name: name
		});
		if (config === null || config == undefined) {
			if (name === "Sleeve L" || name === "Sleeve-L") {
				config = _.findWhere(selectedMeasurementConfig.config, {
					name: "Sleeve L"
				});
			}
			if (name === "Sleeve R" || name === "Sleeve-R") {
				config = _.findWhere(selectedMeasurementConfig.config, {
					name: "Sleeve R"
				});
			}
		}


		if (type == "select") {
			tempHtml = '<select class="input" id="' + name + '" name="' + name + '">';
			if (field.options && field.options.length) {
				_.each(field.options, function (option) {

					if (value === null) {
						tempHtml = tempHtml + ' <option value="' + option + '">' + option + '</option>'
					} else {
						if (value.toString().replace(/\+/g, ' ') == option.replace(/\+/g, ' ')) {
							tempHtml = tempHtml + '<option value="' + option + '" selected>' + option + '</option>'
						} else {
							tempHtml = tempHtml + '<option value="' + option + '">' + option + '</option>'
						}
					}

				});
			}
			tempHtml = tempHtml + '</select>'
		} else {
			tempHtml = '<input class="input input-small body-measure-fld" type="number" step="any" id="' + name + '" name="' + name + '" value="' + value + '"/>'
		}


		if (value) {
			if (allowance) {
				finishValue = parseFloat(value) + parseFloat(allowance);
			} else {
				if (baseAllowance) {
					allowance = baseAllowance; //(parseFloat(value) * (parseFloat(baseAllowance) / 100))
					//finishValue = (parseFloat(value) * (parseFloat(baseAllowance) / 100)) + parseFloat(value);
					finishValue = parseFloat(value) + parseFloat(baseAllowance);
				} else {
					finishValue = value;
				}
			}
			finishValue = Math.round(finishValue * 10) / 10;
		}

		if (isNaN(finishValue)) {
			finishValue = 0;
		}

		if (finishValue == 'NaN') {
			finishValue = 0;
		}

		if (!finishValue) {
			finishValue = 0;
		}


		inputHtml = inputHtml + '<div class="row-fluid">';
		if (fieldset == "body-measurement") {

			inputHtml = inputHtml + '<div  style="width : 30%;margin:0;" class="span2 measurement">' + label + '</div>';
			inputHtml = inputHtml + '<div style="width : 20%;margin:0;" class="span3-profile measurement">';
			inputHtml = inputHtml + tempHtml;
			inputHtml = inputHtml + '</div>';
			inputHtml = inputHtml + '<div style="width : 20%;margin:0;" class="span3-profile measurement">';
			if (allowance) {
				inputHtml = inputHtml + '<input class="input input-small allowance-fld" type="number" step="any" id="allowance_' + name + '" name="allowance-' + name + '" value="' + allowance + '"/>';

			} else {
				inputHtml = inputHtml + '<input class="input input-small allowance-fld" type="number" step="any" id="allowance_' + name + '" name="allowance-' + name + '" value="' + baseAllowance + '"/>';
			}
			inputHtml = inputHtml + '</div>';
			inputHtml = inputHtml + '<div style="width : 20%;margin:0;text-align:center;" class="span3-profile measurement">';
			if (config != null) {
				inputHtml = inputHtml + '<span data-optional=" optional " min-value="' + config.min + '" max-value="' + config.max + '" id="finish_' + name + '" class="finishedClass">' + finishValue + '</span>'; //6/19/2019 Saad
			} else {
				inputHtml = inputHtml + '<span data-optional=" optional " id="finish_' + name + '" class="finishedClass">' + finishValue + '</span>'; //6/19/2019 Saad
			}
			inputHtml = inputHtml + '</div>';
			inputHtml = inputHtml + '<div style="width : 10%;margin:0;" class="span3-profile measurement">';
			if (config != null) {
				inputHtml = inputHtml + '<span id="range_' + name + '">(' + config.min + "-" + config.max + ')</span>';
			}
			inputHtml = inputHtml + '</div>';
		} else if (fieldset == "body-profile") {
			inputHtml = inputHtml + '<div  style="width : 30%;margin:0;" class="span2 measurement">' + label + '</div>';
			inputHtml = inputHtml + '<div  style="width : 20%;margin:0;" class="span3-profile measurement">';
			inputHtml = inputHtml + tempHtml;
			inputHtml = inputHtml + '</div>';
		} else {
			inputHtml = inputHtml + '<div  class="span2 measurement">' + label + '</div>';
			inputHtml = inputHtml + '<div  class="span3-profile measurement">';
			inputHtml = inputHtml + tempHtml;
			inputHtml = inputHtml + '</div>';
		}
		inputHtml = inputHtml + '</div>';
		return inputHtml;
	}

	//Generate Design Option Multi Field values html.
	function designOptionMultiField(fields, values) { //24-06-2019
		var inputHtml = '';

		if (fields) {
			_.each(fields.options, function (option) {
				inputHtml += '<div class="' + option.name + '">';
				inputHtml += '<h4>' + option.label + '</h4><hr/>';

				_.each(option.fields, function (field) {
					var value = _.where(values, {
						name: escape(field.name)
					});

					inputHtml += '<div class="control-group" data-input="' + field.name + '">';
					inputHtml += '<label class="control-label" for="' + field.name + '">' + field.label + '</label>';
					inputHtml += '<div class="controls">';
					// if(field.type=='text' || field.type=='number')
					// {
					// 	inputHtml += '<input class="input-xlarge" multiple id="' + field.name + '" name="' + field.name + '" style="width: 33%; !important>';

					// }
					// else{
						inputHtml += '<select class="input-xlarge" multiple id="' + field.name + '" name="' + field.name + '">';
					// }
					_.each(field.texts, function (text, count) {
						if (value[0] && value[0].value != "") {
							var tmpvalue = value[0].value;
							if (value[0].value.indexOf(',') != -1) {
								tmpvalue = value[0].value.split('+').join(' ');
								var temp = tmpvalue.split(',');
								if (temp.length > 0) {
									var tempindex = temp.indexOf(field.values[count]);
									if (tempindex != -1)
										tmpvalue = temp[tempindex];
								}
							} else {
								tmpvalue = value[0].value.split('+').join(' ');
							}

							if (tmpvalue == field.values[count]) {

								inputHtml += '<option value="' + field.values[count] + '"selected>' + text + '</option>';
							} else {
								inputHtml += '<option value="' + field.values[count] + '">' + text + '</option>';
							}
						} else {
							inputHtml += '<option value="' + field.values[count] + '">' + text + '</option>';
						}
					})
					inputHtml += '</select>';
					inputHtml += '</div>';
					inputHtml += '</div>';
				})
				inputHtml += '</div>';
			})
		}
		return inputHtml;
	}
	//Generate Design Option Single Field values html.
	function designOptionSingleField(fields, values, tag) {
		var inputHtml = '';
		var favouriteOptions;
		// if (SC._applications.MyAccount.getUser().get('favouriteOptions') && SC._applications.MyAccount.getUser().get('favouriteOptions') != "") {
		// 	favouriteOptions = JSON.parse(SC._applications.MyAccount.getUser().get('favouriteOptions'));
		// } else {
		favouriteOptions = values;
		// }



		if (fields && fields.options.length > 1) {

			inputHtml += '<div class="canvas_jacket">';
			_.each(fields.options, function (field, count) {
				inputHtml += '<div class="control-group" data-input="canvas_canvas_jacket">';
				inputHtml += '<h4>' + field.label + '</h4>';
				inputHtml += '<hr/>';
				_.each(field.fields, function (field_item, count) {
					//04-12-2019 umer & saad
					if (field_item.name.indexOf('TryonRestriction') !== -1) {
						return;
					}
					inputHtml += '<label class="control-label" for="canvas_canvas_jacket">' + field_item.label + '</label>';
					inputHtml += '<div class="controls">';

					inputHtml += '<select id="' + field_item.name + '" class="input-xlarge" name="' + field_item.name + '" data-type="fav-option-customization">';
					_.each(field_item.texts, function (texts, count) {
						inputHtml += '<option';
						if (favouriteOptions != ""){
							if( favouriteOptions[tag+'_'+field_item.name] && favouriteOptions[tag+'_'+field_item.name] == field_item.values[count] ){
								inputHtml += "selected"
							}else if( favouriteOptions[field_item.name] && favouriteOptions[field_item.name] == field_item.values[count] ){
							 	inputHtml += "selected"
							}
						}
						inputHtml += ' value="' + field_item.values[count] + '" >';
						inputHtml += texts;
						inputHtml += ' </option>';
					})
					inputHtml += '</select>';
					inputHtml += '</div>';
				})
				inputHtml += '</div>';
			})
			inputHtml += '</div>';

		}

		return inputHtml;
	}

	function requestUrl(id, deploy_id, type, params, json) {
		var BASE_URL = "/app/site/hosting/scriptlet.nl"
		var url = BASE_URL + "?script=" + id + "&deploy=" + deploy_id;

		if (json) {
			var req = jQuery.ajax({
				method: type,
				url: url,
				data: params,
				dataType: 'json'
			});
		} else {
			var req = jQuery.ajax({
				method: type,
				url: url,
				data: params
			});
		}

		return req;
	}

	function requestUrlAsync(id, deploy_id, type, params, json) { //03-12-2019 umar & saad
		var BASE_URL = "/app/site/hosting/scriptlet.nl"
		var url = BASE_URL + "?script=" + id + "&deploy=" + deploy_id;

		if (json) {
			var req = jQuery.ajax({
				method: type,
				url: url,
				async: false,
				data: params,
				dataType: 'json'
			});
		} else {
			var req = jQuery.ajax({
				method: type,
				url: url,
				async: false,
				data: params
			});
		}

		return req;
	}

	// countryOptions Code (Start)

	function countryOptions() { //19/08/2019 Saad

		var dummy_countries = ['Afghanistan', 'Alandislands', 'Albania', 'Algeria', 'Americansamoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica', 'Antiguaandbarbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bonairesainteustatiusandsaba', 'Bosniaandherzegovina', 'Botswana', 'Bouvetisland', 'Brazil', 'Britishindianoceanterritory', 'Bruneidarussalam', 'Bulgaria', 'Burkinafaso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Canaryislands', 'Capeverde', 'Caymanislands', 'Centralafricanrepublic', 'Ceutaandmelilla', 'Chad', 'Chile', 'China', 'Christmasisland', 'Cocoskeelingislands', 'Colombia', 'Comoros', 'Congodemocraticpeoplesrepublic', 'Congorepublicof', 'Cookislands', 'Costarica', 'Cotedivoire', 'Croatiahrvatska', 'Cuba', 'Curacao', 'Cyprus', 'Czechrepublic', 'Denmark', 'Djibouti', 'Dominica', 'Dominicanrepublic', 'Easttimor', 'Ecuador', 'Egypt', 'Elsalvador', 'Equatorialguinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falklandislands', 'Faroeislands', 'Fiji', 'Finland', 'France', 'Frenchguiana', 'Frenchpolynesia', 'Frenchsouthernterritories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guineabissau', 'Guyana', 'Haiti', 'Heardandmcdonaldislands', 'Holyseecityvaticanstate', 'Honduras', 'Hongkong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iranislamicrepublicof', 'Iraq', 'Ireland', 'Isleofman', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Koreademocraticpeoplesrepublic', 'Korearepublicof', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laopeoplesdemocraticrepublic', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshallislands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesiafederalstateof', 'Moldovarepublicof', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'Newcaledonia', 'Newzealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolkisland', 'Northernmarianaislands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papuanewguinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairnisland', 'Poland', 'Portugal', 'Puertorico', 'Qatar', 'Reunionisland', 'Romania', 'Russianfederation', 'Rwanda', 'Saintbarthelemy', 'Sainthelena', 'Saintkittsandnevis', 'Saintlucia', 'Saintmartin', 'Saintvincentandthegrenadines', 'Samoa', 'Sanmarino', 'Saotomeandprincipe', 'Saudiarabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierraleone', 'Singapore', 'Sintmaarten', 'Slovakrepublic', 'Slovenia', 'Solomonislands', 'Somalia', 'Southafrica', 'Southgeorgia', 'Southsudan', 'Spain', 'Srilanka', 'Stateofpalestine', 'Stpierreandmiquelon', 'Sudan', 'Suriname', 'Svalbardandjanmayenislands', 'Swaziland', 'Sweden', 'Switzerland', 'Syrianarabrepublic', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tokelau', 'Tonga', 'Trinidadandtobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turksandcaicosislands', 'Tuvalu', 'Uganda', 'Ukraine', 'Unitedarabemirates', 'Unitedkingdom', 'Unitedstates', 'Uruguay', 'Usminoroutlyingislands', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Virginislandsbritish', 'Virginislandsusa', 'Wallisandfutunaislands', 'Westernsahara', 'Yemen', 'Zambia', 'Zimbabwe', ''];

		var template = "<option value='' disabled selected>-- Select --</option>";

		dummy_countries.forEach(function (i) {
			template += "<option value='" + i + "'>" + i + "</option>";
		}, this);
		return template;
	}

	// countryOptions Code (End)

	// countryOptions Code (Start)

	function cityOptions() {

		var dummy_cities = ['Lahore', 'Mumbai', 'Welington', 'California', 'Ottawa'];

		var template = "";

		dummy_cities.forEach(function (i) {
			template += "<option value='" + i + "'>" + i + "</option>";
		}, this);

		return template;
	}

	// cityOptions Code (End)

	// swxMyAccountClientProfileDetails Funtion (Start)

	function swxMyAccountClientProfileDetails(paramObjClient, paramClientId, paramCurrentUserId) {

		var template = "";

		template += '<div class="modal fade" id="myModal2" role="dialog" data-backdrop="static">'; // zain 15-07-19
		template += '<div class="modal-dialog">';


		template += '<div class="modal-content">';
		template += '<div class="modal-header">';
		template += ' <button type="button" class="close cancel-action" data-dismiss="modal">&times;</button>'; // zain 15-07-19
		template += '<h4 class="modal-title">Edit Client</h4>'; //18/07/2019 Saad
		template += '</div>';
		template += '<div class="modal-body">';
		template += ' <div id="clientmodal">';
		template += '</div>';

		template += ' </div>';
		template += '<div class="modal-footer" >';
		template += '<p class="actions">';
		template += '<a class="custom-btn save-action-edit" data-dismiss="modal">';
		template += 'Save';
		template += ' </a>';

		template += '<a class="custom-btn cancel-action" data-dismiss="modal">';
		template += 'Cancel';
		template += '</a>';
		template += '</p>';
		template += '</div>';
		template += '</div>';

		template += '</div>';
		template += ' </div>';

		var clientInternalId = paramClientId;

		//	var clientInternalId = 1089;

		var clientDateCreated = '';
		var clientFirstName = 'Firstname';
		var clientLastName = 'Lastname';
		var clientName = '';
		var clientEmail = '';
		var clientPhone = '1234567';
		var clientCompany = '';
		var clientDateOfBirth = '';
		var clientAddr1 = '';
		var clientAddr2 = '';
		var clientAddress = '';
		var clientNotes = '';

		var arrObjRef = paramObjClient;
		var arrObjRefTotal = (!_.isNull(arrObjRef)) ? arrObjRef.length : 0;
		var hasObjRef = (arrObjRefTotal != 0) ? true : false;

		if (hasObjRef) {
			for (var dx = 0; dx < arrObjRefTotal; dx++) {
				var refClientInternalId = arrObjRef[dx]['internalid'];
				var isRefClientInternalIdEqualToClientInternalId = (refClientInternalId == clientInternalId) ? true : false;

				if (isRefClientInternalIdEqualToClientInternalId) {
					clientAddress = '';
					var refClientFirstName = arrObjRef[dx]['custrecord_tc_first_name'];
					var refClientFirstLastName = arrObjRef[dx]['custrecord_tc_last_name'];

					var refClientAddr1 = arrObjRef[dx]['custrecord_tc_addr1'];
					var refClientAddr2 = arrObjRef[dx]['custrecord_tc_addr2'];
					var refClientState = arrObjRef[dx]['custrecord_tc_state'];
					var refClientCountry = arrObjRef[dx]['custrecord_tc_country'];
					var refClientZip = arrObjRef[dx]['custrecord_tc_zip'];

					var hasRefClientAddr1 = (!_.isNull(refClientAddr1)) ? true : false;
					var hasRefClientAddr2 = (!_.isNull(refClientAddr2)) ? true : false;
					var hasRefClientState = (!_.isNull(refClientState)) ? true : false;
					var hasRefClientCountry = (!_.isNull(refClientCountry)) ? true : false;
					var hasRefClientZip = (!_.isNull(refClientZip)) ? true : false;

					clientAddress += (hasRefClientAddr1) ? refClientAddr1 + ', ' : '';
					clientAddress += (hasRefClientAddr2) ? refClientAddr2 + ', ' : '';
					clientAddress += (hasRefClientState) ? refClientState + ', ' : '';
					clientAddress += (hasRefClientCountry) ? refClientCountry : '';
					clientAddress += (hasRefClientZip) ? ', ' + refClientZip : '';

					clientName += refClientFirstName + ' ' + refClientFirstLastName;
					clientDateCreated = arrObjRef[dx]['created'];
					clientEmail = arrObjRef[dx]['custrecord_tc_email'];
					clientPhone = arrObjRef[dx]['custrecord_tc_phone'];
					clientCompany = arrObjRef[dx]['custrecord_tc_company'];
					clientDateOfBirth = arrObjRef[dx]['custrecord_tc_dob'];
					clientNotes = arrObjRef[dx]['custrecord_tc_notes'];

					break;
				}
			}
		}

		var yetVisited = localStorage['clientid'];
		localStorage['clientid'] = clientInternalId;
		var setclientid = window.localStorage.setItem("clientid", clientInternalId);


		//template += '<div id="swx-client-profile-view">';
		// zain 26-08-19 start
		template += '<style>.button-wrap-client-profile button:hover, .button-wrap-client-profile a:hover, .modal-footer p a.save-action-edit:hover,.modal-footer p a.cancel-action:hover, .modal-footer a.save-action:hover{background: #cccccc !important; text-decoration:none !important;}.modal-footer p a.save-action-edit,.modal-footer p a.cancel-action, .modal-footer p a.save-action{background: linear-gradient(to bottom, white, #e6e6e6);border-radius: 5px;border: 1px solid #e6e6e6;color: #656363;}#clientedit_form #country{width:100%;}#clientedit_form .control-group{width:50%; margin-bottom:10px;}</style>';
		template += '<div id="swx-client-profile-view">';
		template += '<div class="row-fluid">';
		template += '<div class="span12" style="margin-bottom: 10px;" id="fitProfileClientName">' + clientName + '</div>';
		template += '</div>';
		template += '<div id="fitProfileClientInternalId" class="row-fluid" style="display:none;">' + clientInternalId + '</div>';
		template += '<div class="row-fluid" style="overflow:hidden;">';
		template += '<div class="span6" style="width:100%;">';

		template += '<div style="width:50%; float:left;">';
		template += '<div style="float: left; padding-right: 5px;"><span style="font-size: 12px; font-weight: 600;">Email:</span></div>';
		template += '<div style="float: left;"><span style="font-size: 12px;" id="clientEmail">' + clientEmail + ' </span></div>';
		template += '<div style="clear: both;"></div>';
		template += '</div>';

		template += '<div style="float: left; padding-right: 5px;"><span style="font-size: 12px; font-weight: 600;">DOB:</span></div>';
		template += '<div style="float: left;"><span style="font-size: 12px;" id="clientDOB">' + clientDateOfBirth + '</span></div>';
		template += '<div style="clear: both;"></div>';
		template += '</div>';

		template += '<div style="width:50%; float:left;">';
		template += '<div style="float: left; padding-right: 5px;"><span style="font-size: 12px; font-weight: 600;">Phone:</span></div>';
		template += '<div style="float: left;"><span style="font-size: 12px;" id="clientPhone">' + clientPhone + '</span></div>';
		template += '<div style="clear: both;"></div>';
		template += '</div>';

		template += '<div style="width:50%; float:left;">';
		template += '<div style="float: left; padding-right: 5px;"><span style="font-size: 12px; font-weight: 600;">Address:</span></div>';
		template += '<div style="float: left;"><span style="font-size: 12px;" id="clientAddress">' + clientAddress + '</span></div>';
		template += '<div style="clear: both;"></div>';
		template += '</div>';

		template += '<div style="width:50%; float:left;">';
		template += '<div style="float: left; padding-right: 5px;"><span style="font-size: 12px; font-weight: 600;">Company:</span></div>';
		template += '<div style="float: left;"><span style="font-size: 12px;" id="clientCompany">' + clientCompany + '</span></div>';
		template += '<div style="clear: both;"></div>';
		template += '</div>';

		template += '<div style="width:50%; float:left;">';


		template += '<div style="width:50%; float:left;">';
		template += '<div style="float: left; padding-right: 5px;"><span style="font-size: 12px; font-weight: 600;">Date Created:</span></div>';
		template += '<div style="float: left;"><span style="font-size: 12px;">' + clientDateCreated + '</span></div>';
		template += '<div style="clear: both;"></div>';
		template += '</div>';
		// zain 26-08-19 end

		template += '</div>';

		template += '</div>';

		template += '<div class="row-fluid" style="width:50%; float:left;padding-top:5px;">';
		template += '<div class="span12">';
		template += '<div><span style="font-size: 12px; font-weight: 600;float:left;padding-right:5px;">Client Notes:</span></div>';
		template += '<div style="font-size: 12px;" id="clientNotes">' + clientNotes + '</div>';
		template += '</div>';
		template += '</div>';

		template += '<div class="button-wrap-client-profile" style="margin-top: 40px;clear:both;overflow:hidden;">';
		template += '<div class="row-fluid">';
		template += '<div class="span8">';
		template += '<div class="row-fluid">';

		template += '<div class="span4" style="width:25%; float:left;">';
		template += '<div>';
		template += '<button id="client-edit" data-toggle="modal" data-target="#myModal2" class="btn">View & Edit</button>'; //zain 28-08-19
		template += '</div>';
		template += '<div id="mobile-only" style="height: 10px;"></div>';
		template += '</div>';

		template += '<div class="span4" style="float: left;width: 25%;">';
		//template += '<div><a data-id="clientInternalId" data-type="client" data-action="remove-rec-client" class="btn" style="width: 83%; padding-top: 4px; padding-bottom: 4px; padding-left: 0px; padding-right: 0px;background: linear-gradient(to bottom, white, #e6e6e6);border-radius: 5px;border: 1px solid #e6e6e6;color: #656363;">Remove</a></div>';
		template += '<div><a data-id="'+clientInternalId+'" id="remove-client-button-2" data-type="client" data-action="remove-rec-client" class="btn">Remove</a></div>'; // 26-07-19 //zain 28-08-19
		template += '<div id="mobile-only" style="height: 10px;"></div>';
		template += '</div>';

		template += '<div class="span4" style="float: left;width: 25%;">';
		template += '<div><a href="/item-type?client=' + clientInternalId + '" data-touchpoint="home" data-hashtag="#item-type?client=' + clientInternalId + '" class="btn btn-primary" style="width: 83%; padding-top: 4px; padding-bottom: 4px; padding-left: 0px; padding-right: 0px;background: linear-gradient(to bottom, #f5f5f5, #cccccc);border-radius: 5px;border: 1px solid #e6e6e6;color: #656363;"><b>Create Order</b></a></div>';
		template += '<div id="mobile-only" style="height: 10px;"></div>';
		template += '</div>';
		template += '</div>';


		template += '</div>';
		template += '<div class="span4" style="float: left;width: 24%;">';

		template += '<div class="row-fluid">';
		template += '<div class="span9">';
		template += '<div><button id="swx-back-to-client-profile-search" class="btn btn-primary" style="width: 100%; padding-top: 4px; padding-bottom: 4px; padding-left: 6px; padding-right:6px;float:right;background: linear-gradient(to bottom, #f5f5f5, #cccccc);border-radius: 5px;border: 1px solid #e6e6e6;color: #656363;"><b>Back to Client Search<b/></button></div>'; // zain 30-08-19
		template += '<div id="mobile-only" style="height: 10px;"></div>';
		template += '</div>';
		template += '</div>';

		template += '</div>';
		template += '</div>';
		template += '</div>';

		template += '<div style="margin-top: 10px; margin-bottom: 20px; border-bottom: solid 1px #eaeaea;"></div>';
		template += '<div id="fit-profile"></div>';
		template += '<div id="profile-section"></div>';
		// template += '<div id="profile-details"></div>';
		// template +='</div>';
		template += '<div id="order-history">' + Utils.fitProfileClientorderHistoryMacro() + '</div>';
		// template += '<div id="saveForLaterItems" style="overflow:hidden;margin-top:-14px">' + Utils.saveForLaterItems() + '</div>'; // 6/20/2019 Saad
		template += '<div id="alterations-form"></div>';
		// template += '<div id="alterations-form">'+Utils.alterationsOptionDropdown()+'</div>;'
		template += '<div id="alterations-form-modaldata"></div>'
		template += '<script>';
		template += '$("#client-edit").on("click",function(){';
		//		template += 'alert("OK");';
		template += '});';
		template += '</script>';
		//	template += '<div id="swx-client-profile-view">';
		//template += '</div>';
		// <% _.toggleMobileNavButt()

		return template;

	}

	function displayInRows(items, macro, items_per_row) {

		var template = '';

		items_per_row = parseInt(items_per_row, 10) || 3
		var span = 12 / items_per_row

		_.each(items, function (item, index) {
			template += '<div class="row-fluid">';
			template += '<div class="span<%= span %>">';
			if (_.isFunction(macro)) {
				template += '' + macro(item) + '';
			} else {
				template += '' + item + '';
			}
			template += '</div>';
			template += '</div>';
		})

		return template;

	}

	function ClientEditForm(paramObjClient, paramClientId) {

		var clientInternalId = paramClientId;

		//	var clientInternalId = 1089;

		var clientDateCreated = '';
		var clientFirstName = '';
		var clientLastName = '';
		var clientName = '';
		var clientEmail = '';
		var clientPhone = '';
		var clientCompany = '';
		var clientDateOfBirth = '';
		var clientAddr1 = '';
		var clientAddr2 = '';
		var clientAddress = '';
		var clientcity = '';
		var clientNotes = '';
		var clientstate = '';
		var clientcountry = '';
		var clientzip = '';

		var arrObjRef = paramObjClient;
		var arrObjRefTotal = (!_.isNull(arrObjRef)) ? arrObjRef.length : 0;
		var hasObjRef = (arrObjRefTotal != 0) ? true : false;

		if (hasObjRef) {
			for (var dx = 0; dx < arrObjRefTotal; dx++) {
				var refClientInternalId = arrObjRef[dx]['internalid'];
				var isRefClientInternalIdEqualToClientInternalId = (refClientInternalId == clientInternalId) ? true : false;

				if (isRefClientInternalIdEqualToClientInternalId) {
					// clientAddress = '';
					clientFirstName = arrObjRef[dx]['custrecord_tc_first_name'];
					clientLastName = arrObjRef[dx]['custrecord_tc_last_name'];

					clientAddr1 = arrObjRef[dx]['custrecord_tc_addr1'];
					clientAddr2 = arrObjRef[dx]['custrecord_tc_addr2'];
					clientstate = arrObjRef[dx]['custrecord_tc_state'];
					clientcountry = arrObjRef[dx]['custrecord_tc_country'];
					clientzip = arrObjRef[dx]['custrecord_tc_zip'];
					clientcity = arrObjRef[dx]['custrecord_tc_city']

					// clientDateCreated = arrObjRef[dx]['created'];
					clientEmail = arrObjRef[dx]['custrecord_tc_email'];
					clientPhone = arrObjRef[dx]['custrecord_tc_phone'];
					clientCompany = arrObjRef[dx]['custrecord_tc_company'];
					clientDateOfBirth = arrObjRef[dx]['custrecord_tc_dob'];
					clientNotes = arrObjRef[dx]['custrecord_tc_notes'];



					//    var hasRefClientAddr1 = (!_.isNull(refClientAddr1)) ? true : false;
					//    var hasRefClientAddr2 = (!_.isNull(refClientAddr2)) ? true : false;
					//    var hasRefClientState = (!_.isNull(refClientState)) ? true : false;
					//    var hasRefClientCountry = (!_.isNull(refClientCountry)) ? true : false;
					//    var hasRefClientZip = (!_.isNull(refClientZip)) ? true : false;

					//    clientAddress += (hasRefClientAddr1) ? refClientAddr1 + ', ' : '';
					//    clientAddress += (hasRefClientAddr2) ? refClientAddr2 + ', ' : '';
					//    clientAddress += (hasRefClientState) ? refClientState + ', ' : '';
					//    clientAddress += (hasRefClientCountry) ? refClientCountry  : '';
					//    clientAddress += (hasRefClientZip) ? ', ' + refClientZip  : '';

					//  clientName += refClientFirstName + ' ' + refClientFirstLastName;


					break;
				}
			}
		}

		var clientRec = '';
		// ,	site_settings = SC.ENVIRONMENT.siteSettings
		// ,	countries = SC.ENVIRONMENT.siteSettings.countries
		// ,	quantity_countries = _.size(countries)
		// ,	selected_country = clientRec.get("custrecord_tc_country") || site_settings.defaultshipcountry;

		var stClientRec = JSON.stringify(clientRec);
		var arrObjClientRec = JSON.parse(stClientRec);
		var arrObjClientRec = (!_.isNull(JSON.parse(stClientRec)))

		var dateCreated = (_.isObjectExist(arrObjClientRec['created'])) ? arrObjClientRec['created'] : '';

		var template = '';
		template += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">';
		template += '<form id="clientedit_form">';
		template += '<fieldset>';
		template += '<div data-type="alert-placeholder"></div>';
		//template += '<input type="hidden" value='+ tailorId+'  name="custrecord_tc_tailor" data-rectype="field">';
		template += '<input type="hidden" value=' + dateCreated + ' name="created" data-rectype="uneditablefield">';
		template += '<div class="control-group" data-input="firstname">';
		template += '<label class="control-label" for="firstname">';
		template += 'First name'; // zain 26-08-19;
		template += '  <small>';
		template += 'required';
		template += ' </small>';
		template += ' </label>';
		template += '<div class="controls">';
		template += '<input type="text" class="input-xlarge" id="firstname" name="custrecord_tc_first_name" value="' + clientFirstName + '" data-rectype="field">';
		template += ' </div>';
		template += '</div>';
		template += '<div class="control-group" data-input="lastname">';
		template += ' <label class="control-label" for="lastname">';
		template += ' Last name'; // zain 26-08-19
		template += '<small>';
		template += ' required'; // zain 30-08-19
		template += ' </small>';
		template += ' </label>';
		template += '<div class="controls">';
		template += ' <input type="text" class="input-xlarge" id="lastname" name="custrecord_tc_last_name" value="' + clientLastName + '" data-rectype="field">';
		template += '</div>';
		template += '</div>';

		// zain 30-08-19 start
		template += '<div class="control-group" data-input="email">';
		template += '<label class="control-label" for="email">';
		template += 'Email';
		template += ' <small>';
		template += 'required';
		template += ' </small>';
		template += '</label>';
		template += '<div class="controls">';
		template += '  <input type="email" class="input-xlarge" id="email" name="custrecord_tc_email" value="' + clientEmail + '" data-rectype="field">';
		template += '  </div>';
		template += '</div>';

		template += '<div class="control-group"  data-input="phone">';
		template += ' <label class="control-label" for="phone">';
		template += 'Phone Number';
		template += ' <small>'; // zain 30-08-19
		template += ' required'; // zain 30-08-19
		template += '  </small>';
		template += ' </label>';
		template += ' <div class="controls">';
		template += ' <input type="number" class="input-xlarge" id="phone" name="custrecord_tc_phone" value="' + clientPhone + '" data-type="phone" data-rectype="field">';
		template += ' </div>';
		template += ' <span class="help-block">';
		template += 'Example: 5551231234';
		template += ' </span>';
		template += '</div>';
		// zain 30-08-19 end

		template += '<div class="control-group control-group-big" data-input="dob">';
		template += '<label class="control-label" for="dob">';
		template += 'Date Of Birth';
		template += ' </label>';
		template += ' <div class="controls">';
		template += ' <input type="text" class="input-xlarge" id="dob" name="custrecord_tc_dob" placeholder="optional" value="' + clientDateOfBirth + '"  data-rectype="field">';
		template += '</div>';
		template += '</div>';

		template += '<div class="control-group control-group-big" data-input="company">';
		template += ' <label class="control-label" for="company">';
		template += ' Company';
		template += '</label>';
		template += ' <div class="controls">';
		template += '<input type="text" class="input-xlarge" id="company" name="custrecord_tc_company" placeholder="optional" value="' + clientCompany + '"  data-rectype="field">';
		template += '</div>';
		template += '</div>';

		template += '<div class="control-group" data-input="address1">';
		template += '<label class="control-label" for="address1">';
		template += 'Address 1';
		template += '</label>';
		template += '<div class="controls">';
		template += ' <input type="text" class="input-xlarge" id="custrecord_tc_addr1" name="custrecord_tc_addr1" value="' + clientAddr1 + '" data-rectype="field">';
		template += '</div>';
		template += ' <span class="help-block">';
		template += 'Example: 1234 Main Street';
		template += '  </span>';
		template += '</div>';

		template += '<div class="control-group control-group-big" data-input="address2">';
		template += '<label class="control-label" for="address2">';
		template += 'Address 2';
		template += ' </label>';
		template += '<div class="controls">';
		template += ' <input type="text" class="input-xlarge" id="address2" name="custrecord_tc_addr2" placeholder="optional" value="' + clientAddr2 + '" data-rectype="field">';
		template += '  </div>';
		template += '  <span class="help-block">';
		template += 'Example: Apt. 3 or Suite #1516';
		template += ' </span>';
		template += '</div>';

		template += ' <div class="control-group" data-input="city">';
		template += '  <label class="control-label" for="city">';
		template += 'City';
		template += ' </label>';
		template += ' <div class="controls">';
		template += '<input type="text" class="input-xlarge" id="city" name="custrecord_tc_city" value="' + clientcity + '" data-rectype="field">';
		// template += Utils.cityOptions();
		// template += '</select>';
		template += '</div>';
		template += ' </div>';

		template += '<div class="control-group" data-input="country">';
		template += '  <label class="control-label" for="country">';
		template += 'Country';
		template += ' </label>';
		template += ' <div class="controls">';
		template += '  <select class="input-xlarge" id="country" name="custrecord_tc_country" value="' + clientcountry + '" data-rectype="field">';
		template += Utils.countryOptions();
		template += '</select>';
		template += '</div>';
		template += ' </div>';

		// template += '<div class="control-group= quantity_countries <= 1 ?  hide : ' + ' " data-input="country">';
		// template += '  <label class="control-label" for="country">';
		// template += 'Country';
		// template += ' </label>';
		// template += '<div class="controls">';

		// template += ' </div>';
		// template += ' </div>';

		template += '<div class="control-group" data-input="state">';
		template += '<label class="control-label" for="state">';
		template += 'State/Province/Region';
		template += ' </label>';
		template += ' <div class="controls">';
		template += ' <input type="text" class="input-medium" id="state" name="custrecord_tc_state" value="' + clientstate + '" data-type="state" data-rectype="field">';
		template += ' </div>';
		template += ' </div>';

		template += '<div class="control-group"  data-input="zip">';
		template += '<label class="control-label" for="zipcode">';
		template += 'Zip Code';
		template += ' </label>';
		template += ' <div class="controls">';
		template += ' <input type="text" class="input-medium" id="zipcode" name="custrecord_tc_zip" value="' + clientzip + '" data-type="zip" data-rectype="field">';
		template += ' </div>';
		template += ' <span class="help-block">';
		template += 'Example: 94117';
		template += ' </span>';
		template += '</div>';

		template += '<div class="control-group control-group-big" data-input="notes">';
		template += '<label class="control-label" for="notes">';
		template += 'Client Notes';
		template += '  </label>';
		template += ' <div class="controls">';
		template += ' <textarea id="notes" name="custrecord_tc_notes"  data-rectype="field" style="resize:none; width: 100% !important;"> ' + clientNotes + ' </textarea>'; //18/07/2019 Saad
		template += '</div>';
		template += '</div>';

		template += ' </fieldset>';
		template += '</form>';


		return template;
	}

	// swxMyAccountClientProfileDetails Function (End)

	// fitProfileOptionDropdown Function (Start)

	function fitProfileOptionDropdown(profiles, parent) {
		var template = "";


		template += '<div class="modal fade" id="fit-profile-modal" role="dialog">';
		template += '<div class="modal-dialog">';

		template += '<div class="modal-content">';
		template += '<div class="modal-header">';
		template += '<button type="button" class="close" data-dismiss="modal">&times;</button>';
		template += '<h4 class="modal-title" id="fit-profile-modal-heading"></h4>';
		template += '</div>';
		template += '<div class="modal-body" id="fit-profile-modal-body">';
		template += '</div>';
		template += ' <div class="modal-footer">';
		template += ' <p style="margin:0;" class="actions">'; // zain 18-07-19 start
		template += '<a style="float:right !important;padding: 5px;" class="custom-btn cancel-action" data-dismiss="modal">'; // zain 19-08-19
		template += '  Cancel';
		template += ' </a>';
		template += '<div style="float:right !important;" id="fit-profile-modal-submit-button" class="custom-btn"></div>';
		template += '<div style="float:right !important;" id="fit-profile-modal-remove-button" ></div>';
		template += '<div style="float:right !important;" id="fit-profile-modal-copy-button" ></div>';
		template += '</p>'; // zain 18-07-19 end

		template += '</div>';
		template += ' </div>';

		template += ' </div>';
		template += ' </div>';

		var stProfiles = JSON.parse(profiles);
		template += '<div style="display: none;">';
		template += '<label for="clients-options">' + 'Fit Profiles: ' + '</label>';
		if (stProfiles) {
			template += '<div class="row-fluid">';
			template += '<div class="span3">';
			template += '<select class="profiles-options" id="profiles-options">';
			template += '<option value="">' + 'Select a profile' + '</option>';
			var selected = false;
			var selectedID = "";
			_.each(stProfiles, function (profile) {

				if (profile.internalid == parent) {
					selected = true;
					selectedID = profile.internalid;
				}


				// template += '<option value="'+profile.internalid+'"'+ profile.internalid == parent ? 'selected' : ''+'>'+profile.name+'</option>';

				template += "<option value='" + profile.internalid + "' " + (profile.internalid == parent ? 'Selected' : '') + ">" + profile.name + "</option>";
			});
			template += '</select>';
			template += '</div>';
			template += '<div class="span3" id="profile-actions">';
			template += '<a href="/fitprofile" id="swx-fitprofile-dropdown-add" data-action="add-profile" data-toggle="show-in-modal" data-type="profile">Add</a>';
			if (selected) {
				template += '<a id="swx-fitprofile-dropdown-remove" data-toggle="show-in-modal" data-action="remove-rec" data-type="profile" data-id="' + selectedID + '">Remove</a> | <a id="swx-fitprofile-dropdown-copy" data-action="copy-profile" data-type="profile" data-id="' + selectedID + '">Copy</a>';
			}
			template += '</div>';
			template += '</div>';
		}
		template += '</div>';
		template += '<!-- start enhancements -->';


		$(document).ready(function () {

			$(".accordion-toggle").click(function () {
				$(this).find(".arrow-down").toggleClass("rotate-down");
			});

		});

		template += '<style>';
		template += '.rotate-down{-webkit-transform: rotate(90deg);transition: all 0.5s ease;}';
		template += '.fit-profile-history-table{border-top:0; margin-top:0;width: 100%;white-space: nowrap;}.fit-profile-history-table tr{border-bottom:1px solid #e5e5e5;}.fit-profile-history-table th{width:25% !important;padding-right:10px; padding-left:10px;}.fit-profile-history-table td{padding-top: 8px !important;padding-bottom: 6px !important;vertical-align: middle;width:25% !important;padding-right:10px; padding-left:10px;}';
		template += '.add-fit-btn{padding-top: 5px;padding-bottom: 5px;padding-left: 5px;padding-right: 5px;background: linear-gradient(to bottom, white, #e6e6e6);border-radius: 5px;border: 1px solid #e6e6e6;color: #656363;float: right;margin-top: -12px;font-weight:lighter;}';
		template += '.fitprofile-edit-btn{padding-top: 5px;padding-bottom: 5px;padding-left: 13px;padding-right: 13px;background: linear-gradient(to bottom, white, #e6e6e6);border-radius: 5px;border: 1px solid #e6e6e6;color: #656363;float: right;}';
		template += '.add-fit-btn:hover,.fitprofile-edit-btn:hover{background: #cccccc !important;text-decoration: none !important;}';
		template += '</style>';
		if (profiles) {




			template += '<div id="swx-fiprofile-list" style="margin-bottom: 10px;">';
			template += '<h3 style="border-bottom: solid 1px #e5e5e5;margin-bottom: 25px;padding-bottom: 10px;">';
			template += '<a data-target="#fitProfilesHistory" data-toggle="collapse" aria-expanded="true" aria-controls="collapseOne"';
			template += 'class="accordion-toggle" style="display:block;text-decoration:none;color:grey;font-size: 20px;font-weight: 400;">';
			template += 'Fit Profiles';
			template += '<span class="arrow-down" style="float: right;margin-right: 10px;font-size: 27px;font-weight: bolder;">&#10095;</span>';
			template += '</a>';
			template += '</h3>';

			template += '<!--Collapses body-->';
			template += '<div id="fitProfilesHistory" class="collapse">';
			template += '<!-- start fitprofile header -->';
			template += '</style>';
			template += '<div class="table-responsive">';
			template += '<table class="fit-profile-history-table">';
			template += '<thead>';
			template += '<tr>';
			template += '<th>';
			template += '<div style="font-weight: 600;">Product Type</div>';
			template += '</th>';
			template += '<th>';
			template += '<div style="font-weight: 600;">Fit Profile Name</div>';
			template += '</th>';
			template += '<th>';
			template += '<div style="font-weight: 600;">Date Last Edited</div>';
			template += '</th>';
			template += '<th>';
			template += '<a  id="swx-fitprofile-butt-add" class="add-fit-btn">Add Fit Profile</a>';
			template += '</th>';
			template += '</tr>';
			template += '</thead>';
			template += '<!-- end fitprofile header -->';

			_.each(stProfiles, function (profile) {

				var fitProfileInternalId = profile.internalid;
				var fitProfileName = profile.name;
				var fitProfileProdType = profile.custrecord_fp_product_type;
				var fitProfileLastModifiedDate = profile.lastmodified;
				template += '<!-- start fitprofile row -->';

				template += '<tbody>';
				template += '<tr>';
				template += '<td>';
				template += fitProfileProdType;
				template += '</td>';
				template += '<td>';
				template += fitProfileName;
				template += '</td>';
				template += '<td>';
				template += fitProfileLastModifiedDate;
				template += '</td>';
				template += '<td>';
				template += '<a id="swx-fitprofile-viewedit" class="fitprofile-edit-btn" swx-fitprofile-id="' + fitProfileInternalId + '">View & Edit</a>';
				template += '</td>';
				template += '</tr>';
				template += '</tbody>';
				template += '<!-- end fitprofile row -->';

			});
			template += '</table>';
			template += '</div>';

			template += '</div>';
			template += '</div>';
			template += '</div>';
			template += '<!--end of Fit Profile Collapse body-->';




			template += '</div>';

		}

		// <% _.toggleMobileNavButt() %>

		template += '<!-- end enhancements -->';

		return template;

	}

	// fitProfileOptionDropdown Function (End)
	// zain 18-07-19 start
	$(document).ready(function () {
		$("body").on("click", ".accordion-toggle", function () {
			$(this).find(".arrow-down").toggleClass("rotate-down");
		});
	});
	// zain 18-07-19 end

	// fitProfileOptionDropdownShopFlow Function (Start)
	function fitProfileOptionDropdownShopFlow(fitProfilesByGroup, clientID, selectedProfileIdList, fitprofileCreatedId) {
		var showEditRemovedFitProfileCreated = false;
		var isSelectedType = false;
		var selectedProfileId = '';
		var template = "";
		template += '<div class="modal fade" id="fit-profile-modal" role="dialog">';
		template += '<div class="modal-dialog">';

		template += '<div class="modal-content">';
		template += '<div class="modal-header">';
		template += '<button type="button" class="close" data-dismiss="modal">&times;</button>';
		template += '<h4 class="modal-title" id="fit-profile-modal-heading"></h4>';
		template += '</div>';
		template += '<div class="modal-body" id="fit-profile-modal-body">';
		template += '</div>';
		template += ' <div class="modal-footer">';
		template += ' <p style="margin:0;" class="actions">'; // zain 18-07-19 start
		template += '<a style="float:right !important;padding: 5px;" class="custom-btn cancel-action" data-dismiss="modal">'; // zain 19-08-19
		template += '  Cancel';
		template += ' </a>';
		template += '<div style="float:right !important;" id="fit-profile-modal-submit-button" class="custom-btn"></div>';
		template += '<div style="float:right !important;" id="fit-profile-modal-remove-button" ></div>';
		template += '<div style="float:right !important;" id="fit-profile-modal-copy-button" ></div>';
		template += '</p>'; // zain 18-07-19 end

		template += '</div>';
		template += ' </div>';

		template += ' </div>';
		template += ' </div>';
		if (fitProfilesByGroup && fitProfilesByGroup.length > 0) {
			template += '<div id="fitProfileClientInternalId" class="row-fluid" style="display:none;">' + clientID + '</div>';
			_.each(fitProfilesByGroup, function (profile) {
				template += '<div>';
				template += '<div style="width:100px;display:inline-block;" >';
				template += '<label for="clients-options">' + profile.profile_type + ':</label>';
				template += '</div>';
				if (profile.profiles) {
					template += '<div style="display:inline-block;">';
					template += '<div style="display:inline-block;">';
					template += '<select class="profiles-options-shopflow" data-type="' + profile.profile_type + '" id="profiles-options-' + profile.profile_type + '" >';
					template += '<option value="">' + _('Select a profile').translate() + '</option>';

					var profileID = jQuery("#profiles-options-" + profile.profile_type).attr('id');
					var selectedValue = jQuery("#profiles-options-Jacket").val();
					_.each(profile.profiles, function (prof) {
						var isProfileSelected = -1;
						if (selectedProfileIdList) {
							isProfileSelected = selectedProfileIdList.indexOf(prof.internalid);
						}
						if (isProfileSelected != -1) {
							isSelectedType = true;
							selectedProfileId = prof.internalid;
							template += '<option selected value="' + prof.internalid + '" > ' + prof.name + '</option>';
						} else if (prof.internalid == fitprofileCreatedId) {
							template += '<option selected value="' + prof.internalid + '" > ' + prof.name + '</option>';

						} else {
							template += '<option value="' + prof.internalid + '" > ' + prof.name + '</option>';
						}
					});
					template += '</select>';
					template += '</div>';

					template += '<div style="display:inline-block;padding-left:20px;" id="profile-actions-' + profile.profile_type + '">';
					if (isSelectedType == true && selectedProfileId) {
						template += '<a id="swx-fitprofile-butt-add" data-type="' + profile.profile_type + '" class="add-fit-btn" >Add</a> <a id="swx-fitprofile-viewedit-shopflow" class="fitprofile-edit-btn" swx-fitprofile-id="' + selectedProfileId + '"> | Edit</a> '; //| <a data-action="remove-rec-flow" data-type="profile" data-id="' + selectedProfileId + '">Remove</a>
						isSelectedType = false;
					} else if (!profileID || selectedValue == "" || profile.profiles.length == 0) { // 20/12/2019
						if (showEditRemovedFitProfileCreated) {
							template += '<a id="swx-fitprofile-butt-add" data-type="' + profile.profile_type + '" class="add-fit-btn" >Add</a> <a id="swx-fitprofile-viewedit-shopflow" class="fitprofile-edit-btn" swx-fitprofile-id="' + fitprofileCreatedId + '"> | Edit</a>'; // | <a data-action="remove-rec-flow" data-type="profile" data-id="' + fitprofileCreatedId + '">Remove</a>
							showEditRemovedFitProfileCreated = false;
						} else {
							template += '<a id="swx-fitprofile-butt-add" data-type="' + profile.profile_type + '" class="add-fit-btn">Add</a>';
						} // 20/12/2019
					} else {
						template += '<a id="swx-fitprofile-butt-add"  data-type="' + profile.profile_type + '" class="add-fit-btn">Add</a> ';
						template += '<a  id="swx-fitprofile-viewedit" class="fitprofile-edit-btn" swx-fitprofile-id="' + selectedValue + '"> | Edit</a>';
						//template += '<a data-backdrop="static" data-keyboard="false" data-action="remove-rec" data-type="profile" data-id="' + selectedValue + '">Remove</a>'; //20/01/2020
					}
					template += '</div>';
					template += '</div>';
				}
				template += '</div>';
			});
			template += '<a style="display:none;" data-backdrop="static" id="swx-fitprofile-dropdown-add" data-action="add-profile" data-toggle="show-in-modal" data-type="profile">Add</a>';

		}
		return template;
	}
	// fitProfileOptionDropdownShopFlow Function (End)


	// fitProfileClientorderHistoryMacro Function (Start)

	function fitProfileClientorderHistoryMacro(orders) {

		var template = "";

		// if(orders.length>0)
		template += '<div class="row-fluid" id="fitProfileClientorderHistoryMacro">';
		template += '<h3 style="border-bottom: solid 1px #e5e5e5;margin-bottom: 25px;padding-bottom: 10px;">';
		template += '<a data-target="#fitProfileClientorderHistoryMacroContent" data-toggle="collapse" aria-expanded="true" aria-controls="collapseOne"';
		template += 'class="accordion-toggle" style="display:block;text-decoration:none;color:grey;font-size: 20px;font-weight: 400;">';
		template += 'Order History';
		template += '<span class="arrow-down" style="float: right;margin-right: 10px;font-size: 27px;font-weight: bolder;">&#10095;</span>';
		template += '</a></h3>';
		template += '<div id="fitProfileClientorderHistoryMacroContent" class="collapse table-responsive" data-permissions="transactions.tranFind.1,transactions.tranSalesOrd.1">'; // zain 18-07-19
		template += '<table class="table">';
		template += '<thead style="font-size: 12px;">';
		template += '<tr>';
		template += '<th>';
		template += 'Order Date';
		template += '</th>';
		template += '<th>Order#</th>';
		template += '<th>';
		template += 'Item';
		template += '</th>';
		template += '<th>';
		template += 'Fabric Status';
		template += '</th>';
		template += '<th>';
		template += 'CMT Status';
		template += '</th>';
		template += '<th width="10%">';
		template += 'Date Needed';
		template += '</th>';
		template += '<th style="text-align:center;">';
		template += 'Status';
		template += '</th>';
		template += '<th></th>';
		template += '</tr>';
		template += '</thead>';
		template += '<tbody style="font-size: 12px;">';
		_.each(orders, function (order, index) {
			template += '<tr>';
			template += '<td>';
			template += '' + order.orderDate.substr(0, order.orderDate.length - 4) + '' + order.orderDate.substr(order.orderDate.length - 2) + '';
			template += '</td>';
			template += '<td>';
			template += '' + order.orderNum + '';
			template += '</td>';
			template += '<td>';
			template += '' + order.item + '';
			template += '</td>';
			template += '<td>';
			template += '' + order.fabricStatus + '';
			template += '</td>';
			template += '<td>';
			template += '' + order.cmtStatus + '';
			template += '</td>';
			template += '<td>';
			// template += '<input class="date_needed_class" name="oh_dateneeded" placeholder="yyyy-mm-dd" id="' + order.solinekey + '" type="date" value="' + order.custcol_avt_date_needed + '" style="width:100px;font-size:10px;">';//<a id="" class="close clear-dates">&times;</a>
			template += '<span>'+order.custcol_avt_date_needed+'</span>';
			template += '</td>';
			template += '<td style="text-align:center;">';
			if (order.clearstatus == true) {
				template += '<img src="https://checkout.na2.netsuite.com/c.3857857/myaccount/img/clear.png">';
			} else if (order.tranline_status == true) {
				template += '<img src="https://checkout.na2.netsuite.com/c.3857857/myaccount/img/red.png">';
			} else {
				template += '<img src="https://checkout.na2.netsuite.com/c.3857857/myaccount/img/green.png">';
			}
			template += '</td>';
			template += '<td>';
			if (order.custcol_flag == 'T') {
				template += '<input type="checkbox" data-id="' + order.solinekey + '" data-name="flag" checked disabled>';
			} else {
				template += '<input type="checkbox" data-id="' + order.solinekey + '" data-name="flag" disabled>';
			}
			template += '</td>';
			template += '<td>';

			var soDateTimeInternalId = order.internalid;
			//  var soDateTimeInternalIdSplit = soDateTimeInternalId.split('_');

			// template += '<a href="/ordershistory/view/<'+ soDateTimeInternalIdSplit[1] +'">';
			template += '<a href="#" data-touchpoint="customercenter" data-hashtag="/purchases/view/salesorder/' + order.internalid1 + '" ><span class="tranid">view</span></a>'; //02/07/2019 Saad

			template += '</a>';
			template += '</td>';
			template += '</tr>';
		});
		template += '</tbody>';
		template += '</table>';
		template += '</div>';
		template += '</div>';

		// }

		template += '<div class="modal fade" id="modalContainer" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">';
		template += '<div class="modal-dialog modal-dialog-centered" role="document">';
		template += '<div class="modal-content">';
		template += '<div class="modal-header">';
		template += '<h5 class="modal-title" id="flagdetailstitle">Flag Details</h5>';
		template += '</div>';
		template += '<div class="modal-body">';
		template += '</div>';
		template += '<div class="modal-footer">';
		template += '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>';
		template += '<button type="button" id="modalContainerSave" class="btn btn-primary">Save changes</button>';
		template += '</div>';
		template += '</div>';
		template += '</div>';
		template += '</div>';

		return template;
	}


	// fitProfileClientorderHistoryMacro Function (End)


	// saveForLaterItems Function (Start)

	function saveForLaterItems() {

		var template = "";

		template += '<div id="ProductListDetailsView">';

		// var config = view.application.Configuration.product_lists
		// ,	items = view.model.get('items')
		// , 	out_of_stock_items = items.filter(function(product_list_item) { return !product_list_item.get('item').ispurchasable; })
		// ,	type = view.model.get('type').name
		// ,	items_length = items.length
		// ,	items_length_message = '';


		// if (items_length === 0)
		// {
		// 	items_length_message = _('(No items yet)').translate();
		// }
		// else if (items_length === 1)
		// {
		// 	items_length_message = _('($(0) Item)').translate(items_length);
		// }
		// else if (items_length > 1)
		// {
		// 	items_length_message = _('($(0) Items)').translate(items_length);
		// }

		// var arrObjFilteredItems = [];
		// var arrObjFilteredItemsTotal = 0;
		// var hasArrObjFilteredItems = false;
		// var stFilterSaveForLaterRef = view.model.get('swx_filter_save_for_later_client');
		// var hasStFilterSaveForLaterRef = (!_.isNullOrEmpty(stFilterSaveForLaterRef)) ? true : false;

		// var collpaseClass = "collapse";


		// if (hasStFilterSaveForLaterRef)
		// {
		// 	var stItems = JSON.stringify(items);
		// 	var arrObjItems = JSON.parse(stItems)
		// 	arrObjFilteredItems = _.getArrObjFilteredSaveForLaterItems(arrObjItems, stFilterSaveForLaterRef);
		// 	arrObjFilteredItemsTotal = (!_.isNullOrEmpty(arrObjFilteredItems)) ? arrObjFilteredItems.length : 0;
		// 	hasArrObjFilteredItems = (arrObjFilteredItemsTotal != 0) ? true : false;
		// 	//collpaseClass = "in collapse";
		// }
		// if(view.model) {

		// var items = view.model.get('items');
		// if(items_length > 0){
		// 	var productListDisplay = null;
		// 	productListDisplay = function (row)
		// 		{
		// 			return SC.macros['productListDisplayLater'](row, view, null, arrObjFilteredItems, 'T');
		// 		}

		template += '<header>';


		template += '<h3 class="list-header-title" style="margin-top:0;padding-bottom: 10px;border-bottom: 1px solid #eee;width:100%;">';

		template += '<a class="accordion-toggle" data-toggle="collapse" data-target="#saveForLaterItemsCart" aria-expanded="true" aria-controls="collapseOne"';
		template += 'style="display:block;text-decoration:none;color:grey;font-size: 20px;font-weight: 400;">';
		// template += '<!--<%= (type === 'predefined' || type === 'later') ? _(view.model.get('name')).translate() : view.model.get('name') %>-->';
		template += 'Saved Items';
		template += '<span class="arrow-down" style="float: right;margin-right: 10px;font-size: 27px;font-weight: bolder;">&#10095;</span>';
		template += '</a>';
		template += '</h3>';


		template += '<div data-confirm-message class="confirm-message"></div>';


		template += '</header>';

		template += '<div id="saveForLaterItemsCart"  class="collapse" style="clear:both;" >';

		template += '<div>';
		template += '<div class="span1">';

		template += '</div>';
		template += '<div class="span4" style="font-weight: 600;">';
		template += 'Item';
		template += '</div>';
		template += '<div class="span3" style="text-align:right;font-weight:600">';
		template += 'Created Date';
		template += '</div>';
		template += '<div class="span4" style="text-align:center;">';

		template += '</div>';
		template += '</div>';
		template += '<div class="product-list-items" data-type="product-list-items">';

		// <%= displayInRows(items.models, productListDisplay, 1) %>
		template += '</div>';

		// }
		// }
		template += '</div>';
		template += '</div>';


		return template;

	}

	// saveForLaterItems Function (End)


	// alterationsOptionDropdown Funtion (Start)

	// 30/08/2019 Saad SAAD

	function alterationsOptionDropdown(alterationsData, parent) {
		var template = "";
		template += '<div style="display: none;">';
		template += '<label for="clients-options">' + "Alterations: " + '</label>';
		var stProfiles = JSON.parse(alterationsData, 'key', '\t');
		if (stProfiles) {
			template += '<div class="row-fluid">';
			template += '<div class="span3">';
			template += '<select class="profiles-options" id="alteration-options">';
			template += '<option value="">' + _("Select a alteration").translate() + '</option>';

			var selected = false;
			var selectedID = "";

			_.each(stProfiles, function (profile) {

				if (profile.internalid == parent) {
					selected = true;
					selectedID = profile.internalid;
				}

				template += "<option value='" + profile.internalid + "' " + (profile.internalid == parent ? 'Selected' : '') + ">" + profile.name + "</option>";
				template += '<option></option>';
			});
			template += '</select>';
			template += '</div> ';
			template += '<div class="span3" id="profile-actions">';
			template += '<a href="/alteration" id="swx-alterations-dropdown-add" data-action="add-alterations" data-toggle="show-in-modal" data-type="alteration">Add</a>';
			if (selected) {
				template += '| <a id="swx-alterations-dropdown-remove" data-toggle="show-in-modal" data-action="remove-alterations-rec" data-type="alteration" data-id="' + selectedID + '">Remove</a> | <a id="swx-fitprofile-dropdown-copy" data-action="copy-profile" data-type="profile" data-id="' + selectedID + '">Copy</a>';
			}
			template += '</div>';
			template += '</div>';
		}
		template += '</div>';
		if (alterationsData) {


			template += '<div id="swx-alterations-list" style="margin-bottom: 10px;">';
			template += '<div class="row-fluid" style="border-bottom: solid 1px #e5e5e5; margin-bottom: 0px; padding-bottom: 10px; padding-top: 0px">';
			template += '<div class="span12">';
			template += '<span style="font-size: 20px; font-weight: 400; color: #a6a6a6;">';
			template += '<a data-target="#alterationsHistory" data-toggle="collapse"   aria-expanded="true" aria-controls="collapseOne" class="accordion-toggle" style="text-decoration:none;color:grey;display:block;">';
			template += 'Alterations';
			template += '<span class="arrow-down" style="float: right;margin-right: 10px;font-size: 27px;font-weight: bolder;">&#10095;</span>';
			template += '</a>';
			template += '</span>';
			template += '</div>';
			template += '</div>';

			template += '<!--Collapses body-->';
			template += '<div id="alterationsHistory" class="collapse">';
			template += '<div class="row-fluid" style="float: right;position: absolute;right: 21px">';
			template += '<div class="span10">&nbsp;</div>';
			template += '<div class="span2">';
			template += '<div><a  id="swx-alterations-add" class="custom-btn" style="width: auto; padding: 5px;">Add Alterations</a></div>';
			template += '<div id="mobile-only" style="height: 20px;"></div>';
			template += '</div>';
			template += '</div>';


			template += '<!-- start alteration header -->';
			template += '<style>.alteration-history-table tr{border-bottom: 1px solid #e5e5e5;}.alteration-history-table td{padding-top: 10px !important;padding-bottom: 10px !important;vertical-align: middle;}';
			template += 'input[type="number"] {-moz-appearance:textfield;}input::-webkit-outer-spin-button,input::-webkit-inner-spin-button {-webkit-appearance: none;}@media screen and (min-width: 768px) {#modal-alteration .modal-dialog {width: 835px !important;}.section-two-fields input,.section-three-fields input,.section-four-fields input,.section-five-fields input {width: 180px !important;}}#div-modal-body form input {height: 25px !important}.alteration-checkboxes {margin-top: 15px;}#div-modal-body .alteration-checkboxes .checkbox input[type="checkbox"] {float: right;margin-top: -4px;margin-left: 10px;margin-right: 30px;}#notes_comment {width: 100%;border-radius: 0;box-shadow: none;}.checkbox2 {display: block;position: relative;padding-left: 35px;margin-bottom: 12px;cursor: pointer;font-size: 13px;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;}.checkbox2 input {height: 0;width: 50px;margin-right: 30px;}.checkmark {position: absolute;top: 0;left: 29px;height: 19px;width: 30px;background-color: white;border: 1px solid #cccaca;	}.checkbox2:hover input~.checkmark {background-color: #ccc;}.checkbox2 input:checked~.checkmark {}.checkmark:after {content: "";position: absolute;display: none;}.checkbox2 input:checked~.checkmark:after {display: block;}.checkbox2 .checkmark:after {left: 11px;top: 3px;width: 5px;height: 10px;border: solid white;border-width: 0 3px 3px 0;-webkit-transform: rotate(45deg);-ms-transform: rotate(45deg);transform: rotate(45deg);}#alteration-form input{box-shadow: none !important;}.image-logo {display: block;margin-left: auto;margin-right: auto;width: 25%;.} .alteration-checkboxes input{float: right;margin-top: -5px;margin-left: 4px;} .section-one-fields input{margin-left:4px;} #alteration_client_name{border: 1px solid #cccccc;} .section-one-fields .alteration-checkboxes input{border-color: #cccccc;} #alterations-measurements-html p{font-size:14px;} .alteration-checkboxes input[type="number"]:disabled{background-color: #eee;} .layout-overlay{display:none !important;}'; // zain 04-09-19
			template += '</style>';
			template += '<div id="desktop-only" class="row-fluid back-btn" style="border-bottom: solid 1px #e5e5e5; margin-bottom: 8px;">';

			template += '<div class="table-responsive">';
			template += '<table class="alteration-history-table" style="margin-top: 25px;border-top: 0;">';
			template += '<thead>';
			template += '<tr>';
			template += '<th>';
			template += '<div style="font-weight: 600;">Name</div>';
			template += '</th>';
			template += '<th>';
			template += '<div style="font-weight: 600;">Date Last Edited</div>';
			template += '</th>';
			template += '<th>';
			template += ' &nbsp; ';
			template += '</th>';
			template += '</tr>';
			template += '</thead>';
			template += '</div>';




			_.each(stProfiles, function (profile) {


				var alterationInternalId = profile.internalid;;
				var alterationName = profile.name;
				var alterationLastModifiedDate = profile.lastmodified;

				template += '<tr>';
				template += '<td> ' + alterationName + ' </td>';
				template += '<td> ' + alterationLastModifiedDate + ' </td>';
				template += '<td> <a id="swx-alteration-viewedit" class="custom-btn" swx-alteration-id="' + alterationInternalId + '" style="padding:5px;float:right;">View & Edit</a> </td>';
				template += '</tr>';
				template += '</div>';

			});
			template += '</div>';


		}


		return template;

	}

	//30/08/2019 Saad SAAD
	function alterationsForm(model, paramEvent, clientName, isTrue) {
		var template = "";
		var eventValue = (!_.isNull(paramEvent) && paramEvent == 'add') ? 'add' : 'viewedit';
		var isAddEvent = (eventValue == 'add') ? true : false;
		var isViewEdit = (eventValue == 'viewedit') ? true : false;


		template += '<button id="alteration-modal" data-backdrop="static" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#modal-alteration" style="display: none;">Modal Butt</button>';
		template += '<div class="modal fade" id="modal-alteration" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">';
		template += '<div class="modal-dialog" style="left: 0;">';
		template += '<div class="modal-content">';
		template += '<div class="modal-header">';
		template += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';

		if (isAddEvent) {
			template += '<h3 id="h3-alteration-header" class="modal-title">Alterations Form</h3>';
		}

		if (isViewEdit) {
			template += '<h3 id="h3-alteration-header" class="modal-title">View/Edit Alterations Form</h3>';
		}
		template += '</div>';
		template += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">';

		template += '<div id="div-modal-body" class="modal-body">';
		template += '<div>';
		template += '<img class="image-logo"  id="image-logo-id" alt="">';
		template += '</div>';

		template += '<form id="alteration-form" class="form-inline">';
		template += '<fieldset>';
		template += '<div class="col-md-12 col-sm-12 col-xs-12 section-one-info"><b>INFO</b></div>';
		template += '<div class="col-md-12 col-sm-12 col-xs-12 section-one-fields">';
		template += '<div class="col-md-4 col-sm-12 col-xs-12">';
		template += '<div class="form-group">';
		template += '<label for="Date">Date</label>';
		template += '<input style="width: 185px;" type="date" class="form-control" id="alteration_date" name="alteration_date">';
		template += '</div>';
		template += '</div>';
		template += '<div class="col-md-4 col-sm-12 col-xs-12">';
		template += '<div class="form-group">';
		template += '<label for="alterationClientName">Client Name</label>';
		template += '<input style="width: 139px;" type="text" class="form-control" id="alteration_client_name" disabled value=" ' + clientName + ' " name="alteration_client_name">';
		template += '</div>';
		template += '</div>';
		template += '<div class="col-md-4 col-sm-12 col-xs-12">';
		template += '<div class="form-group">';
		template += '<label for="alterationOrderNumber">Order #</label>';
		template += '<input style="width: 167px;" type="text" class="form-control" id="alteration_order_no" value="" name="alteration_order_no">';
		template += '</div>';
		template += '</div>';
		template += '<div class="col-md-12 col-sm-12 col-xs-12 alteration-checkboxes">';

		template += '<div class="form-group pull-left" style="margin-left: 40px;">';
		template += '<div class="checkbox">';
		template += '<label class="checkbox2">JKT <input type="number" onkeypress="return event.charCode != 45"  min="0" id="alteration_jkt" name="alteration_jkt"></label>';
		template += '</div>';
		template += '</div>';
		template += '<div class="form-group pull-left">';
		template += '<div class="checkbox">';
		template += '<label class="checkbox2">TRS <input type="number" onkeypress="return event.charCode != 45"  min="0" id="alteration_trs" name="alteration_trs"></label>';
		template += '</div>';
		template += '</div>';
		template += '<div class="form-group pull-left">';
		template += '<div class="checkbox">';
		template += '<label class="checkbox2">WST <input type="number" onkeypress="return event.charCode != 45"  min="0" id="alteration_wst" name="alteration_wst"></label>';
		template += '</div>';
		template += '</div>';
		template += '<div class="form-group pull-left">';
		template += '<div class="checkbox">';
		template += '<label class="checkbox2">SHT <input type="number" onkeypress="return event.charCode != 45"  min="0" id="alteration_sht" name="alteration_sht"></label>';
		template += '</div>';
		template += '</div>';
		template += '<div class="form-group pull-left">';
		template += '<div class="checkbox">';
		template += '<label class="checkbox2">OVC <input type="number" onkeypress="return event.charCode != 45"  min="0" id="alteration_ovc" name="alteration_ovc"></label>';
		template += '</div>';
		template += '</div>';
		template += '<button id="generate-alterations-form" type="button" class="custom-btn" style="font-weight: 600;padding: 3px;margin-top:-4px;">Generate Form</button>';
		template += '</div>';
		template += '</div>';
		template += '<div id="alterations-measurements-html"></div>';
		template += '</fieldset>';
		template += '</form>';
		template += '</div>';
		template += '<div class="modal-footer" id="modal-fotar-form" style="display: none;">';

		template += '<div class="form-actions" style="margin: 0px; border: none; padding: 0px;">';
		template += '<button id="alteration-modal-close" type="button" class="custom-btn" data-dismiss="modal" style="font-weight: 600;">Cancel</button>';
		template += '<button id="alteration-modal-submit" type="button" class="custom-btn" style="font-weight: 600; margin-left: 5px; display: none;">Submit</button>';
		template += '<button id="alteration-modal-submit-with-pdf" type="button" class="custom-btn" style="font-weight: 600; margin-left: 5px; display: none;">Submit & PDf</button>';
		template += '<button id="alteration-modal-remove" type="button" class="custom-btn" style="font-weight: 600; margin-left: 5px; display: none;">Remove</button>';
		template += '<button id="alteration-modal-print" type="button" class="custom-btn" style="font-weight: 600; margin-left: 5px; display: none;">Print</button>';
		template += '<button id="alteration-modal-download" type="button" class="custom-btn" style="font-weight: 600; margin-left: 5px; display: none;">Download</button>';
		template += '</div>';
		template += '</div>';
		template += '</div><!-- /.modal-content -->';
		template += '</div>';
		return template;

	}

	//30/08/2019 Saad SAAD
	function alterationsMeasurement(clientid, objNumOFGenerate) {
		var template = "";
		var clientId = clientid
		if (objNumOFGenerate) {
			var notesFlag = false;
			var infoFlag = false;
			var trsNumOfSectionGenerate = parseInt(objNumOFGenerate.trsNumOfSectionGenerate);
			var wstNumOfSectionGenerate = parseInt(objNumOFGenerate.wstNumOfSectionGenerate);
			var shtNumOfSectionGenerate = parseInt(objNumOFGenerate.shtNumOfSectionGenerate);
			var jckOvcNumGenerate = parseInt(objNumOFGenerate.jckOvcNumGenerate);
			if (trsNumOfSectionGenerate != 0 || wstNumOfSectionGenerate != 0 || shtNumOfSectionGenerate != 0 || jckOvcNumGenerate != 0) {
				notesFlag = true;
				infoFlag = true;
			}

		}

		if (infoFlag) {
			template += '<br style="clear:both;">';
			template += '<hr>';
			template += '<br>';

			template += '<div class="col-md-6 col-sm-12 col-xs-12">';
			template += '<p style="text-align: center;margin-bottom: 22px;"><b>Alterations</b></p>';
			template += '</div>';
			template += '<div class="col-md-6 col-sm-12 col-xs-12">';
			template += '<p style="text-align: center;margin-bottom: 22px;"><b>Fit Profile Updates</b></p>';
			template += '</div>';
		}
		if (jckOvcNumGenerate && jckOvcNumGenerate != 0) {
			for (var i = 0; i < jckOvcNumGenerate; i++) {
				template += '<div class="col-md-12 col-sm-12 col-xs-12 section-two-info">';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for=""><b>JACKET/OVERCOAT</b></label>';
				template += '<input style="width: 180px;margin-bottom: 20px;" type="text" class="form-control pull-right" id="alteration_jck_ovc_' + i + '" name="alteration_jck_ovc_' + i + '" placeholder="Insert item details">';
				template += '</div>';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-12 col-sm-12 col-xs-12 section-two-fields">';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += ' <label for="">Erect/Stooping</label>';
				template += '<input type="text" maxlength="24" class="form-control pull-right" id="alteration_erect_stooping_' + i + '" name="alteration_erect_stooping_' + i + '">';
				template += '</div>';
				template += ' </div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Sleeve Position</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_sleeve_' + i + '" name="alteration_sleeve_' + i + '">';
				template += ' </div>';
				template += ' </div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += ' <div class="">';
				template += '<label for="">Collar Height</label>';
				template += ' <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_collar_height_' + i + '" name="alteration_collar_height_' + i + '">';
				template += ' </div>';
				template += '</div>';
				template += ' <div class="col-md-6 col-sm-12 col-xs-12">';
				template += ' <div class="">';
				template += ' <label for="">Shorten Lapels</label>';
				template += ' <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shorten_lapels_' + i + '" name="alteration_shorten_lapels_' + i + '">';
				template += '</div>';
				template += ' </div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += ' <div class="">';
				template += '<label for="">Shoulder Height</label>';
				template += ' <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shoulder_height_' + i + '" name="alteration_shoulder_height_' + i + '">';
				template += '</div>';
				template += ' </div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '  <div class="">';
				template += '<label for="">Shoulder Position</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shoulder_position_' + i + '" name="alteration_shoulder_position_' + i + '">';
				template += ' </div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += ' <div class="">';
				template += ' <label for="">Shoulder Height</label>';
				template += ' <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_Shoulder_height2_' + i + '" name="alteration_Shoulder_height2_' + i + '">';
				template += ' </div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += ' <div class="">';
				template += ' <label for="alterationClientName">Left Shoulder Height</label>';
				template += ' <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_left_shoulder_' + i + '" name="alteration_left_shoulder_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += ' <div class="col-md-6 col-sm-12 col-xs-12">';
				template += ' <div class="">';
				template += '  <label for="Date">Back</label>';
				template += ' <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_back_' + i + '" name="alteration_back_' + i + '">';
				template += ' </div>';
				template += ' </div>';
				template += ' <div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += ' <label for="">Right Shoulder Height</label>';
				template += ' <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_right_shoulder_' + i + '"  name="alteration_right_shoulder_' + i + '">';
				template += '</div>';
				template += ' </div>';
				template += ' <div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '  <label for="">Chest</label>';
				template += ' <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_Chest_' + i + '" name="alteration_Chest_' + i + '">';
				template += ' </div>';
				template += '</div>';
				template += ' <div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += ' <label for="">Closing Button Height</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_clos_btn_ht_' + i + '" name="alteration_clos_btn_ht_' + i + '">';
				template += ' </div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '  <div class="">';
				template += '<label for="">Waist</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_waist_' + i + '" name="alteration_waist_' + i + '">';
				template += ' </div>';
				template += ' </div>';
				template += ' <div class="col-md-6 col-sm-12 col-xs-12">';
				template += '  <div class="">';
				template += ' <label for="alterationClientName">Skirt</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_skirt_' + i + '" name="alteration_skirt_' + i + '">';
				template += '</div>';
				template += ' </div>';
				template += ' <div class="col-md-6 col-sm-12 col-xs-12">';
				template += ' <div class="">';
				template += ' <label for="">Hips</label>';
				template += '  <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_hips_' + i + '" name="alteration_hips_' + i + '">';
				template += ' </div>';
				template += ' </div>';
				template += ' <div class="col-md-6 col-sm-12 col-xs-12">';
				template += '  <div class="">';
				template += '   <label for="">Upper Arm</label>';
				template += ' <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_upper_arm_' + i + '" name="alteration_upper_arm_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '  <div class="">';
				template += '<label for="">Upper Arm</label>';
				template += ' <input type="text" maxlength="24"  class="form-control pull-right" id="alteration_upper_arm2_' + i + '" name="alteration_upper_arm2_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Hand Width</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_hand_width_' + i + '" name="alteration_hand_width_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Hand Width</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_hand_width2_' + i + '" name="alteration_hand_width2_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Sway Back</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_sway_back_' + i + '" name="alteration_sway_back_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Jacket Length</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_jacket_length_' + i + '" name="alteration_jacket_length_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Stooped</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_stooped_' + i + '"name="alteration_stooped_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Sleeve Length</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_sleeve_length_' + i + '"name="alteration_sleeve_length_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Erect</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_erect_' + i + '"name="alteration_erect_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="Date">Other</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_other_' + i + '"name="alteration_other_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">&nbsp;';
				template += '</div>';

				template += '</div>';
				template += '<br style="clear:both;">';
				template += '<hr>';
			}
		}

		if (trsNumOfSectionGenerate && trsNumOfSectionGenerate != 0) {
			for (var i = 0; i < trsNumOfSectionGenerate; i++) {
				template += '<div class="col-md-12 col-sm-12 col-xs-12 section-three-info">';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for=""><b>TROUSER</b></label>';
				template += '<input style="width: 180px;margin-bottom: 20px;" type="text" class="form-control pull-right" id="alteration_trouser_' + i + '" name="alteration_trouser_' + i + '" placeholder="Insert item details">';
				template += '</div>';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-12 col-sm-12 col-xs-12 section-three-fields">';


				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Waist</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_Trouser_waist_' + i + '" name="alteration_Trouser_waist_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Total Rise</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_total_raise_' + i + '"name="alteration_total_raise_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Seat</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_seat_' + i + '"name="alteration_seat_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Front Rise</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_front_rise_' + i + '"name="alteration_front_rise_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Hip</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_trouser_hip_' + i + '"name="alteration_trouser_hip_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Back Rise</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_back_rise_' + i + '" name="alteration_back_rise_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Crotch</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_trouser_crotch_' + i + '"  name="alteration_trouser_crotch_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Flat Seat</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_flat_seat_' + i + '"  name="alteration_flat_seat_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
				template += '<div class="">';
				template += '<label for="">Thigh</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_trouser_thigh_' + i + '"  name="alteration_trouser_thigh_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">&nbsp;';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
				template += '<div class="">';
				template += '<label for="">Knee</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_trouser_knee_' + i + '" name="alteration_trouser_knee_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">&nbsp; ';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
				template += '<div class="">';
				template += '<label for="">Hem</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_trouser_hem_' + i + '"  name="alteration_trouser_hem_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12"> &nbsp; ';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
				template += '<div class="">';
				template += '<label for="">Length</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_trouser_length_' + i + '" name="alteration_trouser_length_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12"> &nbsp; ';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
				template += '<div class="">';
				template += '<label for="">Other</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_trouser_other_' + i + '" name="alteration_trouser_other_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">&nbsp; ';
				template += '</div>';
				template += '</div>';
				template += '<br style="clear:both;">';
				template += '<hr>';
			}
		}

		if (shtNumOfSectionGenerate && shtNumOfSectionGenerate != 0) {
			for (var i = 0; i < shtNumOfSectionGenerate; i++) {
				template += '<div class="col-md-12 col-sm-12 col-xs-12 section-four-info">';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for=""><b>SHIRT</b></label>';
				template += '<input style="width: 180px;margin-bottom: 20px;" type="text" class="form-control pull-right"  id="alteration_shirt_' + i + '" name="alteration_shirt_' + i + '" placeholder="Insert item details">';
				template += '</div>';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-12 col-sm-12 col-xs-12 section-four-fields">';


				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Neck</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shirt_neck_' + i + '" name="alteration_shirt_neck_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Chest</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shirt_chest_' + i + '" name="alteration_shirt_chest_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Chest</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shirt_chest1_' + i + '" name="alteration_shirt_chest1_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Shoulder</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shirt_shoulder_' + i + '" name="alteration_shirt_shoulder_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="" >Waist</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_waist1_' + i + '"  name="alteration_waist1_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Waist</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_waist2_' + i + '" name="alteration_waist2_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Seat</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_seat1_' + i + '" name="alteration_seat1_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Seat</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_shirt_seat2_' + i + '" name="alteration_shirt_seat2_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Bicep</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_bicep_' + i + '" name="alteration_bicep_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Sleeve L</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_shirt_sleeve_left_' + i + '" name="alteration_shirt_sleeve_left_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Cuff</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_cuff_' + i + '" name="alteration_cuff_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Sleeve R</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shirt_sleeve_r_' + i + '" name="alteration_shirt_sleeve_r_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
				template += '<div class="">';
				template += '<label for="">Sleeve Length</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shirt_sleeve_length_' + i + '" name="alteration_shirt_sleeve_length_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">  &nbsp; ';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
				template += '<div class="">';
				template += '<label for="">Length</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shirt_length_' + i + '" name="alteration_shirt_length_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12"> &nbsp; ';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
				template += '<div class="">';
				template += '<label for="">Other</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_shirt_other_' + i + '"name="alteration_shirt_other_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">  &nbsp; ';
				template += '</div>';
				template += '</div>';
				template += '<br style="clear:both;">';
				template += '<hr>';
			}
		}

		if (wstNumOfSectionGenerate && wstNumOfSectionGenerate != 0) {
			for (var i = 0; i < wstNumOfSectionGenerate; i++) {

				template += '<div class="col-md-12 col-sm-12 col-xs-12 section-five-info">';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for=""><b>WAISTCOAT</b></label>';
				template += '<input style="width: 180px;margin-bottom: 20px;" type="text" class="form-control pull-right" id="alteration_waistcoat_' + i + '" name="alteration_waistcoat_' + i + '" placeholder="Insert item details">';
				template += '</div>';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-12 col-sm-12 col-xs-12 section-five-fields">';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Chest</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_wc_chest_' + i + '" name="alteration_wc_chest_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Posture</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_wc_posture_' + i + '" name="alteration_wc_posture_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Waist</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_wc_waist_' + i + '" name="alteration_wc_waist_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Shoulder Height L</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_wc_shoulder_left_' + i + '"  name="alteration_wc_shoulder_left_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Seat</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_wc_seat_' + i + '" name="alteration_wc_seat_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Shoulder Height R</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_wc_shoulder_r_' + i + '"  name="alteration_wc_shoulder_r_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Back</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_wc_back_' + i + '" name="alteration_wc_back_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Armhole</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_wc_armhole_' + i + '" name="alteration_wc_armhole_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Length</label>';
				template += '<input type="text"  maxlength="24" class="form-control pull-right" id="alteration_wc_length_' + i + '" name="alteration_wc_length_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">';
				template += '<div class="">';
				template += '<label for="">Closing Button Height</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_wc_btn_' + i + '" name="alteration_wc_btn_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
				template += '<div class="">';
				template += '<label for="">Shoulder</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_wc_shoulder_' + i + '" name="alteration_wc_shoulder_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12">&nbsp; ';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
				template += '<div class="">';
				template += '<label for="">Other</label>';
				template += '<input type="text" maxlength="24"  class="form-control pull-right" id="alteration_wc_other_' + i + '" name="alteration_wc_other_' + i + '">';
				template += '</div>';
				template += '</div>';
				template += '<div class="col-md-6 col-sm-12 col-xs-12"> &nbsp; ';
				template += '</div>';
				template += '</div>';
				template += '<br style="clear:both;">';
				template += '<hr>';
			}
		}
		if (notesFlag) {
			template += '<div class="col-md-12 col-sm-12 col-xs-12 section-six-info"><p><b style="margin-left: 15px;">Notes</b></p>';
			template += '</div>';
			template += '<div class="col-md-12 col-sm-12 col-xs-12 section-six-fields">';
			template += '<div class="col-md-6 col-sm-12 col-xs-12" style="clear:both;">';
			template += '<div class="">';
			template += ' <textarea class="form-control" rows="5" id="notes_comment" name="notes_comment"></textarea>';
			template += '</div>';
			template += '</div>';
			template += '<div class="col-md-6 col-sm-12 col-xs-12"> &nbsp; ';
			template += '</div>';
			template += '</div>';
			template += '<input type="hidden" id="alteration_client_id" name="alteration_client_id" value="' + clientId + '">';
			template += '<input type="hidden" id="alteration_rec_id" name="alteration_rec_id" value="-999">';
		}

		return template;

	}


	function itemDetailsDesignOptions(designOptions, selectedValuesObj, customerliningurl) {

		var template = "";
		var selectedDesignOptionMessage = '';
		if (selectedValuesObj) {
			selectedDesignOptionMessage = selectedValuesObj["custcol_designoption_message"];
		}
		var collapse = [];
		collapse['Jacket'] = ['Monogram Underside Collar', 'Monogram Lining', 'Branding'];
		collapse['Trouser'] = ['Monogram', 'Branding'];
		collapse['Waistcoat'] = ['Branding'];
		collapse['Overcoat'] = ['Monogram Under Collar', 'Monogram Interior Lining', 'Branding'];
		collapse['Shirt'] = ['Contrast', 'Monogram', 'Branding and Presentation'];
		collapse['Short-Sleeves-Shirt'] = ['Contrast', 'Monogram', 'Branding and Presentation'];
		collapse['Trenchcoat'] = ['Monogram Under Collar', 'Monogram Interior Lining', 'Branding'];
		collapse['Ladies-Jacket'] = ['Trims','Branding'];
		collapse['Ladies-Pants'] = ['Trims'];
		collapse['Ladies-Skirt'] = ['Buttons'];



		if (designOptions && Object.keys(designOptions).length > 0) {
			template += '<h2 class="section-header" style="margin-top: 30px">Design Options</h2><hr/>';

			template += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">';
			template += '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>';
			template += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">';
			template += '<style>';
			template += '.product-details-full-main-content .panel-heading{padding: 0;}.product-details-full-main-content .panel-title a{display: block;padding: 10px 15px;font-weight: bold;color: #706f6f;}.product-details-full-main-content .panel{border-radius:0; box-shadow: none;}';
			template += '.product-details-full-main-content .panel-default>.panel-heading{background: white; border-bottom:0;}.accordion-toggle:after {float: right;color: grey;}';
			template += '.product-details-full-main-content .panel-collapse .panel-body, .product-details-full-main-content .panel-group .panel, .product-details-full-main-content .panel-group .panel-heading{background-color: rgb(236, 236, 236);}';
			template += '.product-details-full-main-content .panel-group .accordion-toggle-inner:after{float: right;color: grey}.accordion-toggle-inner{padding-left: 0 !important;padding-right: 0 !important;}';
			template += '.product-details-full-main-content .panel-group .panel-default{border: 0;}.product-details-full-main-content .panel-default>.panel-heading+.panel-collapse>.panel-body{border-top-color: white;}';
			template += '.product-details-full-main-content .panel-body .form-group label{float: left;width: 33%;}.product-details-full-main-content .panel-body select.form-control{float: left;width: 44%;border-radius: 0;box-shadow: none;height: 30px;}';
			template += '.icon-question-sign{display: inline-block;width: 14px;height: 14px;*margin-right: .3em;line-height: 14px;vertical-align: text-top;background-image: url(http://jerome.dynasoftcloud.com/shopflow//img/glyphicons-halflings.png);background-repeat: no-repeat;margin-top: 1px;}';
			template += '.panel-body .fa-question-circle{top: 8px;left: 6px;position: relative;}';
			template += '.product-details-full-main-content h4.accordion-toggle{border-bottom: 1px solid white;padding-bottom: 10px;color: #6e6e6e;}';
			template += '.accordion label{font-size: 13px;font-weight: normal;line-height: 18px;}';
			template += '.product-details-full-main-content .accordion .controls{width: 310px;}'; // zain 02-09-19
			template += '.product-details-full-main-content .accordion .controls select{width: 95%;height: 32px;padding: 6px; float:left;}'; // zain 16-07-19
			template += '.accord-arrow-down{font-size: 42px;vertical-align: top;color: gray;transform: rotate(90deg);margin-top: -16px;position: absolute;right: 28px;}';
			template += '.accord-arrow-down-inner{font-size: 50px;margin-top: -23px;}';
			template += '</style>';
			template += '<div class="accordion" id="design-option">';

			for (var clothingType in designOptions) {

				var tempClothingType = clothingType;
				if(clothingType.toLowerCase().indexOf('short-sleeves-shirt')!=-1){clothingType = 'ssshirt';} //added to change the field name for liveorder line model saving
				var mapSlectedFildsObj = {};
				var currentClothingType = designOptions[tempClothingType];
				if (selectedValuesObj) {
					var designOptionId = 'custcol_designoptions_' + clothingType.trim().replace(/-/g, "").toLowerCase();
					var singleDesignOptionsValues = selectedValuesObj[designOptionId];
					// console.log(designOptionId, tempClothingType, singleDesignOptionsValues, selectedValuesObj);
					if (singleDesignOptionsValues) {
						singleDesignOptionsValues = JSON.parse(singleDesignOptionsValues);
						for (var i = 0; i < singleDesignOptionsValues.length; i++) {
							mapSlectedFildsObj[singleDesignOptionsValues[i].name.trim()] = singleDesignOptionsValues[i].value;
						}
					}
				}
				template += '<div class="panel panel-default">';
				template += '<div class="panel-heading">';
				template += ' <h4 class="panel-title">';
				template += '<a class="accordion-toggle design-options-dropdown-on-click-set" data-toggle="collapse" data-target="#design-option-' + clothingType + '" data-parent="#design-option">' + tempClothingType + ' <span class="accord-arrow-down">&#8227;</span></a>'; // zain 30-08-19
				template += '</h4>';
				template += '</div>';
				template += '<div id="design-option-' + clothingType + '" class="panel-collapse collapse">';

				template += '<div class="panel-body">';
				template += '<div class="panel-group" id="accordion2">';
				template += '<div class="panel panel-default">';

				var index1 = 0;
				for (var component in currentClothingType) {
					index1++;
					var currentComponent = currentClothingType[component];

					template += '<div class="panel-heading" data-input="canvas_canvas_jacket" id="design-option-control-group-' + clothingType + '-' + index1 + '">';
					if (collapse[tempClothingType].indexOf(component) != -1) {
						template += '<a data-toggle="collapse" data-target="#design-option-members-' + clothingType + '-' + index1 + '" data-parent="#design-option-control-group' + index1 + '" >';
						template += '<h4 class="accordion-toggle">' + component + '<span class="accord-arrow-down accord-arrow-down-inner">&#8227;</span></h4>'; // zain 24-07-19
						template += '</a>';
					} else {
						template += '<a data-toggle="collapse" data-target="#design-option-members-' + clothingType + '-' + index1 + '" data-parent="#design-option-control-group' + index1 + '">';
						template += '<h4 class="accordion-toggle">' + component + '<span class="accord-arrow-down accord-arrow-down-inner">&#8227;</span></h4>'; // zain 24-07-19
						template += '</a>';
					}

					//template += '<hr/>'; // zain 24-07-19

					if (collapse[tempClothingType].indexOf(component) != -1) {
						template += '<div id="design-option-members-' + clothingType + '-' + index1 + '" class="collapse" style="background-color:#ececec;height:0px;">';
					} else {
						template += '<div id="design-option-members-' + clothingType + '-' + index1 + '" class="in collapse" style="background-color:#ececec;">';
					}


					for (var field in currentComponent) {
						var currentField = currentComponent[field];
						// 04-12-2019 umer & saad
						if (currentField.name.indexOf('TryonRestriction') !== -1) {
							continue;
						}
						template += '<div style="padding-left:25px;display:flex;">'; // zain 16-07-19
						template += '<div style="width:200px;display:inline-block;" >';
						template += '<label style="float:left;" class="control-label" for="canvas_canvas_jacket">' + field + '</label>'; // zain 16-07-19
						template += '</div>';

						var isSelectType = (currentField.type == "select") ? true : false;
						var isTextType = (currentField.type == "text") ? true : false;
						var isNumberType = (currentField.type == "number") ? true : false;


						if (singleDesignOptionsValues) { //To Set edit values
							if (isSelectType) {
								template += '<div class="controls" style="display:inline-block;">';
								template += '<select fieldname="' + field + '" id="' + currentField.name + '" class="input-xlarge display-option-dropdown" name="' + currentField.name + '" data-type="fav-option-customization">';
								_.each(currentField.values, function (option) {
									if (mapSlectedFildsObj[currentField.name.trim()] == option.value) {
										template += '<option selected value="' + option.value + '" name="' + option.name + '" >' + option.name + '</option>';
									} else {
										template += '<option value="' + option.value + '" name="' + option.name + '" >' + option.name + '</option>';
									}
								});
								template += '</select>';

								template += '<div class="show-options-img" id="more-info_' + currentField.name + '" >';
								_.each(currentField.values, function (option, index) {
									if (option.isFavourite == true || option.isFavourite == "true") {
										template += Utils.displayMoreInfo(option.value + "|" + currentField.label)
									}
								})
								template += '</div>';
								if (currentField.name == 'li-b-j' || currentField.name == 'li-bl-w' || currentField.name == 'li-bl-o' || currentField.name == 'li-bl-tc'||currentField.name == 'li-b-lj') {
									console.log('name '+currentField.name)
									template += '<a href="'+customerliningurl+'" target="_blank">New</a>';
								}

								if (currentField.name == 'li-b-j' || currentField.name == 'T010227' || currentField.name == 'li-bl-w' || currentField.name == 'li-bl-o' || currentField.name == 'T010415' ||currentField.name == 'T027230'||currentField.name == 'li-bl-tc'||currentField.name == 'li-b-lj') {
									template += '<span class="show-lining-img" id="liningstatusimage">';
									template += '</span>'; // zain 19-08-19
								}
								template += '</div>';
							}

							if (isTextType) {
								currentField.value = currentField.value ? currentField.value : ''
								template += '<div class="controls" style="margin-bottom: 15px;display:inline-block">';
								if (mapSlectedFildsObj[currentField.name.trim()]) {
									template += '<input style="width: 95%;float: left;" data-type="' + currentField.datatype + '" data-placeholder="' + currentField.dataplaceholder + '" placeholder="' + currentField.placeholder + '" type="text" maxlength="' + currentField.maxlength + '" fieldname="' + field + '" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="' + mapSlectedFildsObj[currentField.name.trim()] + '" data-type="fav-option-customization" >'; //zain 16-07-19
								} else {
									template += '<input style="width: 95%;float: left;" data-type="' + currentField.datatype + '" data-placeholder="' + currentField.dataplaceholder + '" placeholder="' + currentField.placeholder + '" type="text" maxlength="' + currentField.maxlength + '" fieldname="' + field + '" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="' + currentField.value + '" data-type="fav-option-customization" >'; //zain 16-07-19
								}
								template += '<div class="show-options-img" id="more-info_' + currentField.name + '">'; //zain 16-07-19
								template += '</div>';
								template += Utils.displayMoreInfo(currentField.name + "|" + currentField.label)
								template += '</div>';
							}
							if (isNumberType) {

								template += '<div class="controls" style="margin-bottom: 15px;display:inline-block">';
								if (mapSlectedFildsObj[currentField.name.trim()]) {
									if (clothingType == 'Jacket') {
										template += '<input style="width: 95%; float: left;" type="number" fieldname="' + field + ' " step="0.01" min="0.88" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="' + mapSlectedFildsObj[currentField.name.trim()] + '" data-type="fav-option-customization">';
									} else if (clothingType == 'Waistcoat') {
										template += '<input style="width: 95%; float: left;" type="number" fieldname="' + field + ' " step="0.01" min="0.84" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="' + mapSlectedFildsObj[currentField.name.trim()] + '" data-type="fav-option-customization">';
									} else {
										template += '<input style="width: 95%; float: left;" type="number" fieldname="' + field + ' " step="0.01" min="0" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="' + mapSlectedFildsObj[currentField.name.trim()] + '" data-type="fav-option-customization">';
									}
								} else {
									if (clothingType == 'Jacket') {
										template += '<input style="width: 95%;float: left;" type="number" fieldname="' + field + ' " step="0.01" min="0.88" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="" data-type="fav-option-customization">'; //zain 16-07-19
									} else if (clothingType == 'Waistcoat') {
										template += '<input style="width: 95%;float: left;" type="number" fieldname="' + field + ' " step="0.01" min="0.84" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="" data-type="fav-option-customization">'; //zain 16-07-19
									} else {
										template += '<input style="width: 95%;float: left;" type="number" fieldname="' + field + ' " step="0.01" min="0" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="" data-type="fav-option-customization">'; //zain 16-07-19

									}

								}
								template += '<div class="show-options-img" id="more-info_' + currentField.name + '">'; //zain 16-07-19
								template += '</div>';
								template += Utils.displayMoreInfo(currentField.name + "|" + currentField.label)
								template += '</div>';
							}

						} else {

							if (isSelectType) {
								template += '<div class="controls" style="display:inline-block;">';
								template += '<select fieldname="' + field + '" id="' + currentField.name + '" class="input-xlarge display-option-dropdown" name="' + currentField.name + '" data-type="fav-option-customization">';
								_.each(currentField.values, function (option) {
									if (option.isFavourite == true || option.isFavourite == "true") {
										template += '<option selected value="' + option.value + '" name="' + option.name + '" >' + option.name + '</option>';
									} else {
										template += '<option value="' + option.value + '" name="' + option.name + '" >' + option.name + '</option>';
									}
								});
								template += '</select>';

								template += '<div class="show-options-img" id="more-info_' + currentField.name + '" >';
								_.each(currentField.values, function (option, index) {
									if (option.isFavourite == true || option.isFavourite == "true") {
										template += Utils.displayMoreInfo(option.value + "|" + currentField.label)
									}
								})
								template += '</div>';
								if (currentField.name == 'li-b-j' || currentField.name == 'li-bl-w' || currentField.name == 'li-bl-o' || currentField.name == 'li-bl-tc'||currentField.name == 'li-b-lj') {
									console.log('name '+currentField.name)
									template += '<a href="'+customerliningurl+'" target="_blank">New</a>';
								}

								if (currentField.name == 'li-b-j' || currentField.name == 'T010227' || currentField.name == 'li-bl-w' || currentField.name == 'li-bl-o' || currentField.name == 'T010415'||currentField.name == 'T027230'||currentField.name == 'li-bl-tc'||currentField.name == 'li-b-lj') {
									template += '<span class="show-lining-img" id="liningstatusimage">';
									template += '</span>'; // zain 19-08-19
								}
								template += '</div>';
							}

							if (isTextType) {
								currentField.value = currentField.value ? currentField.value : ''
								template += '<div class="controls" style="display:inline-block">';
								template += '<input style="width: 95%;float: left;" data-type="' + currentField.datatype + '" data-placeholder="' + currentField.dataplaceholder + '" placeholder="' + currentField.placeholder + '" type="text" maxlength="' + currentField.maxlength + '" fieldname="' + field + '" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="' + currentField.value + '" data-type="fav-option-customization" >'; //zain 16-07-19
								template += '<div class="show-options-img" id="more-info_' + currentField.name + '">'; //zain 16-07-19
								template += '</div>';

								template += Utils.displayMoreInfo(currentField.name + "|" + currentField.label)
								template += '</div>';
							}
							if (isNumberType) {
								template += '<div class="controls" style="display:inline-block">';
								if (clothingType == 'Jacket') {
									template += '<input style="width: 95%;float: left;" type="number" fieldname="' + field + ' " step="0.01" min="0.88" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value=" ' + currentField.value + '" data-type="fav-option-customization">'; //zain 16-07-19
								} else if (clothingType == 'Waistcoat') {
									template += '<input style="width: 95%;float: left;" type="number" fieldname="' + field + ' " step="0.01" min="0.84" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="' + currentField.value + '" data-type="fav-option-customization">'; //zain 16-07-19
								} else {
									template += '<input style="width: 95%;float: left;" type="number" fieldname="' + field + ' " step="0.01" min="0" id="' + currentField.name + '" class="input-xlarge" name="' + currentField.name + '" value="' + currentField.value + '" data-type="fav-option-customization">'; //zain 16-07-19
								}
								template += '<div class="show-options-img" id="more-info_' + currentField.name + '">'; //zain 16-07-19
								template += '</div>';
								template += Utils.displayMoreInfo(currentField.name + "|" + currentField.label)
								template += '</div>';
							}

						}
						template += '</div>';
					}
					template += '</div>';
					// zain 28-10-19 start
					template += '<script>';
					template += '$("#design-option-members-Jacket-8").removeClass("in");';
					template += '$("#design-option-members-Shirt-7").removeClass("in");'; // zain 20-12-19
					template += '</script>';
					// zain 28-10-19 end
					template += '</div>';

				}
				template += '</div>';
				template += '</div>';
				template += '</div>';
				template += '</div>';
				template += '</div>';
			}
			template += '</div>';
			template += '</div>';
			template += '<div class="control-group" data-input="designoption-message">';
			template += '<label class="control-label" for="designoption-message">Notes (Internal use only)</label>'; // 14/11/2019 Umar Zulfiqar {RFQ: Add text that notes are for internal use only}
			template += '<div class="controls">';
			if (selectedDesignOptionMessage) {
				template += '<textarea class="input-xxlarge designoption-message" id="designoption-message" name="designoption-message">' + selectedDesignOptionMessage + '</textarea>';

			} else {
				template += '<textarea class="input-xxlarge designoption-message" id="designoption-message" name="designoption-message"></textarea>';

			}
			template += '</div>';
			template += '</div>';

		}


		return template;
	}




	function displayMoreInfo(selectedOption) { //05/07/2019 Saad   //11/07/2019 Saad   27/08/2019 Saad
		var template = '';
		template += '<a data-toggle="show-in-modal" href="/img/' + escape(selectedOption) + '" data-touchpoint="home" data-hashtag="img/' + escape(selectedOption) + '">'; //data-toggle="show-in-modal"   href="img/'  + escape(selectedOption) + ' "
		template += '<i style="color:black;" class="fa fa-question-circle"></i>'; // zain 16-07-19
		template += '</a>';
		//	template+='<div id="display-option-gallery"></div>';
		return template;
	}


	// alterationsOptionDropdown Function (End)

	function setFunc(model, attribute, data) {

		var updatedModel = model.set(attribute, data);

		return updatedModel;

	}





	function profileForm(selectedProfile, measurement_config, paramEvent, clientid, tailorId) {
		var template = '';
		var parent;
		if (clientid) {
			parent = clientid;

		} else {
			parent = selectedProfile.current_client;

		}
		if (selectedProfile) {
			window.selectedProductType = selectedProfile.custrecord_fp_product_type;
		}

		var eventValue = (!_.isNull(paramEvent) && paramEvent == 'add') ? 'add' : 'viewedit';
		var isAddEvent = (eventValue == 'add') ? true : false;
		var isViewEdit = (eventValue == 'viewedit') ? true : false;
		/**** zain (19-06-09) start ****/
		if (isAddEvent) {
			jQuery('#fit-profile-modal-heading').html('Add Fit Profile');
			jQuery('#fit-profile-modal-submit-button').html('<button id="butt-modal-submit-fit-profile" type="button" class="custom-btn" style="font-weight: 600; border: 0;">Submit</button>'); // zain 18-07-19 // zain 19-08-19
		}

		if (isViewEdit) {
			jQuery('#fit-profile-modal-heading').html('View/Edit Fit Profile');
			jQuery('#fit-profile-modal-copy-button').html('<button id="butt-modal-copy" type="button" class="custom-btn" style="font-weight: 600; margin-left: 5px;">Copy</button>');
			jQuery('#fit-profile-modal-remove-button').html('<button id="butt-modal-remove" data-action="remove-rec-flow" data-type="profile" data-id="' + selectedProfile.internalid + '" class="custom-btn" style="font-weight: 600; margin-left: 5px;">Remove</button>'); //20/01/2020
			jQuery('#fit-profile-modal-submit-button').html('<button id="butt-modal-submit-fit-profile" type="button" class="custom-btn" style="font-weight: 600; border: 0;">Submit</button>'); // zain 18-07-19 // zain 19-08-19

		}
		/**** zain (19-06-09) end ****/
		template += '<style>#fitprofilesearch .span3{width:none !important;}.product-measure-type{overflow:hidden;margin-top: 20px;}.span-custom{width: 25%;float: left;}';
		template += '#measure-type{margin-left:25px;}.span-custom label{width: 100%;margin-bottom: 0;}.span-custom select{width: 100%;height: 30px;padding: 5px;margin-top: 10px;background-size: 19px;}';
		template += '.name-fit-pro{width:54%;}#measure-form h4.section-header{margin-top: 15px;margin-bottom: 20px;color: black;}';
		template += '.col-wid-20{width:20%;float: left;}.col-wid-10{width: 10% !important;float: left;}.col-wid-30{width:24%;float: left;}.col-wid-70{width:70%;float: left;}';
		template += 'select{height: 30px;padding: 5px;background-size: 19px;}#profile-form .row-fluid{overflow:hidden;margin-bottom: 10px;} ';

		template += '.span3-profile{float:left;}.span2.measurement{float: left;width: 30%;}.span3-profile.measurement input{width: 95%;}.body-profile-section select{width:100% !important;}';
		template += '</style>';
		template += '<form id="profile-form">';

		template += '<div>';

		template += '<fieldset>';
		template += '<input type="hidden" value="' + parent + '" name="custrecord_fp_client" data-rectype="field">';

		template += '<div class="control-group" data-input="name">';
		template += '<label class="control-label" for="name">';
		template += 'Fit Profile Name';
		template += '&nbsp;';
		template += '<small>';
		template += '(required)';
		template += '</small>';
		template += '</label>';
		template += '<div class="controls">';
		if (selectedProfile) {
			template += '<input type="text" class="input-xlarge name-fit-pro" id="name" name="name" value="' + selectedProfile.name + '" data-rectype="field">';
		} else {
			template += '<input style="width: 50%; height: 28px;" type="text" class="input-xlarge" id="name" name="name" value="" data-rectype="field">';
		}
		template += '</div>';
		template += '</div>';
		template += '<div class="row-fluid product-measure-type">';
		template += '<div class="control-group span-custom"  data-input="custrecord_fp_product_type">';
		template += '<label class="control-label" for="custrecord_fp_product_type">';
		template += 'Product Type ';
		template += '<small>';
		template += '(required)';
		template += '</small>';
		template += '</label>';
		template += '<div class="controls">';
		template += Utils.itemTypeDropdown(_.pluck(measurement_config, "item_type"), selectedProfile ? selectedProfile.custrecord_fp_product_type : null)
		template += '</div>';
		template += '	</div>';

		template += '<div class="span-custom col-md-5" id="measure-type">';

		if (selectedProfile) {
			var selectedItemType = _.where(measurement_config, {
					item_type: selectedProfile.custrecord_fp_product_type
				})[0],
				measurementType = (selectedItemType)?_.pluck(selectedItemType.measurement, "type"):[];

			template += Utils.measureTypeDropdown(measurementType, selectedProfile ? selectedProfile.custrecord_fp_measure_type : null)
		}
		template += '	</div>';
		template += '</div>';
		template += '<div id="measure-form">';
		if (selectedProfile) {
			var selectedItemTypeMeasure = selectedProfile.custrecord_fp_product_type,
				measurementTypeMeasure = selectedProfile.custrecord_fp_measure_type,
				fieldsForm = null;

			if (measurementTypeMeasure && selectedItemTypeMeasure) {
				fieldsForm = _.where(measurement_config, {item_type: selectedItemTypeMeasure})[0];
				fieldsForm = (fieldsForm)?_.where(fieldsForm.measurement, {type: measurementTypeMeasure})[0]:[];

				var swxFpMeasureValue = selectedProfile ? JSON.parse(selectedProfile.custrecord_fp_measure_value) : null;
				var param = {};
				param.type = "get_favourite_fit_tools";
				param.id = tailorId;
				Utils.requestUrlAsync("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function (data) {
					if(data){
						var tempFavFitToolsData = JSON.parse(data);
						var	favDefaultData = tempFavFitToolsData[0]?JSON.parse(tempFavFitToolsData[0]):measurement_config;
						tempFavFitToolsData = _.find(favDefaultData, function(value){return value.itemType == selectedProfile.custrecord_fp_product_type;}) || [];
						// added filter to remove unneccessary fields from data.
						swxFpMeasureValue = _.filter(swxFpMeasureValue, function(swxVal){
							if(swxVal.name.indexOf('hide-checkbox')==-1){
								if(swxVal.name.indexOf("1/2")!=-1){ // added to map the values of fit profile tools and saved fit profile
									swxVal.name = swxVal.name.replace("1/2", "half");
								}
								return swxVal;
							}
						});
						swxFpMeasureValue = _.uniq(_.union(swxFpMeasureValue, tempFavFitToolsData.measurementValues), function(x){
							return x.name;
						});
					}
				});
				template += Utils.measureForm(fieldsForm, swxFpMeasureValue, eventValue, selectedProfile ? selectedProfile.custrecord_fp_product_type : null)
			}
		}

		template += '</div>';
		template += '</fieldset>';
		template += '</form>';
		template += '</div> ';

		return template;

	}

	function itemTypeDropdown(itemTypes, selectedType) {

		var template = '';
		if (itemTypes && itemTypes.length) {
			template += '<select class="input-xlarge" id="custrecord_fp_product_type" name="custrecord_fp_product_type">';
			template += '<option value="">Select an Item</option>';
			_.each(itemTypes, function (itemType) {
				if (selectedType == itemType) {
					template += '<option value="' + itemType + '"  selected>' + itemType + '</option>';

				} else {
					template += '<option value="' + itemType + '">' + itemType + '</option>';

				}
			})
			template += '</select>';
		}

		return template;
	}



	function measureTypeDropdown(measureTypes, selectedType) {

		var template = '';
		if (measureTypes && measureTypes.length) {
			template += '<div class="control-group"  data-input="custrecord_fp_measure_type">';
			template += '<label class="control-label" for="custrecord_fp_measure_type">';
			template += 'Measurement Type ';
			template += '<small>';
			template += '(required)';
			template += '	</small>';
			template += '	</label>';
			template += '<div class="controls">';
			template += '<select class="input-xlarge" id="custrecord_fp_measure_type" name="custrecord_fp_measure_type">';
			template += '<option value="">Select Type</option>';
			_.each(measureTypes, function (measureType) {
				if (selectedType == measureType) {
					template += '<option value="' + measureType + '"  selected>' + measureType + ' </option>';
				} else {
					template += '<option value="' + measureType + '" >' + measureType + ' </option>';
				}
			})
			template += '</select>';
			template += '</div>';
			template += '</div>';
		}
		return template;
	}


	function measureForm(fields, values, paramEvent, selectedItemType, favFitToolsFlag, blockSizes) { //	28-11-2019 saad
		//added to handle the special character in names
		_.map(fields.fieldset.fields, function(field){return field.name = decodeURIComponent(field.name);});
		_.map(values, function(value){return value.name = decodeURIComponent(value.name);});

		var template = '';
		var eventValue = (!_.isNull(paramEvent) && paramEvent == 'add') ? 'add' : 'viewedit';
		var isAddEvent = (eventValue == 'add') ? true : false;
		var isViewEdit = (eventValue == 'viewedit') ? true : false;


		if (fields && fields.fieldset && fields.fieldset.length) {
			template += '<h4 class="section-header"> Measurement Details </h4>';

			_.each(fields.fieldset, function (fieldset) {
				if (fieldset.name == 'main') {
					template += '<div class="main-section">';
					if (fields.type == 'Body') {

						_.each(fieldset.fields, function (field) {
							var mainBodyValue = null,
								fieldValue = _.where(values, {
									name: field.name
								})
							if (fieldValue.length) {
								mainBodyValue = fieldValue[0].value;
							}


							template += Utils.bodyMeasureField(field, mainBodyValue, fieldset.name, 0, 0, selectedItemType)
						})
					} else {
						_.each(fieldset.fields, function (field) {
							var mainBlockValue = null,
								fieldValue = _.where(values, {
									name: field.name
								})
							if (fieldValue.length) {
								mainBlockValue = fieldValue[0].value;
							}

							template += Utils.blockMeasureField(field, mainBlockValue, null, null, blockSizes); //27-11-2019 saad
						})
					}
					template += '</div>';
				} else {
					template += '<div class="' + fieldset.name + '-section">';
					template += '<h4> ' + fieldset.label + ' </h4>';
					template += '<hr />';
					if (fields.type == 'Body') {
						if (fieldset.name == "body-measurement") {
							template += '<div class="row-fluid">';

							template += '<div style="width:30%; float:left;margin:0;">&nbsp;</div>';
							template += '<div style="width:20%;margin:0;float:left;" class="span3-profile offset2"> Measurement </div>';
							template += '<div style="width:20%;margin:0;float:left;" class="span3-profile"> Allowance </div>';
							template += '<div style="width:20%;margin:0;float:left; text-align:center;" class="span3-profile"> Finished </div>';
							template += '<div style="width:10%;margin:0;float:left;" class="span3-profile"> Range </div>';
							template += '</div>';

						}
						_.each(fieldset.fields, function (field) {

							var fieldName = field.name;
							var bodyValue = 0,
								allowance = 0,
								baseAllowance = 0

							var fieldValue = _.where(values, {
								name: fieldName
							});
							if (fieldValue.length === 0) {
								fieldValue = _.where(values, {
									name: fieldName.replace('-', ' ')
								});
								fieldName = fieldName.replace('-', ' ');
							}
							if (fieldValue.length === 0) {
								fieldValue = _.where(values, {
									name: fieldName.replace('+', ' ')
								});
								fieldName = fieldName.replace('+', ' ');
							}

							var allowFieldValue = _.where(values, {
								name: "allowance-" + fieldName
							})
							var lookUpField = _.where(values, {
								name: fields["lookup-key"]
							});

							if (values) {
								if (fieldValue.length) {
									bodyValue = fieldValue[0].value;
								}
								if (allowFieldValue.length) {
									allowance = allowFieldValue[0].value;
								}
								if (lookUpField.length) {
									baseAllowance = _.where(fields["lookup-value"][lookUpField[0].value], {
										field: field.name
									})[0];
									baseAllowance = baseAllowance && baseAllowance.value ? baseAllowance.value : 0;
								}
							} else {
								baseAllowance = _.where(fields["lookup-value"]["Very Slim"], {
									field: field.name
								})[0];
								baseAllowance = baseAllowance && baseAllowance.value ? baseAllowance.value : 0;
							}
							template += Utils.bodyMeasureField(field, bodyValue, fieldset.name, baseAllowance, allowance, selectedItemType)
						})
					} else {

						template += '<div class="row-fluid">';
						template += '<div style="width:23.8%;float:left;">&nbsp;</div>'; // zain 20-12-19
						template += '<div style="width:20%;margin:0;float:left;" class="span3 offset3">' + fieldset["max-label"] + '</div>';
						template += '<div style="width:20%;margin:0;float:left;"  class="span3 offset5p">' + fieldset["min-label"] + '</div>';
						if ((fieldset.name == 'length' || fieldset.name == 'horizontals') && !favFitToolsFlag) {
							template += '<div style="width:11%;float:left; color:#c1c1c1;"> Default </div>';
							template += '<div style="width:9%;margin:0;float:left; color:#c1c1c1;"  class="span-w-10 offset5p"> Block </div>';
							template += '<div style="width:10%;margin:0;float:left; color:#c1c1c1;" class="span-w-10"> Finished </div>';
						} else if (!favFitToolsFlag) {
							template += '<div style="width:11%;text-align:left;float: left; color:#c1c1c1;"> Default</div>';
							template += '<div style="width:9%;margin:0;float:left; color:#c1c1c1;" class="span3">&nbsp;</div>';
							template += '<div style="width:10%;margin:0;float:left; color:#c1c1c1;" class="span3">&nbsp;</div>';
						}

						template += '</div>';
						_.each(fieldset.fields, function (field) {
							var blockValueMin = _.where(values, {
									name: field.name + "-min"
								})[0],
								blockValueMax = _.where(values, {
									name: field.name + "-max"
								})[0],
								value = [blockValueMin, blockValueMax],
								//Umar Zulfiqar: RFC added hide field to skip the field from being populated.
								hideField = _.where(values, {
									name: field.name + "-hide-checkbox"
								})[0];
								if((hideField != undefined && hideField.value == 'true') || (blockValueMin == undefined && blockValueMax == undefined)){
									return;
								}// Umar Zulfiqar: End
							template += Utils.blockMeasureField(field, value, fields.increment, fieldset, blockSizes); //27-11-2019 saad
						})
					}
					template += '</div>';
					if (fieldset.name == "body-measurement" && (selectedItemType == 'Jacket' || selectedItemType == 'Waistcoat' ||
							jQuery('[id*="custrecord_fp_product_type"]').val() == 'Jacket' || jQuery('[id*="custrecord_fp_product_type"]').val() == 'Waistcoat')) {

						template += '<p id="optionalmessage">** optional measurement</p>';
					}
				}
			})

			template += '<div class="form-actions" style="display: none;">';
			template += '<button id="swx-fitprofile-submit" class="btn btn-primary" type="submit">Submit</button>';
			template += '<button data-action="reset" class="btn hide" type="reset">Cancel</button>';

			if (isViewEdit) {
				template += '<button id="swx-fitprofile-remove" class="btn" type="button" style="">Remove</button>';
				template += '<button id="swx-fitprofile-copy" class="btn" type="button" style="">Copy</button>';
			}

			template += '</div>';

		}
		// _.each(values, function(value){
		// 	if(value.name.indexOf('-hide-checkbox') != -1 && value.value == 'true'){   //27-11-2019 saad
		// 		// console.log(value);
		// 		jQuery('#'+value.name).parent().addClass('hide');
		// 	}
		// });

		return template;

	}

	function suiteRestGetData(paramObjFunctionName, paramObjInputData) {
		var SUITEREST_URL = '/app/site/hosting/scriptlet.nl?script=154&deploy=1&compid=3857857&h=70494400753de3ffe57b';
		var functionName = 'suiteRest';
		var objDataResponse = '';
		var objRef = '';
		var stFuncName = paramObjFunctionName;
		var objInputData = paramObjInputData;
		var inputJSON = {
			'func': stFuncName,
			'data': objInputData
		};
		var JSONtoSend = JSON.stringify(inputJSON);

		var processAjaxData = $.ajax({
			url: SUITEREST_URL + '&inputJson=' + JSONtoSend,
			type: "GET",
			dataType: "json",
			contentType: "application/json",
			cache: false,
			error: function (jqXHR, textStatus, errorThrown) {},
			async: true,
			success: function (jsonResponse) {
				//var objResponseRef = jsonResponse;
				//var isSuccessResponse = (!isNullOrEmpty(objResponseRef['success']) && objResponseRef['success'] == 'T') ? true : false;

			}
		});

		return processAjaxData
	}

	// message Function (Start)

	function message(message, type, closable) {

		var template = "";
		template += '<div class="alert ' + (type ? 'alert-' + type : '') + '" style="background: #f2dede;color: #b94a48;padding: 9px 20px;">';
		if (closable) {
			template += '<button class="close" data-dismiss="alert" style="color: black;opacity: 0.4;">&times;</button>';
		}
		if (_.isObject(message)) {
			template += '<ul>';
			Utils.each(message, function (item, index) {
				template += '<li>' + item + '</li>';
			})
			template += '<ul>';
		} else {
			template += message;
		}
		template += '</div>';

		return template;
	}

	// message Function (End)

	//getArrAllSelectedOptions Function (Start)
	function getArrAllSelectedOptions() {
		var functionName = 'getAllSelectedOptions';
		var processStr = '';

		var arrSelected = [];

		try {
			var allSelectFldsTotal = jQuery("select").length;
			var hasSelectedFlds = (allSelectFldsTotal != 0) ? true : false;
			if (hasSelectedFlds) {
				for (var dx = 0; dx < allSelectFldsTotal; dx++) {
					var selectedValue = jQuery("select").eq(dx).val();
					var stSelectedValue = (!_.isNull(selectedValue)) ? selectedValue : '';
					var isSelectedValueInArrSelected = (this.isElementExist(stSelectedValue.toString(), arrSelected)) ? true : false;
					var isPushArrSelected = (!isSelectedValueInArrSelected) ? arrSelected.push(stSelectedValue.toString()) : '';
				}
			}


		} catch (ex) {
			arrSelected = [];
		}

		return arrSelected;

	}
	//getArrAllSelectedOptions Function (End)

	//isElementExist Function (Start)
	function isElementExist(valueStr, arrSelected) // Function to check if array element exist Start
	{
		try {
			var convertedValueStr = valueStr.toString();
			for (var i = 0; i < arrSelected.length; i++) {
				if (arrSelected[i] === convertedValueStr)
					return true;
			}

		} catch (ex) {

		}
		return false;
	};
	//isElementExist Function (End)

	//getObjSelectSelectedValues Function (Start)
	function getObjSelectSelectedValues() {
		var functionName = 'getObjSelectSelectedValues';
		var processStr = '';
		var objReturn = {};

		try {
			var allSelectFldsTotal = jQuery("select").length;
			var hasSelectedFlds = (allSelectFldsTotal != 0) ? true : false;

			if (hasSelectedFlds) {
				for (var dx = 0; dx < allSelectFldsTotal; dx++) {
					var selectIdValue = jQuery("select").eq(dx).attr('id');
					var hasSelectId = (!_.isNull(selectIdValue)) ? true : false;

					if (hasSelectId) {
						var isSelectedIdExist = (isObjectExist(objReturn['' + selectIdValue + '']));

						if (!isSelectedIdExist) {
							var selectedValue = jQuery("select").eq(dx).val();
							objReturn['' + selectIdValue + ''] = selectedValue;
						}
					}
				}
			}
			var allTextFldsTotal = jQuery("#clothing-details input[type=text]").length;
			var hasTextFlds = (allTextFldsTotal != 0) ? true : false;

			if (hasTextFlds) {
				for (var dx = 0; dx < allTextFldsTotal; dx++) {
					var selectIdValue = jQuery("#clothing-details input[type=text]").eq(dx).attr('id');
					var hasSelectId = (!_.isNull(selectIdValue)) ? true : false;

					if (hasSelectId) {
						var isSelectedIdExist = (isObjectExist(objReturn['' + selectIdValue + '']));

						if (!isSelectedIdExist) {
							var selectedValue = jQuery("#clothing-details input[type=text]").eq(dx).val();
							objReturn['' + selectIdValue + ''] = selectedValue;
						}
					}
				}
			}
		} catch (ex) {
			objReturn = {};
			console.log('Error in ' + functionName + ': ' + '\n' + ex.toString())
		}
		return objReturn;
	}
	//getObjSelectSelectedValues Function (End)

	//getArrConflictCodesError Function (Start)
	function getArrConflictCodesError(paramObjConflicCodesMapping, paramArrAllSelectedOptions, paramObjSelectSelectedValues) {
		var functionName = 'getArrConflicCodesError';
		var processStr = '';
		var arrErr = []

		try {
			var OBJ_MAPPING = paramObjConflicCodesMapping;
			var arrAllSelectedOptions = paramArrAllSelectedOptions;
			var arrAllSelectedOptionsTotal = (!_.isNull(arrAllSelectedOptions)) ? arrAllSelectedOptions.length : 0;
			var objSelectSelectedValues = paramObjSelectSelectedValues;

			var hasObjMapping = (!this.isNullOrEmptyObject(OBJ_MAPPING)) ? true : false;
			var hasArrAllSelectedOptions = (arrAllSelectedOptionsTotal != 0) ? true : false;
			var hasObjSelectSelectedValues = (!this.isNullOrEmptyObject(objSelectSelectedValues)) ? true : false;
			var isIterateConflictCodes = (hasObjMapping && hasArrAllSelectedOptions && hasObjSelectSelectedValues) ? true : false;

			if (isIterateConflictCodes) {
				for (var dx = 0; dx < arrAllSelectedOptionsTotal; dx++) {
					var optionA = arrAllSelectedOptions[dx];
					var hasOptionA = (!_.isNull(optionA)) ? true : false;

					if (hasOptionA) {
						var isOptionAExistInMapping = (isObjectExist(OBJ_MAPPING['' + optionA + ''])) ? true : false;

						if (isOptionAExistInMapping) {
							var objConflict = OBJ_MAPPING['' + optionA + '']['CONFLICT'];

							for (var xj in objSelectSelectedValues) {
								var isSelectIdExistInConflict = (isObjectExist(objConflict['' + xj + ''])) ? true : false;

								if (isSelectIdExistInConflict) {
									var objConflictSelectId = objConflict['' + xj + ''];
									var isSelectSelectedValueExistInConflict = (isObjectExist(objConflictSelectId['' + objSelectSelectedValues[xj] + ''])) ? true : false;

									if (isSelectSelectedValueExistInConflict) {
										var stErr = objConflictSelectId['' + objSelectSelectedValues[xj] + '']['ERROR'];
										arrErr.push(stErr)
									}
								}
							}
						}

					}
				}
			}
		} catch (ex) {
			arrErr = [];
			console.log('Error in ' + functionName + ': ' + '\n' + ex.toString())
		}
		return arrErr;
	}
	//getArrConflictCodesError Function (End)

	//getHtmlErrConflictCodes Function (Start)
	function getHtmlErrConflictCodes(paramArrErr) {
		var functionName = 'getHtmlErrConflictCodes';
		var processStr = '';
		var htmlWriter = '';
		var arrErrMsg = paramArrErr;
		var arrErrMsgTotal = (!_.isNull(arrErrMsg)) ? arrErrMsg.length : 0;
		var hasArrErrMsg = (arrErrMsgTotal != 0) ? true : false;

		try {
			if (hasArrErrMsg) {
				for (var dx = 0; dx < arrErrMsgTotal; dx++) {
					htmlWriter += '<div style="padding: 5px;">';
					htmlWriter += arrErrMsg[dx]
					htmlWriter += '</div>';

				}
			}
		} catch (ex) {
			htmlWriter = '';
		}
		return htmlWriter;
	}
	//getHtmlErrConflictCodes Function (End)

	//displayModalWindow Function (Start)
	function displayModalWindow(paramModalTitle, paramModalContent, paramIsDisplayModalFooter) {
		var functionName = 'displayModalWindow';
		var processStr = '';
		var $ = jQuery;
		var isDisplayModalFooter = (!_.isNull(paramIsDisplayModalFooter)) ? paramIsDisplayModalFooter : true;

		try {
			$("h3[id='show-error-cart-modal-header']").empty();
			$("div[id='show-error-cart-modal-body']").empty();
			$("class[id='modal-footer']").hide();

			$("h3[id='show-error-cart-modal-header']").text(paramModalTitle);
			$("div[id='show-error-cart-modal-body']").html(paramModalContent);

			if (isDisplayModalFooter) {
				$("class[id='show-error-cart-modal-footer']").show()
			}

			//jQuery("[id='show-error-cart-modal-btn']").click();
			jQuery('#show-error-cart-modal').show();

		} catch (ex) {

		}
	}
	//displayModalWindow Function (End)

	// 14/11/2019 Umar Zulfiqar
	// validateText function to validate string for alphanumeric characters only.
	function validateText(string) {
		if (_.isEmpty(string) || string.match(/^[a-zA-Z0-9\s]+$/)) { // regex to allow only alphanumeric in textarea
			return true;
		} else {
			return false
		}
	}

	//isNullOrEmptyObject Function (Start)
	function isNullOrEmptyObject(obj) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;

		if (obj.length && obj.length > 0) {
			return false;
		}
		for (var key in obj) {
			if (hasOwnProperty.call(obj, key)) return false;
		}
		return true;
	}
	//isNullOrEmptyObject Function (End)

	//galleryPanel Function (Start)
	function galleryPanel(images, view) {
		var template = '';
		var resizeImage = view.application.resizeImage,
			image_resize_id = SC.ENVIRONMENT.screenWidth < 768 ? 'thumbnail' : 'zoom',
			thumbImageIndex = new Array();

		template += '<div class="in-modal-image-gallery">';
		if (images.length) {
			if (images.length > 1) {
				template += '<ul class="bxslider" data-slider>';
				_.each(images, function (image) {
					template += '<li class="pinterest-image" data-zoom data-share-hover-pint-it-button="true">';
					template += '<img src="' + resizeImage(image, image_resize_id) + '" alt="' + image.altimagetext + '" itemprop="image">';
					template += '</li>';
				})
				template += '</ul>';
			} else {
				var image = images[0];
				template += '<div class="item-detailed-image pinterest-image" data-zoom data-share-hover-pint-it-button="true">';
				template += '<img class="center-block" src="' + resizeImage(image, image_resize_id) + '" alt="' + image.altimagetext + '" itemprop="image">';
				template += '</div>';
			}
		}
		template += '</div>';

		return template;
	}
	//galleryPanel Function (End)

	// @method urlIsAbsolute @param {String} url @returns {Boolean}
	function isUrlAbsolute(url) {
		return /^https?:\/\//.test(url);
	}

	var Utils = SC.Utils = {
		translate: translate,
		formatPhone: formatPhone,
		dateToString: dateToString,
		isDateValid: isDateValid,
		stringToDate: stringToDate,
		validatePhone: validatePhone,
		trim: trim,
		validateText: validateText, // 14/11/2019 Umar Zulfiqar
		validateState: validateState,
		validateZipCode: validateZipCode,
		validateSecurityCode: validateSecurityCode,
		formatCurrency: formatCurrency,
		formatQuantity: formatQuantity,
		highlightKeyword: highlightKeyword,
		getFullPathForElement: getFullPathForElement,
		collectionToString: collectionToString,
		countItems: countItems,
		addParamsToUrl: addParamsToUrl,
		parseUrlOptions: parseUrlOptions,
		objectToAtrributes: objectToAtrributes,
		isTargetActionable: isTargetActionable,
		resizeImage: resizeImage,
		hyphenate: hyphenate,
		isUrlAbsolute: isUrlAbsolute,
		getAbsoluteUrl: getAbsoluteUrl,
		getAbsoluteUrlOfNonManagedResources: getAbsoluteUrlOfNonManagedResources,
		getThemeAbsoluteUrlOfNonManagedResources: getThemeAbsoluteUrlOfNonManagedResources,
		getWindow: getWindow,
		getDownloadPdfUrl: getDownloadPdfUrl,
		doPost: doPost,
		getPathFromObject: getPathFromObject,
		setPathFromObject: setPathFromObject,
		ellipsis: ellipsis,
		reorderUrlParams: reorderUrlParams,
		getParameterByName: getParameterByName,
		isPageGenerator: isPageGenerator,
		removeScripts: removeScripts,
		minifyMarkup: minifyMarkup,
		oldIE: oldIE,
		requireModules: requireModules,
		getViewportWidth: getViewportWidth,
		getViewportHeight: getViewportHeight,
		isPhoneDevice: isPhoneDevice,
		isTabletDevice: isTabletDevice,
		isDesktopDevice: isDesktopDevice,
		isNativeDatePickerSupported: isNativeDatePickerSupported,
		selectByViewportWidth: selectByViewportWidth,
		isShoppingDomain: isShoppingDomain,
		isCheckoutDomain: isCheckoutDomain,
		isSingleDomain: isSingleDomain,
		isInShopping: isInShopping,
		isInCheckout: isInCheckout,
		resetViewportWidth: resetViewportWidth,
		getDeviceType: getDeviceType,
		initBxSlider: initBxSlider,
		getExponentialDelay: getExponentialDelay,
		imageFlatten: imageFlatten,
		deepCopy: deepCopy,
		generateUrl: generateUrl,
		getBase64Image: getBase64Image,
		getConfigurableImages: getConfigurableImages,
		addTimeToDate: addTimeToDate,
		cleanObject: cleanObject,
		getDecodedURLParameter: getDecodedURLParameter,
		deepExtend: deepExtend,
		blockMeasureField: blockMeasureField,
		bodyMeasureField: bodyMeasureField,
		designOptionMultiField: designOptionMultiField,
		designOptionSingleField: designOptionSingleField,
		requestUrl: requestUrl,
		requestUrlAsync: requestUrlAsync,
		getArrObjOrderClientList: getArrObjOrderClientList,
		isObjectExist: isObjectExist,
		addFunc: addFunc,
		resetFunc: resetFunc,
		countryOptions: countryOptions,
		cityOptions: cityOptions,
		swxMyAccountClientProfileDetails: swxMyAccountClientProfileDetails,
		ClientEditForm: ClientEditForm,
		fitProfileOptionDropdown: fitProfileOptionDropdown,
		fitProfileClientorderHistoryMacro: fitProfileClientorderHistoryMacro,
		// saveForLaterItems: saveForLaterItems, //6/20/2019 Saad
		displayInRows: displayInRows,
		itemDetailsDesignOptions: itemDetailsDesignOptions,
		displayMoreInfo: displayMoreInfo,
		setFunc: setFunc,
		profileForm: profileForm,
		measureForm: measureForm,
		measureTypeDropdown: measureTypeDropdown,
		itemTypeDropdown: itemTypeDropdown,
		suiteRestGetData: suiteRestGetData,
		fitProfileOptionDropdownShopFlow: fitProfileOptionDropdownShopFlow,
		message: message,
		getArrAllSelectedOptions: getArrAllSelectedOptions,
		getObjSelectSelectedValues: getObjSelectSelectedValues,
		getArrConflictCodesError: getArrConflictCodesError,
		getHtmlErrConflictCodes: getHtmlErrConflictCodes,
		displayModalWindow: displayModalWindow,
		isNullOrEmptyObject: isNullOrEmptyObject,
		isElementExist: isElementExist,
		galleryPanel: galleryPanel,
		getCurrencyByName: getCurrencyByName,
		isUrlAbsolute: isUrlAbsolute,
		alterationsForm: alterationsForm, //30/08/2019 Saad SAAD
		alterationsOptionDropdown: alterationsOptionDropdown, //30/08/2019 Saad SAAD
		alterationsMeasurement: alterationsMeasurement //30/08/2019 Saad SAAD

		//,	replace:replace
	};

	// We extend underscore with our utility methods
	// see http://underscorejs.org/#mixin
	_.mixin(Utils);

	return Utils;
});
