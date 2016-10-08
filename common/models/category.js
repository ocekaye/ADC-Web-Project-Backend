var Promise = require('bluebird');
module.exports = function(Category) {


	Category.remoteMethod('getContentCategorys', 
	{
		http: { path: '/findContentByCategory', verb: 'get' },
		accepts: { arg: 'ids', type: 'array', required: true, description: 'Categorys id.', http: { source: 'query' } },
		description: ['Find content by categoy'],
		returns: {arg: 'result', type: 'string', root: true}
	});

	Category.getContentCategorys = function(ids, callback){
	
		console.log('this is array = '+ids);
		datas = [];
		var filter = {fields: {id: true, data: false}};

		if(ids.length == 0) {
			callback ("not found");
			return;
		}
		var sum = 0, stop = ids.length;
		var promise = function(id){
			console.log('this id = '+id);
			return new Promise(function(resolve, reject){
				Category.findById(id, function(err, result){
					console.log(result);
					if(err) {
							reject(err);
						}
					else{
						var dataContent = {};
						dataContent.name = result.name;
						dataContent.id = result.id;
						result.content(function(err, res){
							if(err) {
								reject(err);
							}else{
								var idContent = [];
								for (var i = 0; i < res.length; i++) {
									idContent.push(res[i].contentId);
								}
								var filter = {where: {id: {inq:idContent}}, skip: 0, limit: 4, order: 'createdAt DESC', fields: {id: true, title: true, picture: true}};
								var cntn = Category.app.models.Content;
								cntn.find(filter, function(err, cnt){
									if(err) reject(err);
									else {
										dataContent.content = cnt;
										datas.push(dataContent);
										sum++;
										resolve(cnt);
									}
								});
							}
						});
						
					}
				});
			}).catch(function(err){
				console.log(err);
				sum++;
			});
		};


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

		promiseWhile(function() {
		    // Condition for stopping
		    return sum < stop;
		}, function() {
		    return promise(ids[sum]);
		}).then(function() {
		    // Notice we can chain it because it's a Promise, this will run after completion of the promiseWhile Promise!
		    callback(null, datas);
		});





		// promiseWhile(function() {
		//     // Condition for stopping
		// 	return go;
		//     // return sum < stop;
		// }, function() {
		//     // Action to run, should return a promise
		//     return prom1(ids[sum]);
		// }).then(function() {
		//     // Notice we can chain it because it's a Promise, 
		//     // this will run after completion of the promiseWhile Promise!
		//     callback(null, datas);	
		// });		
		
	};

	
};
