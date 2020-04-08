/*
	© 2015 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*exported service*/
// Artist.Service.ss
// ----------------
// Service to manage Artistes requests

function service (request)
{
	'use strict';

	var Application = require('Application');

	try
	{
		//Only can get, modify, update or delete an Artist if you are logged in
		if (session.isLoggedIn())
		{
			var method = request.getMethod()
			,	id = request.getParameter('internalid')
			//  Artist model is defined on ssp library Models.js
			,	Artist = require('Artist.Model')
			,	data = JSON.parse(request.getBody() || '{}');

			switch (method)
			{
				case 'GET':
					//If the id exist, sends the response of Artist.get(id), else sends the response of (Artist.list() || [])
					Application.sendContent(id ? Artist.get(id) : (Artist.list() || []));
				break;

				case 'PUT':
					// Pass the data to the Artist's update method and send it response
					Artist.update(id, data);
					Application.sendContent(Artist.get(id));
				break;

				case 'POST':
					//Handles the creation and send the response
					id = Artist.create(data);
					Application.sendContent(Artist.get(id), {'status': 201});
				break;

				case 'DELETE':
					// The Artist is removed and we send a JSON Obj containing {'status': 'ok'}
					Artist.remove(id);
					Application.sendContent({'status': 'ok'});
				break;

				default: 
					// methodNotAllowedError is defined in ssp library commons.js
					Application.sendError(methodNotAllowedError);
			}
		}
		else
		{
			// unauthorizedError is defined in ssp library commons.js			
			Application.sendError(unauthorizedError);
		}
	}
	catch (e)
	{
		Application.sendError(e);
	}
}