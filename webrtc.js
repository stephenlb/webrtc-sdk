(function(){


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// WebRTC Peer Connection
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var PHONE = window.PHONE = function(config) {
    var PHONE         = function(){};
    var pubnub        = PUBNUB(config);
    var sessionid     = PUBNUB.uuid();
    var mystream      = null;
    var mediaconf     = { audio : true, video : true };
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
    var rtcconfig = { iceServers : [{ "url" :
        navigator.mozGetUserMedia    ? "stun:stun.services.mozilla.com" :
        navigator.webkitGetUserMedia ? "stun:stun.l.google.com:19302"   :
                                       "stun:23.21.150.121"
    },
        {url: "stun:stun.l.google.com:19302"},
        {url: "stun:stun1.l.google.com:19302"},
        {url: "stun:stun2.l.google.com:19302"},
        {url: "stun:stun3.l.google.com:19302"},
        {url: "stun:stun4.l.google.com:19302"},
        {url: "stun:23.21.150.121"},
        {url: "stun:stun01.sipphone.com"},
        {url: "stun:stun.ekiga.net"},
        {url: "stun:stun.fwdnet.net"},
        {url: "stun:stun.ideasip.com"},
        {url: "stun:stun.iptel.org"},
        {url: "stun:stun.rixtelecom.se"},
        {url: "stun:stun.schlund.de"},
        {url: "stun:stunserver.org"},
        {url: "stun:stun.softjoys.com"},
        {url: "stun:stun.voiparound.com"},
        {url: "stun:stun.voipbuster.com"},
        {url: "stun:stun.voipstunt.com"},
        {url: "stun:stun.voxgratia.org"},
        {url: "stun:stun.xten.com"}
    ] };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // PHONE Events
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    var readycb      = function(){};
    var debugcb      = function(){};
    var connectcb    = function(){};
    var disconnectcb = function(){};
    var reconnectcb  = function(){};
    var callstatuscb = function(){};
    var receivercb   = function(){};

    PHONE.ready      = function(cb) { readycb      = cb };
    PHONE.callstatus = function(cb) { callstatuscb = cb };
    PHONE.debug      = function(cb) { debugcb      = cb };
    PHONE.connect    = function(cb) { connectcb    = cb };
    PHONE.disconnect = function(cb) { disconnectcb = cb };
    PHONE.reconnect  = function(cb) { reconnectcb  = cb };
    PHONE.receiver   = function(cb) { receivercb   = cb };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Add/Get Conversation - Creates a new PC or Returns Existing PC
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function get_conversation( number, params ) {
        var talk = conversations[number] || (function(){
            var talk = {
                number     : number,
                status     : '',
                pc         : new PeerConnection(rtcconfig),
                establish  : params && params.establish  || function(){},
                disconnect : params && params.disconnect || function(){}
            };

            // Setup Event Methods
            talk.pc.onaddstream    = config.onaddstream || onaddstream;
            talk.pc.onicecandidate = onicecandidate;
            talk.pc.number         = number;

            // Disconnect and Hangup
            talk.hangup = function(signal) {
                if (signal !== false) transmit( number, { hangup : true } );
                talk.pc.close();
            };
            
            // Add Local Media Streams Audio Video Mic Camera
            talk.pc.addStream(mystream);

            // Notify of Call Status
            update_conversation( number, 'connecting' );

            // Return Brand New Talk Reference
            return talk;
        })();

        // Return Existing or New Reference to Caller
        return talk;
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Notify of Call Status Events
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function update_conversation( number, status ) {
        var talk = conversations[number];
        talk.status = status;
        callstatuscb(talk);
        return talk;
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Make Call - Create new PeerConnection
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.dial = function(params) {
        var number = params.number;
        var talk   = get_conversation( number, params );
        var pc     = talk.pc;

        // Send SDP Offer (Call)
        pc.createOffer( function(offer) {
            offer.receiver = true;
            transmit( number, offer );
            pc.setLocalDescription( offer, debugcb, debugcb );
        }, debugcb );
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Visually Display New Stream
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function onaddstream(obj) {
        var vid = document.createElement("video");
        vid.setAttribute( 'autoplay', 'autoplay' );
        vid.setAttribute( 'width', '100' );
        vid.src = URL.createObjectURL(obj.stream);
        (config.media || document.getElementsByTagName('body')[0])
        .appendChild(vid);
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // On ICE Route Candidate Discovery
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function onicecandidate(event) {
        if (event.candidate == null) return;
        transmit( this.number, event.candidate );
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Listen For New Incoming Calls
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    pubnub.subscribe({
        channel    : config.phone,
        message    : receive,
        disconnect : disconnectcb,
        reconnect  : reconnectcb,
        connect    : connected
    });

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // When Ready to Receive Calls, Prepare Local Media Camera and Mic
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function connected() {
        navigator.getUserMedia( mediaconf, function(stream) {
            mystream = stream;
            connectcb();
            readycb();
        }, debugcb );
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Send SDP Call Offers/Answers and ICE Candidates to Peer
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function transmit( phone, packet ) {
        if (!packet) return;
        var message = { packet : packet, id  : sessionid, number : phone };
        debugcb(message);
        pubnub.publish({ channel : phone, message : message });
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // SDP Offers & ICE Candidates Receivable Processing
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function receive(message) {
        // Ignore Received Events From Local Device
        // if (message.id === sessionid) return;
        debugcb(message);

        // Get Call Reference
        var talk = get_conversation(message.number);

        // If Hangup Request
        if (message.packet.hangup) {
            talk.disconnect(talk);
            return talk.hangup(false);
        }

        // If Peer Connection is Successfully Established
        if (message.packet.establish) talk.establish(talk);

        // If Peer Calling Inbound (Incoming)
        if (message.packet.receiver) receivercb(talk);

        // Update Peer Connection with SDP Offer or ICE Routes
        if (message.packet.sdp) add_sdp_offer(message);
        else                    add_ice_route(message);
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Add SDP Offer/Answers
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function add_sdp_offer(message) {
        // Get Call Reference
        var talk = get_conversation(message.number);
        var pc   = talk.pc;

        // Notify of Call Status
        update_conversation( number, 'routing' );

        // Add SDP Offer/Answer
        pc.setRemoteDescription(
            new SessionDescription(message.packet), function() {
                // Call Online and Ready
                if (pc.remoteDescription.type != "offer")
                    return transmit( message.number, { establish : true } );

                // Create Answer to Call
                pc.createAnswer( function(answer) {
                    pc.setLocalDescription( answer, debugcb, debugcb );
                    answer.establish = true;
                    transmit( message.number, answer );
                }, debugcb );
            }, debugcb
        );
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Add ICE Candidate Routes
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function add_ice_route(message) {
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

    return PHONE;
};


})();
