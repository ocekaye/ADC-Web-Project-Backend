module.exports = function(Account) {
	Account.disableRemoteMethod('__count__accessTokens', false);
	Account.disableRemoteMethod('__create__accessTokens', false);
	Account.disableRemoteMethod('__delete__accessTokens', false);
	Account.disableRemoteMethod('__destroyById__accessTokens', false);
	Account.disableRemoteMethod('__findById__accessTokens', false);
	Account.disableRemoteMethod('__get__accessTokens', false);
	Account.disableRemoteMethod('__updateById__accessTokens', false);
};
