var 
	Crawler  = require("crawler"),
	$        = require('cheerio'),
	config   = require('./config.json'),
	moment   = require('moment'),
	firebase = require('firebase'),
	fb       = require('./firebaseConnector.js'),
	query    = require('cli-interact').getYesNo,
	answer   = query('Has preparado el debug?');

var log = function(obj){
    if ( config.debug ){
        console.log(obj);
    }
};

// answer
// https://www.npmjs.com/package/cli-interact
fb.getUrlList().once('value', function(data){
	log('Datos recuperados');
	var urlArray = [];

	var allValues = Object.keys(data.val()),
		totalValues = allValues.length;

	for (var i = 0; i < config.paginationCountItem; i++) {
		log(i + ' de ' + config.paginationCountItem + ' - ' + allValues[i]);
		urlArray.push({
			url : data.val()[allValues[i]].url,
			uid : allValues[i]
		});
	}

	var arrayCount = urlArray.length;

	log('Array creado. ' + urlArray.length + ' elementos.');

	var getDataCompanyFromUrl = function( url, uid ){

	    log ( (arrayCount - urlArray.length) + ' de ' + arrayCount + ' - ' + url  + ' - ' + uid  + ' - ' + moment().format('L LTS') );

		var c = new Crawler();
	    c.queue({
	    	uri       : url,
	    	jQuery    : true,
	    	forceUTF8 : true,
	        callback  : function (error, result, $) {

	            if (error) {
	                log(error);
	            }else{
	                
	                try{

						var company = {
							uid           : uid,
							url           : url,
							streetAddress : $('#ficha_iden').find('.street-address').text().trim(),
							city          : $('#ficha_iden').find('#situation_loc').text().trim(),
							description   : $('#texto_ficha').text().trim(),
							name          : $('h1').text().trim(),
							phones        : $($('#ficha_iden').find('li:contains("Telé")')[0]).text().replace('Teléfono: ','').split(';')
						};

						var cnaeText = $($('#ficha_iden').find('li:contains("CNAE")')[0]).text().replace('CNAE: ', '');
						company.cnaeCode = cnaeText.substring(0, cnaeText.indexOf(' -') );
						company.cnaeText = cnaeText.substring(cnaeText.indexOf(' - ') ).replace(' - ','');

						if ( !!$($('#texto_ficha').find('a')).attr('href') ){
							company.web = $($('#texto_ficha').find('a')).attr('href');
						}

						if ( !!company.name ){
							fb.insertCompany(company)
								.then(function(){
									fb.setCompanyRetrieved(company.uid, true)
									.then(function(){
					                	if ( urlArray.length > 1 ){
						                	
						                	urlArray.shift();
						                	
						                	setTimeout(function(){
												getDataCompanyFromUrl(urlArray[0].url,urlArray[0].uid);
						                	}, config.paginationTimeOut );

					                	}else{
					                		log('Finished!!!');
					                		process.exit(1);
					                	}	
									})									
								});
							
						}else{
							log('Error tomcat.... ' + uid + ' - ' + url);
							process.exit(1);
						}

	                }catch(err){
	                    log ('Error: ' + err);
	                }

	            }

	        }
	    });

	};

	getDataCompanyFromUrl(urlArray[0].url,urlArray[0].uid);

}, function(err){
	log(err);
});

// fb.getDataRetrieved().once('value', function(data){

//     data.forEach(function(vote) {
//         // votes.push({ ip: vote.key(), stars: vote.val() });
//         log( vote.val());
//         log( vote.key);
//         fb.setCompanyRetrieved(vote.key, null);
//     });
// });