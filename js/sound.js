/* Hey, let's be friends! http://twitter.com/pubnub */
// -----------------------------------------------------------------------
// SOUNDS
// -----------------------------------------------------------------------
var sounds = (function(){
    var soundbank = {};

    function stop(audio) {
        if (!audio) return;
        //audio.pause();
        //reset(audio);
    }

    function reset(audio) {
        try       { audio.currentTime = 0.0 }
        catch (e) { }
    }

    return {
        play : function( sound, duration ) {
            var audio = soundbank[sound] || (function(){
                var audio = soundbank[sound]=document.createElement('audio');

                audio.setAttribute( 'style',    'display:none' );
                audio.setAttribute( 'prelaod',  'auto' );
                audio.setAttribute( 'autoplay', 'true' );

                audio.innerHTML = "<source src="      + sound +
                                  ".ogg><source src=" + sound +
                                  ".mp3>";

                document.getElementsByTagName('body')[0].appendChild(audio);

                return audio;
            })();

            setTimeout( () => {
                stop(audio);
                //audio.load();
                try { audio.play() } catch(e) {}
            }, 10 );

            // Play a Set Portion of Audio
            clearTimeout(audio.timer);
            if (duration) audio.timer = setTimeout( function() {
                stop(audio);
            }, duration );
        },
        stop : function(sound) {
            stop(soundbank[sound]);
        },
        stopAll : function() {
            soundbank.forEach(function(audio){
                stop(audio);
            });
        }
    };
})();
