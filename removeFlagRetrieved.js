var 
	config   = require('./config.json'),
	firebase = require('firebase'),
	fb       = require('./firebaseConnector.js');

var log = function(obj){
    if ( config.debug ){
        console.log(obj);
    }
};

fb.getDataRetrieved().once('value', function(data){
	console.log('query finalizada');
    data.forEach(function(vote) {
        // votes.push({ ip: vote.key(), stars: vote.val() });
        // log( vote.val());
        log( vote.key);
        fb.setCompanyRetrieved(vote.key, null);
    });
    process.exit(1);
});