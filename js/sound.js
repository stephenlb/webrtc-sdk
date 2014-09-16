/* Hey, let's be friends! http://twitter.com/pubnub */
// -----------------------------------------------------------------------
// SOUNDS
// -----------------------------------------------------------------------
var sounds = (function(){
    var soundbank = {}
    ,   p         = PUBNUB;

    function stop(audio) {
        if (!audio) return;
        audio.pause();
        reset(audio);
    }

    function reset(audio) {
        try       { audio.currentTime = 0.0 }
        catch (e) { }
    }

    return {
        play : function( sound, duration ) {
            var audio = soundbank[sound] || (function(){
                var audio = soundbank[sound] = p.create('audio');

                p.css(  audio, { display : 'none' } );
                p.attr( audio, 'prelaod',  'auto' );
                p.attr( audio, 'autoplay', 'true' );

                audio.innerHTML = p.supplant(
                    "<source src={file}.ogg><source src={file}.mp3>",
                    { file : sound }
                );

                p.search('body')[0].appendChild(audio);

                return audio;
            })();

            stop(audio);
            audio.load();
            audio.play();

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
            p.each( soundbank, function( _, audio ) {
                stop(audio);
            } );
        }
    };
})();
