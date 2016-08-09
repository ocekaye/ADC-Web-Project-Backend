module.exports = function(CategoryTerm) {
	
	CategoryTerm.getDetail = function(ids, callback){
		var ctg = CategoryTerm.app.models.Category;
		var filter = {"where":{"id": {"inq": ids}}};
		ctg.find(filter, function(err, result){
			if(err) callback(err);
			else callback(null, result);
		});
	};

};
