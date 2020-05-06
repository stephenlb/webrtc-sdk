(function(){


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// WebRTC Simple Calling API + Mobile
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var PHONE = window.PHONE = function(config) {

    var defaultmedia  = { media : {
        audio : {},
        video : { facingMode : "user" }
    } };
    var config        = merge( defaultmedia, config || {} );
    var PHONE         = function(){};
    var pubnub        = PUBNUB(config);
    var pubkey        = config.publish_key   || 'demo';
    var snapper       = function(){ return ' ' }
    var subkey        = config.subscribe_key || 'demo';
    var autocam       = config.autocam !== false;
    var sessionid     = PUBNUB.uuid();
    var mystream      = null;
    var myvideo       = document.createElement('video');
    var myconnection  = false;
    var mediaconf     = config.media;
    var conversations = {};

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // RTC Peer Connection Session (one per call)
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    var PeerConnection =
        window.RTCPeerConnection    ||
        window.mozRTCPeerConnection ||
        window.webkitRTCPeerConnection;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // ICE (many route options per call)
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    var IceCandidate =
        window.mozRTCIceCandidate ||
        window.RTCIceCandidate;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Media Session Description (offer and answer per call)
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    var SessionDescription =
        window.RTCSessionDescription    ||
        window.mozRTCSessionDescription ||
        window.webkitRTCSessionDescription;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Local Microphone and Camera Media (one per device)
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    navigator.getUserMedia = 
        navigator.getUserMedia       ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia    ||
        navigator.msGetUserMedia;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // STUN Server List Configuration (public STUN list)
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    var rtcconfig = { iceServers : [{ "urls" :
        navigator.mozGetUserMedia    ? "stun:stun.services.mozilla.com" :
        navigator.webkitGetUserMedia ? "stun:stun.l.google.com:19302"   :
                                       "stun:23.21.150.121"
    },
        //{urls: "stun:stun.l.google.com:19302"},
        {urls: "stun:stun1.l.google.com:19302"},
        {urls: "stun:stun2.l.google.com:19302"},
        {urls: "stun:stun3.l.google.com:19302"},
        //{urls: "stun:stun4.l.google.com:19302"},
        //{urls: "stun:23.21.150.121"},
        //{urls: "stun:stun01.sipphone.com"},
        //{urls: "stun:stun.ekiga.net"},
        //{urls: "stun:stun.fwdnet.net"},
        //{urls: "stun:stun.ideasip.com"},
        //{urls: "stun:stun.iptel.org"},
        //{urls: "stun:stun.rixtelecom.se"},
        //{urls: "stun:stun.schlund.de"},
        //{urls: "stun:stunserver.org"},
        //{urls: "stun:stun.softjoys.com"},
        //{urls: "stun:stun.voiparound.com"},
        //{urls: "stun:stun.voipbuster.com"},
        //{urls: "stun:stun.voipstunt.com"},
        //{urls: "stun:stun.voxgratia.org"},
        //{urls: "stun:stun.xten.com"}
    ] };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Custom STUN Options
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function add_servers(servers) {
        if (servers.constructor === Array)
            [].unshift.apply(rtcconfig.iceServers, servers);
        else rtcconfig.iceServers.unshift(servers);
    }

    if ('servers' in config) add_servers(config.servers);

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // PHONE Events
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    var messagecb    = function(){};
    var readycb      = function(){};
    var unablecb     = function(){};
    var debugcb      = function(){};
    var connectcb    = function(){};
    var disconnectcb = function(){};
    var reconnectcb  = function(){};
    var callstatuscb = function(){};
    var receivercb   = function(){};

    PHONE.message    = function(cb) { messagecb    = cb };
    PHONE.ready      = function(cb) { readycb      = cb };
    PHONE.unable     = function(cb) { unablecb     = cb };
    PHONE.callstatus = function(cb) { callstatuscb = cb };
    PHONE.debug      = function(cb) { debugcb      = cb };
    PHONE.connect    = function(cb) { connectcb    = cb };
    PHONE.disconnect = function(cb) { disconnectcb = cb };
    PHONE.reconnect  = function(cb) { reconnectcb  = cb };
    PHONE.receive    = function(cb) { receivercb   = cb };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Add/Get Conversation - Creates a new PC or Returns Existing PC
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function get_conversation(number) {
        var talk = conversations[number] || (function(number){
            var talk = {
                number  : number,
                status  : '',
                image   : document.createElement('img'),
                started : +new Date,
                imgset  : false,
                imgsent : 0,
                pc      : new PeerConnection(rtcconfig),
                closed  : false,
                usermsg : function(){},
                thumb   : null,
                connect : function(){},
                end     : function(){}
            };

            // Setup Event Methods
            talk.pc.ontrack        = config.ontrack || function(event) { onaddstream( number, event ) };
            talk.pc.onicecandidate = function(event) { onicecandidate( number, event ) };
            talk.pc.number         = number;

            // Disconnect and Hangup
            talk.hangup = function(signal) {
                if (talk.closed) return;

                talk.closed = true;
                talk.imgset = false;
                clearInterval(talk.snapi);

                if (signal !== false) transmit( number, { hangup : true } );

                talk.end(talk);
                talk.pc.close();
                close_conversation(number);
            };
            
            // Stop Audio/Video Stream
            talk.stop = function() {
                if (mystream) mystream.stop();
                return mystream;
            };

            // Sending Messages
            talk.send = function(message) {
                transmit( number, { usermsg : message } );
            };

            // Sending Stanpshots
            talk.snap = function() {
                var pic = snapper();
                if (talk.closed) clearInterval(talk.snapi);
                transmit( number, { thumbnail : pic } );
                var img = document.createElement('img');
                img.src = pic;
                return { data : pic, image : img };
            };
            talk.snapi = setInterval( function() {
                if (talk.imgsent++ > 1) return clearInterval(talk.snapi);
                talk.snap();
            }, 1500 );
            talk.snap();

            // Nice Accessor to Update Disconnect & Establis CBs
            talk.thumbnail = function(cb) {talk.thumb   = cb; return talk};
            talk.ended     = function(cb) {talk.end     = cb; return talk};
            talk.connected = function(cb) {talk.connect = cb; return talk};
            talk.message   = function(cb) {talk.usermsg = cb; return talk};

            // Add Local Media Streams Audio Video Mic Camera
            if (mystream) mystream.getTracks().forEach(
                track => talk.pc.addTrack( track, mystream )
            );

            // Notify of Call Status
            update_conversation( talk, 'connecting' );

            // Return Brand New Talk Reference
            conversations[number] = talk;
            return talk;
        })(number);

        // Return Existing or New Reference to Caller
        return talk;
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Remove Conversation
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function close_conversation(number) {
        conversations[number] = null;
        delete conversations[number];
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Notify of Call Status Events
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function update_conversation( talk, status ) {
        talk.status = status;
        callstatuscb(talk);
        return talk;
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Get Number
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.number = function() {
        return config.number;
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Get Call History
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.history = function(settings) {
        pubnub.history({
            channel  : settings[number],
            callback : function(call_history) {
                settings['history'](call_history[0]);
            }
        })
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Make Call - Create new PeerConnection
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.dial = function(number, servers) {
        if (!!servers) add_servers(servers);
        var talk = get_conversation(number);
        var pc   = talk.pc;

        // Prevent Repeat Calls
        if (talk.dialed) return false;
        talk.dialed = true;

        // Send SDP Offer (Call)
        pc.createOffer().then( offer => {
            transmit( number, { hangup : true } );
            transmit( number, offer, 2 );
            pc.setLocalDescription( offer, debugcb, debugcb );
        } ).catch(debugcb);

        // Return Session Reference
        return talk;
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Send Image Snap - Send Image Snap to All Calls or a Specific Call
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.snap = function( message, number ) {
        if (number) return get_conversation(number).snap(message);
        var pic = {};
        PUBNUB.each( conversations, function( number, talk ) {
            pic = talk.snap();
        } );
        return pic;
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Send Message - Send Message to All Calls or a Specific Call
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.send = function( message, number ) {
        if (number) return get_conversation(number).send(message);
        PUBNUB.each( conversations, function( number, talk ) {
            talk.send(message);
        } );
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // End Call - Close All Calls or a Specific Call
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.hangup = function(number) {
        if (number) return get_conversation(number).hangup();
        PUBNUB.each( conversations, function( number, talk ) {
            talk.hangup();
        } );
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Auto-hangup on Leave
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PUBNUB.bind( 'unload,beforeunload', window, function() {
        if (PHONE.goodbye) return true;
        PHONE.goodbye = true;

        PUBNUB.each( conversations, function( number, talk ) {
            var mynumber = config.number;
            var packet   = { hangup:true };
            var message  = { packet:packet, id:sessionid, number:mynumber };
            var client   = new XMLHttpRequest();
            var url      = 'https://pubsub.pubnub.com/publish/'
                           + pubkey + '/'
                           + subkey + '/0/'
                           + number + '/0/'
                           + JSON.stringify(message);

            client.open( 'GET', url, false );
            client.send();
            talk.hangup();
        } );

        return true;
    } );

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Grab Local Video Snapshot
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function snapshots_setup(stream) {
        var video   = myvideo;
        var canvas  = document.createElement('canvas');
        var context = canvas.getContext("2d");
        var snap    = { width: 240, height: 180 };

        // Video Settings
        video.width     = snap.width;
        video.height    = snap.height;
        video.srcObject = stream;
        video.volume    = 0.0;
        video.play();

        // Canvas Settings
        canvas.width  = snap.width;
        canvas.height = snap.height;

        // Capture Local Pic
        snapper = function() {
            try {
                context.drawImage( video, 0, 0, snap.width, snap.height );
            } catch(e) {}
            return canvas.toDataURL( 'image/jpeg', 0.30 );
        };

        PHONE.video = video;
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Visually Display New Stream
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function onaddstream( number, obj ) {
        var vid    = document.createElement('video');
        var talk   = get_conversation(number);

        vid.setAttribute( 'autoplay',    'autoplay'    );
        vid.setAttribute( 'playsinline', 'playsinline' );
        vid.srcObject = obj.streams[0];

        talk.video = vid;
        talk.connect(talk);
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // On ICE Route Candidate Discovery
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function onicecandidate( number, event ) {
        //console.log( "ONICECANDIDATE:", number, event );
        if (!event.candidate) return;
        transmit( number, event.candidate );
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Listen For New Incoming Calls
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function subscribe() {
        pubnub.subscribe({
            restore    : true,
            channel    : ''+config.number,
            message    : receive,
            disconnect : disconnectcb,
            reconnect  : reconnectcb,
            connect    : function() { onready(true) }
        });
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // When Ready to Receive Calls
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function onready(subscribed) {
        if (subscribed) myconnection = true;
        if (myconnection && autocam) readycb();
        if (!(mystream && myconnection)) return;

        connectcb();
        if (!autocam) readycb();
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Prepare Local Media Camera and Mic
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function startcamera(cb) {
        navigator.mediaDevices.getUserMedia(mediaconf).then(function(stream) {
            if (!stream) return unablecb(stream);
            mystream = stream;
            snapshots_setup(stream);
            cb&&cb()
            if (autocam) startsubscribe();
        }, function(info) {
            debugcb(info);
            return unablecb(info);
        } );
    }
    
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Initiate Dialing Socket
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function startsubscribe() {
        onready();
        subscribe();
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Send SDP Call Offers/Answers and ICE Candidates to Peer
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function transmit( phone, packet, times, time ) {
        //console.log( "transmit:", phone, packet );
        if (!packet) return;
        var number  = ''+config.number;
        var message = { packet : packet, id : sessionid, number : number };
        debugcb(message);
        pubnub.publish({ channel : phone, message : message });

        // Recurse if Requested for
        if (!times) return;
        time = time || 1;
        if (time++ >= times) return;
        setTimeout( function(){
            transmit( phone, packet, times, time );
        }, 150 );
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // SDP Offers & ICE Candidates Receivable Processing
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function receive(message) {
        // Debug Callback of Data to Watch
        debugcb(message);

        // Get Call Reference
        var talk = get_conversation(message.number);

        // Ignore if Closed
        if (talk.closed) return;

        // User Message
        if (message.packet.usermsg) {
            messagecb( talk, message.packet.usermsg );
            return talk.usermsg( talk, message.packet.usermsg );
        }

        // Thumbnail Preview Image
        if (message.packet.thumbnail) return create_thumbnail(message);

        // If Hangup Request
        if (message.packet.hangup) return talk.hangup(false);

        // If Peer Calling Inbound (Incoming)
        if ( message.packet.sdp && !talk.received ) {
            talk.received = true;
            receivercb(talk);
        }

        // Update Peer Connection with SDP Offer or ICE Routes
        if (message.packet.sdp) add_sdp_offer(message);
        else                    add_ice_route(message);
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Create Remote Friend Thumbnail
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function create_thumbnail(message) {
        var talk       = get_conversation(message.number);
        talk.image.src = message.packet.thumbnail;

        // Call only once
        if (!talk.thumb) return;
        if (!talk.imgset) talk.thumb(talk);
        talk.imgset = true;
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Add SDP Offer/Answers
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function add_sdp_offer(message) {
        // Get Call Reference
        var talk = get_conversation(message.number);
        var pc   = talk.pc;
        var type = message.packet.type == 'offer' ? 'offer' : 'answer';

        // Deduplicate SDP Offerings/Answers
        if (type in talk) return;
        talk[type]  = true;
        talk.dialed = true;

        // Notify of Call Status
        update_conversation( talk, 'routing' );

        // Add SDP Offer/Answer
        pc.setRemoteDescription(
            new SessionDescription(message.packet), function() {
                // Set Connected Status
                update_conversation( talk, 'connected' );

                // Call Online and Ready
                if (pc.remoteDescription.type != 'offer') return;

                // Create Answer to Call
                pc.createAnswer( function(answer) {
                    pc.setLocalDescription( answer, debugcb, debugcb );
                    transmit( message.number, answer, 2 );
                }, debugcb );
            }, debugcb
        );
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Add ICE Candidate Routes
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function add_ice_route(message) {
        // Leave if Non-good ICE Packet
        if (!message.packet)           return;
        if (!message.packet.candidate) return;

        // Get Call Reference
        var talk = get_conversation(message.number);
        var pc   = talk.pc;

        // Add ICE Candidate Routes
        pc.addIceCandidate(
            new IceCandidate(message.packet),
            debugcb,
            debugcb
        );
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Merge Two Objects
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function merge( target, add ) {
	function isObject(obj) {
	    if (typeof obj == "object") {
		for (var key in obj) {
		    if (obj.hasOwnProperty(key)) {
			return true; // search for first object prop
		    }
		}
	    }
	    return false;
	}
	for (var key in add) {
	    if (add.hasOwnProperty(key)) {
		if (target[key] && isObject(target[key]) && isObject(add[key])) {
		    merge(target[key], add[key]);
		} else {
		    target[key] = add[key];
		}
	    }
	}
	return target;
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Main - Request Camera and Mic
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.startcamera = startcamera;
    if (autocam) startcamera();
    else         startsubscribe();

    return PHONE;
};


})();
