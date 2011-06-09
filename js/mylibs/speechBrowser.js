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
		
		query: function(val){
			var qStr = speech.val();
			console.log(qStr);
			if(qStr !== null){
				
				console.log(this.similar(qStr,'hello world how are you'));
				
				/*detect if the user is attempting to search for something*/
				var searchPhrase="search",searchTest = qStr.indexOf(searchPhrase);
				if(searchTest !== -1){
					console.log('you tried a search');
					/*now let's get everything after search*/
					var searchQuery = qStr.slice(searchTest+searchPhrase.length, qStr.length);
					console.log('you searched for:' + searchQuery);
					
				}else{
				
				/*if not performing a search check for other shortcuts supported*/
				switch(qStr){
					case 'hello':
						console.log('hello right back at you!');
						this.textToSpeech('hello right back at you!');
						break;
					case 'how is the weather today':
						console.log('taking you to weather..');
						this.textToSpeech('the weather is cold today');
						break;
					case 'I need some sleep':
						console.log("i dont think you need any sleep");
						this.textToSpeech('i dont think you need any sleep');
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
		
		attachevents: function(){
			submitBtn.bind('click', function(){
				//whatever execution logic.
			});
		}	
	}

}();

$(function($) {
    speechBrowser.init();
});


