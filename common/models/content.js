var Promise = require('bluebird');

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
			{ arg: 'content-description', type: 'string'},
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

	Content.new = function(title, description, content_description, picture, data, category, tag, callback){
		var accessToken = helpers.account.get();
		var res = {"accountId":accessToken.userId, "title":title, "description":description, "content_description":content_description, "picture":picture, "data":data};
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
			{ arg: 'content-description', type: 'string'},
			{ arg: 'picture', type: 'string'},
			{ arg: 'data', type: 'string', required: true}
		],
		description: ['Edit Content.'],
		
		returns:{ arg: 'result', type: 'string', root: true }
		
	});

	Content.edit = function(id, title, description, content_description, picture, data, callback){
		var accessToken = helpers.account.get();
		var account = Content.app.models.Account;
		var dataObject = {"id":id,"accountId":accessToken.userId, "title":title, "description":description, "content_description":content_description, "picture":picture, "data":data};
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
		var ctgT = Content.app.models.CategoryTerm;
		var ctg = Content.app.models.Category;
		var filter = {include: ['owner']};
		
		Content.findById(id, filter, function(err, result){
			if(err) callback(err)
			else {
				new Promise(function(resolve, reject){
					console.log(id);
					ctgT.find({"where":{"contentId":id}}, function(err , category){
						if(err) reject(err);
						else{
							// console.log(category);
							resolve(category);
						} 
					});
				}).then(function(category){
					var idCategorys = [];
					for (var i = 0; i < category.length; i++ ){
						idCategorys.push(category[i].categoryId);
					}
					return idCategorys;
				}).then(function(idCategorys){
					// console.log(idCategorys);
					var filter = {"where": {"id":{"inq":idCategorys}}};
					ctg.find(filter, function(err, res){
						if(err) reject(err);
						else{
							result.categorys = res;
							callback(null, result);
						} 
					});
				});				
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
		var ctgT = Content.app.models.CategoryTerm;
		var ctg = Content.app.models.Category;
		if (!offset) offset = 0;
		if (!limit) limit = 10;
		var filter = {include: ['owner'], skip: offset, limit: limit, order: 'createdAt DESC'};
		
		Content.find(filter, function(err, result){
			if(err) callback(err)
			else {
				data = [];
				var sum = 0, stop =  result.length;
				console.log("length = "+stop);
				var prom1 = function(content){
					return new Promise(function(resolve, reject){
						ctgT.find({"where":{"contentId":content.id}}, function(err , category){
							if(err) reject(err);
							else{
								// console.log(category);
								resolve(category);
							} 
						});
					}).then(function(category){
						var idCategorys = [];
						for (var i = 0; i < category.length; i++ ){
							idCategorys.push(category[i].categoryId);
						}
						return idCategorys;
					}).then(function(idCategorys){
						// console.log(idCategorys);

						var filter = {"where": {"id":{"inq":idCategorys}}};
						ctg.find(filter, function(err, res){
							if(err) reject(err);
							else{
								content.categorys = res;
								console.log("in "+content.title);
								data.push(content);
								return res;
							} 
						});
					}).then(function(res){
						console.log("after in");
						sum++;
						if (sum < stop) {
							go = true;
						} else go = false;
					}).catch(function(err){
						// sum++;
					});		
				}
				var promiseWhile = function(condition, action) {
				    var resolver = Promise.defer();

				    var loop = function() {
				        if (!condition()) return resolver.resolve();
				        return Promise.cast(action())
				            .then(loop)
				            .catch(resolver.reject);
				    };

				    process.nextTick(loop);

				    return resolver.promise;
				};	

				var go = true;

				promiseWhile(function() {
				    // Condition for stopping
					return go;
				    // return sum < stop;
				}, function() {
				    // Action to run, should return a promise

				    console.log(result[sum].title);
				    return prom1(result[sum]);
				}).then(function() {
				    // Notice we can chain it because it's a Promise, 
				    // this will run after completion of the promiseWhile Promise!
				    console.log(data.length);
				    callback(null, data);	
				});		
			}
		});
	};



};
