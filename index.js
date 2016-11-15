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

var createUrlsArray = function(){

	var urlArrayTmp = [],
		urlText = '';

	for (var i = 1; i <= config.paginationCount ; i++) {
		urlText = config.initialUrl + '' + i;
		log(urlText);
		urlArrayTmp.push(urlText);
	}
	
	return urlArrayTmp;

};

var urlArray = createUrlsArray();

var getDataFromUrl = function( url ){

    log ( (config.paginationCount - urlArray.length) + ' de ' + config.paginationCount + ' - ' + url  + ' - ' + moment().format('L LTS') );

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

					var $companies = $('.ranking_einf').find('a'),
						$company = {};

					for (var i = 0; i < $companies.length; i++) {
						$company = $($companies[i]);
						fb.insertUrl( config.mainURl + $company.attr('href'), $company.text() );
					}

                	if ( urlArray.length > 1 ){
	                	
	                	urlArray.shift();
	                	
	                	setTimeout(function(){
							getDataFromUrl(urlArray[0]);
	                	}, config.paginationTimeOut );

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

getDataFromUrl( urlArray[0] );