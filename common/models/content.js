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

	Content.remoteMethod('delete',
	{
		http: { path: '/:id/delete', verb: 'delete' },

		accepts: [
			{ arg: 'id', type: 'string', required: true}
		],
		description: [
			'Delete content.'
		],
		
		returns:{ arg: 'result', type: 'string', 'root': true }
		
	});

	Content.delete = function(id, callback){
		var accessToken = helpers.account.get();
		Content.findContent(id, function(err, result){
			if(err) callback(err);
			else {
				new Promise(function(resolve, reject){
					result.owner(function(err, owner){
						if(err) reject(err);
						else{
							resolve(owner);
						} 
					});
				}).then(function(owner){
					if(""+accessToken.userId === ""+owner.id){
						Content.deleteById(id, function(err, res){
							if(err) reject(err);
							else {
								callback(null, res);
							}
						});
					}
					else {
						var error = new Error();
						error.status = 401;
						error.message = 'Authorization Required';
						error.code = 'AUTHORIZATION_REQUIRED';
						callback(error);
					}
				}).catch(function(err){
					callback(err)
				});
			}
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
		var filter = {include: ['owner', 'category']};
		
		Content.findById(id, filter, function(err, result){
			if(err) callback(err)
			else {
				callback(null, result);
				// var fltr = {"contentId": result.id};
				// new Promise(function(resolve, reject){
				// 	ctg.find(fltr, function(err, res){
				// 		if(err) reject(err);
				// 		else{
				// 			var ids = [];
				// 			for(var i = 0; i < res.length; i++){
				// 				ids.push(res[i].categoryId);
				// 			}
				// 			resolve(ids);
				// 		}
				// 	});
				// }).then(function(res){
				// 	console.log(res);
				// 	ctg.getDetail(res, function(err, data){
				// 		if(err) reject(err)
				// 		else {
				// 			// console.log(data);
				// 			result.categories = data;
				// 			callback(null, result);
				// 		}
				// 	})
				// }).catch(function(err){
				// 	callback(err)
				// });
				
				
			}
		});
	};

	Content.remoteMethod('show',
	{
		http: {path: '/find', verb: 'get'},
		accepts: [
			{arg: 'offset', type:'string', description: 'offset.'},
			{arg: 'limit', type:'string', description: 'limit.'}
		],
		description: ['Find content'],
		returns: {arg: 'result', type: 'string', root: true}
	});

	Content.show = function(offset, limit, callback){
		var ctg = Content.app.models.CategoryTerm;
		if (!offset) offset = 0;
		if (!limit) limit = 6;
		var filter = {include: ['owner', 'category'], skip: offset, limit: limit};
		
		Content.find(filter, function(err, result){
			if(err) callback(err)
			else {
				var promises = [];
				var data;
				var prom1 = new Promise(function(resolve, reject){
					ctg.find(fltr, function(err, res){
						if(err) reject(err);
						else{
							var ids = [];
							for(var j = 0; j < res.length; j++){
								ids.push(res[j].categoryId);
							}
							resolve(ids);
						}
					});
				}).then(function(res){

				});
				callback(null, result);
				// var dataResult = [];
				// var prom = [];
				// for (var i = 0; i < result.length; i++) {		
				// 	new Promise(function(resolveParrent, rejectParrent){
				// 		var loop = i;
				// 		var current = result[loop];
				// 		var fltr = {"contentId": current.id};
						
				// 		new Promise(function(resolve, reject){							
				// 			ctg.find(fltr, function(err, res){
				// 				if(err) reject(err);
				// 				else{
				// 					var ids = [];
				// 					for(var j = 0; j < res.length; j++){
				// 						ids.push(res[j].categoryId);
				// 					}
				// 					resolve(ids);
				// 				}
				// 			});
				// 		}).then(function(res){
				// 			// console.log(res);
				// 			ctg.getDetail(res, function(err, data){
				// 				if(err) reject(err)
				// 				else {
				// 					console.log("a = "+loop);
				// 					console.log(data);
				// 					current.categories = data;
				// 					dataResult.push(current);
				// 					resolveParrent(loop);
				// 				}
				// 			})
				// 		}).catch(function(err){
				// 			callback(err)
				// 		});
				// 	}).then(function(loop){
				// 		console.log("b = "+loop);
				// 		if(loop == result.length-1) callback(null, dataResult);
				// 			// console.log(dataResult);
				// 	}).catch(function(err){
				// 		callback(err)
				// 	});
				// }
				
			}
		});
	};



};
