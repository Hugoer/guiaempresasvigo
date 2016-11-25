var firebase = require("firebase-admin"),
	config   = require('./config.json');

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
		return firebase.database().ref('guiaempresas').orderByChild('retrieved').equalTo(null).limitToFirst(config.paginationCountItem);
	},
	getDataRetrieved: function(){
		return firebase.database().ref('guiaempresas').orderByChild('retrieved').equalTo(true);	
	},
	insertCompany: function(company){
		return firebase.database().ref('guiaempresasList').push(company);
	},
	setCompanyRetrieved : function(companyUid, newValue){
		// newValue = newValue || true;
		return firebase.database().ref('guiaempresas').child(companyUid).child('retrieved').set(newValue);
	}
};