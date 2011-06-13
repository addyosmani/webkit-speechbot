var speechBrowser = function(){
	var speech, submitBtn, supported;
	
	return{
		init: function(){
			speech = $('#speechQuery'),
			submitBtn = $('#speechSubmit');
			supported = this.speechTest();
			if(!supported){
				alert('Unfortunately your browser does not support the Speech API as yet');
			}
			
			this.attachevents();
		},
		speechTest: function(){
			var element = document.createElement('input'),
				support = 'onwebkitspeechchange' in element || 'speech' in element;
				return support;
		},
		
		similar: function(a,b){
			var threshold = 10,
				similarity = this.levenshteinenator(a,b);
			
			if(similarity <= 10){ 
				return true;
				}else{
				return false;
			}
		},
		
		levenshteinenator: function(stringa,stringb) {
			
			/*based on implementation by Andrew Hedges*/
		    var cost, a, m, b, n;

		    a = stringa;
		    m = a.length;
		    b = stringb;
		    n = b.length;

		    // make sure a.length >= b.length to use O(min(n,m)) space, whatever that is
		    if (m < n) {
		        var c = a;
		        a = b;
		        b = c;
		        var o = m;
		        m = n;
		        n = o;
		    }

		    var r = new Array();
		    r[0] = new Array();
		    for (var c = 0; c < n + 1; c++) {
		        r[0][c] = c;
		    }

		    for (var i = 1; i < m + 1; i++) {
		        r[i] = new Array();
		        r[i][0] = i;
		        for (var j = 1; j < n + 1; j++) {
		            cost = (a.charAt(i - 1) == b.charAt(j - 1)) ? 0 : 1;
		            r[i][j] = this.minimator(r[i - 1][j] + 1, r[i][j - 1] + 1, r[i - 1][j - 1] + cost);
		        }
		    }

		    return r[m][n];
		},

		// return the smallest of the three values passed in
		minimator:function(x, y, z) {
		    if (x < y && x < z) return x;
		    if (y < x && y < z) return y;
		    return z;
		},
		
		prepareStage:function(){
			$('#search-results').html('');
		},
		
		loadMedia:function(type,src){
			switch(type){
				case 'image':
					$('#search-results').html("<img src='" + src + "'/>");
					break;
				case 'dictionary':
					 this.getDictionaryDefinition(src);
					break;
				}
		},
		
		getQueryStartsWith: function(needle, haystack){
			var inputPhrase = needle, 
				inputTest   = haystack.indexOf(inputPhrase),
				lenInput    = needle.length,
				lenHaystack = haystack.length,
				result		= "";
			
			if(inputTest !== -1){
				result =  haystack.slice(inputTest + lenInput, haystack.length);
				//console.log('getqueryendswith:' + result);
			}
			return result;
		},
		
		getTranslation: function(stage, input, language, mention){
			stage.html(input);
			stage.translate('en', language , function(){ 
				speechBrowser.textToSpeech(	'the ' + mention + ' translation is ' +   stage.html() );					
			});
		},
		
		query: function(val){
			//set qStr = val if you want to test without speaking.
			var qStr = speech.val() || val;
			var stage = $('#search-results');
			
			this.prepareStage();
			
			console.log(qStr);
			if(qStr !== null){
				
				var defineTest = $.trim(this.getQueryStartsWith('define',qStr)),
					searchTest = $.trim(this.getQueryStartsWith('search', qStr)),
					frenchTest = $.trim(this.getQueryStartsWith('french', qStr)),
					germanTest = $.trim(this.getQueryStartsWith('german', qStr));
					
				
				if(searchTest.length > 0){
					this.textToSpeech('i hope these results for' + searchTest + ' help ');
					stage.gSearch({search_text : searchTest ,count:4,pagination:true});
				}else if(defineTest.length >0){
					this.getDictionaryDefinition($.trim(defineTest));
				}else if(frenchTest.length >0){
					this.getTranslation(stage, qStr, 'fr', 'french');				
				}else if(germanTest.length >0){
					this.getTranslation(stage, qStr, 'de', 'german');
				}else{
	
				/*if not performing a search check for other shortcuts supported*/
				/*all of this logic is currently very dumb. we need proper NLP*/
				
				if(this.similar(qStr, 'hello')){
					console.log('hello right back at you!');
					this.textToSpeech('hello right back at you!');
				}
				else if(this.similar(qStr, 'how is the weather today') || this.similar(qStr, 'how is the weather') || this.similar(qStr, 'whats the weather like')|| this.similar(qStr, 'whats the weather like in london')){	
					$.when(this.getWeather())
									.then(function(){
									    console.log('weather done');
									});
				}
				else if(this.similar(qStr, 'what is your name')){
					console.log('my name is robot..');
					this.textToSpeech('my name is robot   what is yours?');					
				}
				else if(this.similar(qStr, 'what is your favorite movie')){
					console.log('terminator of course');
					this.textToSpeech('terminator of course.');		
					this.loadMedia('image','http://www.eurocriticsmagazine.com/wp-content/uploads/2008/06/terminator.jpg');			
				}
				
				
				}
			}
			
		},
		
		textToSpeech: function(val){

			/*currently using http://chachakawooka.com/blog/cckw-text-to-speech-api/ - I may need to arrange some sort of licensing deal if many people intend on playing with this.*/
			$('<iframe id="cckwTTS" name="cckwTTS" style="width:0px; height:0px; border: 0px" src="http://tts.chachakawooka.com/index.php?TEXT=' + val + '"></iframe>').appendTo('body');

			$('<embed id="cckw_rm" type="application/x-shockwave-flash" flashvars="audioUrl=http://tts.chachakawooka.com/mp3.php?TEXT=' + val + '&autoPlay=true" src="http://www.google.com/reader/ui/3523697345-audio-player.swf" width=”1? height=”1? quality="best"></embed>').appendTo('body');

			 $('#cckw_rm').css("height", "1px");
			 $('#cckw_rm').css("width", "1px");
			 $('#cckw_rm').css("margin-left", "-2001px");
		},
		
		getDictionaryDefinition: function(src){
		
					var word = src,
						API_BASE_URL = "http://api.wordnik.com/api/",
					    API_KEY = "fe1c5d72e1c9ab7dde3040c8e6d0ae1063c79bae6ba86a1ce";

					var url = (API_BASE_URL+"word.json/"+encodeURIComponent(word)+"/definitions?callback=?&api_key="+API_KEY);

					  $.getJSON(url, function(response){
					  	  var the_html = "<h2>Definitions for \"<span>"+word+"</span>\"</h2>";
						    the_html += "<ul>";
						    if (response.length>0) {
						      $.each(response, function(i, definition) {
									//
										if(i==0){
											/*say aloud the first result of the set*/
											speechBrowser.textToSpeech(definition.text);
										}
									//
						        if (definition.text) { the_html += "<li>"+definition.text+"</li>" };
						      });
						    } else {
						      the_html += "<li><em>No definitions!  Try a different word.</em></li>";
						    }
						    the_html += "</ul>";
							the_html += "</ul>";
						    $('#search-results').html(the_html);
					});
						
		},
		
		getWeather:function(){
			return $.Deferred(function(dfd){
				$.simpleWeather({
					location: 'london, united kingdom',
					unit: 'f',
					success: function(weather) {
						
						var result1 = 'The temperature for ' + weather.city + ' in ' + weather.country + ' is currently ' + weather.temp+ ' degrees ' + ' and i think the high will be ' + weather.high;
						var result2 = ' Todays high will be ' + weather.high+' degrees '+weather.units.temp+ " and todays low will be " + weather.low+' degrees '+ weather.units.temp;
						/*
						baaad string concat, but it's from the API docs. just leaving here for reference.
						html = '<h2>'+weather.city+', '+weather.region+' '+weather.country+'</h2>';
						html += '<p><strong>Today\'s High</strong>: '+weather.high+'&deg; '+weather.units.temp+' - <strong>Today\'s Low</strong>: '+weather.low+'&deg; '+weather.units.temp+'</p>';
						html += '<p><strong>Current Temp</strong>: '+weather.temp+'&deg; '+weather.units.temp+'</p>';
						html += '<p><strong>Condition Code</strong>: '+weather.code+'</p>';
						html += '<p><strong>Thumbnail</strong>: <img src="'+weather.thumbnail+'"></p>';
						html += '<p><strong>Wind</strong>: '+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed+' <strong>Wind Chill</strong>: '+weather.wind.chill+'</p>';
						html += '<p><strong>Currently</strong>: '+weather.currently+' - <strong>Forecast</strong>: '+weather.forecast+'</p>';
						html += '<p><img src="'+weather.image+'"></p>';
						html += '<p><strong>Humidity</strong>: '+weather.humidity+' <strong>Pressure</strong>: '+weather.pressure+' <strong>Rising</strong>: '+weather.rising+' <strong>Visibility</strong>: '+weather.visibility+'</p>';
						html += '<p><strong>Heat Index</strong>: '+weather.heatindex+'</p>';
						html += '<p><strong>Sunrise</strong>: '+weather.sunrise+' - <strong>Sunset</strong>: '+weather.sunset+'</p>';
						html += '<p><strong>Tomorrow\'s Date</strong>: '+weather.tomorrow.day+' '+weather.tomorrow.date+'<br /><strong>Tomorrow\'s High/Low</strong>: '+weather.tomorrow.high+'/'+weather.tomorrow.low+'<br /><strong>Tomorrow\'s Condition Code</strong>: '+weather.tomorrow.code+'<br /><strong>Tomorrow\'s Forecast</strong>: '+weather.tomorrow.forecast+'<br /> <strong>Tomorrow\'s Image</strong>: '+weather.tomorrow.image+'</p>';
						html += '<p><strong>Last updated</strong>: '+weather.updated+'</p>';
						html += '<p><a href="'+weather.link+'">View forecast at Yahoo! Weather</a></p>';*/

						console.log('inner result:' + result1);
						speechBrowser.textToSpeech(result1);
						//speechBrowser.textToSpeech(result2);
						dfd.resolve();
					   
					},
					error: function(error) {
					 console.log(error);
					}
				});
				
			//
		}).promise();
		},
		
		attachevents: function(){
			submitBtn.bind('click', function(){
				//whatever execution logic.
			});
		}	
	}

}();

$(function($) {
    speechBrowser.init();
    //speechBrowser.query('french house');
});


