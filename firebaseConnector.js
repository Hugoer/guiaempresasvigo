var firebase = require("firebase-admin");

firebase.initializeApp({
	credential: firebase.credential.cert('./empresasvigo-90094-firebase-adminsdk-1db9j-0b30b6641f.json'),
	databaseURL: "https://empresasvigo-90094.firebaseio.com"
});



module.exports = {
	insertUrl: function(url,name){
		firebase.database().ref('guiaempresas').push({
			'url'         : url,
			'companyName' : name
		});
	},
	getUrlList: function(){
		return firebase.database().ref('guiaempresas');
	}, 
	insertCompany: function(company){
		return firebase.database().ref('guiaempresasList').push(company);
	}
};