module.exports = function(Content) {
	var helpers = require('utils');
	Content.disableRemoteMethod('create', true);               
	Content.disableRemoteMethod('upsert', true);               
	Content.disableRemoteMethod('deleteById', true);    
	Content.disableRemoteMethod('updateAll', true);    
	Content.disableRemoteMethod('updateAttributes', false);  
	Content.disableRemoteMethod('createChangeStream', true);
	Content.disableRemoteMethod('find', true);
	Content.disableRemoteMethod('findById', true);
	Content.disableRemoteMethod('findOne', true);
	Content.disableRemoteMethod('exists', true);

	Content.remoteMethod('new',
	{
		http: { path: '/new', verb: 'post' },

		accepts: [
			{ arg: 'title', type: 'string', required: true},
			{ arg: 'description', type: 'string'},
			{ arg: 'picture', type: 'string'},
			{ arg: 'data', type: 'array', required: true},
			{ arg: 'category', type: 'array', http: { source: 'query' }},
			{ arg: 'tag', type: 'array', http: { source: 'query' }},
		],
		description: [
			'Insert new content.'
		],
		
		returns:{ arg: 'result', type: 'string', 'root': true }
		
	});

	Content.new = function(title, description, picture, data, category, tag, callback){
		var accessToken = helpers.account.get();
		var res = {"accountId":accessToken.userId, "title":title, "description":description, "picture":picture, "data":data};
		Content.create(res, function(err, result){
			if(err) callback(err);
			else callback(null, result);
		});
		
	};

	Content.remoteMethod('edit',
	{
		http: { path: '/:id/edit', verb: 'post' },

		accepts: [
			{ arg: 'id', type: 'string', required: true, description: 'Content id.'},
			{ arg: 'title', type: 'string', required: true},
			{ arg: 'description', type: 'string'},
			{ arg: 'picture', type: 'string'},
			{ arg: 'data', type: 'string', required: true}
		],
		description: ['Edit Content.'],
		
		returns:{ arg: 'result', type: 'string', root: true }
		
	});

	Content.edit = function(id, title, description, picture, data, callback){
		var accessToken = helpers.account.get();
		var account = Content.app.models.Account;
		var dataObject = {"id":id,"accountId":accessToken.userId, "title":title, "description":description, "picture":picture, "data":data};
		var prom = new Promise(function(resolve, reject){
			Content.findById(id, function(err, res){
				if(err)reject(err);
				else {
					accountId = res.accountId;
					var accessToken = helpers.account.get();
					if(""+res.accountId !== ""+accessToken.userId)reject("Authorization Required");
					else resolve("yes");
				}
			});
		}).then(function(value){
			Content.upsert(dataObject, function(err, res){
				if (err) callback(err);
				else callback(null, res);
			});
		}).catch(function(err){
			callback(err);
		});
	};

	Content.remoteMethod('findContent',
	{
		http: {path: '/:id/find', verb: 'get'},
		accepts: {arg: 'id', type:'string', required: true, description: 'Content id.'},
		description: ['Find content by id.'],
		returns: {arg: 'result', type: 'string', root: true}
	});
	
	Content.findContent = function(id, callback){
		var ctg = Content.app.models.CategoryTerm;
		var filter = {include: ['owner']};
		
		Content.findById(id, filter, function(err, result){
			if(err) callback(err)
			else {
				var fltr = {"contentId": result.id};
				new Promise(function(resolve, reject){
					ctg.find(fltr, function(err, res){
						if(err) reject(err);
						else{
							var ids = [];
							for(var i = 0; i < res.length; i++){
								ids.push(res[i].categoryId);
							}
							resolve(ids);
						}
					});
				}).then(function(res){
					console.log(res);
					ctg.getDetail(res, function(err, data){
						if(err) reject(err)
						else {
							console.log(data);
							result.categories = data;
							callback(null, result);
						}
					})
				}).catch(function(err){
					callback(err)
				});
				
				
			}
		});
	};

};
