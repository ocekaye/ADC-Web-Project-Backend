module.exports = function(WebDetail) {
var loopback = require('loopback');
	WebDetail.remoteMethod(
		'getIdByToken',
		{
			
			http: { path: '/getIdByToken', verb: 'get' },
			returns:{ arg: 'message', type: 'string' }
		});

		WebDetail.getIdByToken = function(callback){
			var ctx = loopback.getCurrentContext();
			  // Get the current access token
			  var accessToken = ctx.get('accessToken');
			  callback(null, accessToken);
		};

};
