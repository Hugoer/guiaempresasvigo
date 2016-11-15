var 
	Crawler  = require("crawler"),
	$        = require('cheerio'),
	config   = require('./config.json'),
	moment   = require('moment'),
	firebase = require('firebase'),
	fb       = require('./firebaseConnector.js');

var log = function(obj){
    if ( config.debug ){
        console.log(obj);
    }
};



fb.getUrlList().once('value', function(data){
	log('Datos recuperados');
	var urlArray = [];

	for (var company in data.val()) {
		log(data.val()[company].companyName);
		urlArray.push(data.val()[company].url);
	}

	var arrayCount = urlArray.length;

	log('Array creado. ' + urlArray.length + ' elementos.');

	var getDataComapnyFromUrl = function( url ){

	    log ( (arrayCount - urlArray.length) + ' de ' + arrayCount + ' - ' + url  + ' - ' + moment().format('L LTS') );

		var c = new Crawler();
	    c.queue({
	    	uri       : url,
	    	jQuery    : true,
	    	userAgent : config.userAgent,
	    	forceUTF8 : true,
	        callback  : function (error, result, $) {

	            if (error) {
	                log(error);
	            }else{
	                
	                try{

						var company = {
							streetAddress : $('#ficha_iden').find('.street-address').text().trim(),
							city          : $('#ficha_iden').find('#situation_loc').text().trim(),
							description   : $('#texto_ficha').text().trim(),
							name          : $('h1').text().trim(),
							phones		  : $($('#ficha_iden').find('li')[3]).text().replace('Teléfono: ','').split(';')
						};

						if ( !!$($('#texto_ficha').find('a')).attr('href') ){
							company.web = $($('#texto_ficha').find('a')).attr('href');
						}

						// log(company);

						fb.insertCompany(company);

	                	if ( urlArray.length > 1 ){
		                	
		                	urlArray.shift();
		                	
		                	setTimeout(function(){
								getDataComapnyFromUrl(urlArray[0]);
		                	}, Number(config.paginationTimeOut / 2) );

	                	}else{
	                		log('Finished!!!');
	                	}

	                }catch(err){
	                    log ('Error: ' + err);
	                }

	            }

	        }
	    });

	};

	getDataComapnyFromUrl( urlArray[0] );

}, function(err){
	log(err);
});