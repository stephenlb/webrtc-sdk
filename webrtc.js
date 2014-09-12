(function(){


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// WebRTC Peer Connection
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var PHONE = window.PHONE = function(config) {
    var PHONE         = function(){};
    var pubnub        = PUBNUB(config);
    var sessionid     = PUBNUB.uuid();
    var readycb       = function(){};
    var debugcb       = function(){};
    var connectcb     = function(){};
    var mystream      = null;
    var disconnectcb  = function(){};
    var reconnectcb   = function(){};
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
    PHONE.ready      = function(cb) { readycb      = cb };
    PHONE.debug      = function(cb) { debugcb      = cb };
    PHONE.connect    = function(cb) { connectcb    = cb };
    PHONE.disconnect = function(cb) { disconnectcb = cb };
    PHONE.reconnect  = function(cb) { reconnectcb  = cb };

    // Add Conversation
    function add_conversation(number) {
        var talk = conversations[number] = {
            number    : number,
            pc        : new PeerConnection(rtcconfig)
        };

        // Setup Event Methods
        talk.pc.onaddstream    = onaddstream;
        talk.pc.onicecandidate = onicecandidate;

        // Return Reference to Call
        return talk;
    }

    // Make Call
    PHONE.call = function(phone) {
        pc.calling = phone;
        pc.createOffer( function(offer) {
            transmit( phone, offer );
            pc.setLocalDescription( offer, debugcb, debugcb );
        }, debugcb );
    };

    // Display New Stream
    //var pc = new PeerConnection(rtcconfig);
    function onaddstream(obj) {
        // TODO // allow user to sepcify...
        var vid = document.createElement("video");
        vid.setAttribute( 'autoplay', 'autoplay' );
        vid.setAttribute( 'width', '100' );
        vid.src = URL.createObjectURL(obj.stream);
        (config.media || document.getElementsByTagName('body')[0])
        .appendChild(vid);
    }

    // On ICE Route Candidate Discovery
    function onicecandidate(event) {
        var self = this;
        if (event.candidate == null) return;
        transmit( self.number , event.candidate );
    };

    // Listen For New Incomming Calls
    pubnub.subscribe({
        channel    : config.phone,
        message    : receive,
        disconnect : disconnectcb,
        reconnect  : reconnectcb,
        connect    : function() {
            navigator.getUserMedia( {audio:true,video:true}, function(stream) {
                mystream = stream;
                pc.addStream(mystream);
                connectcb();
                readycb();
            }, debugcb );
        }
    });

    // Candidates Receiver Processor
    function receive(message) {

        // Ignore Received Events From Local Device
        if (message.id === sessionid) return;

        debugcb(message);

        pc.caller = message.caller;
        if (message.ice.sdp) {
            console.log("!!!!!! SDP !!!!!!!!!! ");
            pc.setRemoteDescription(
                new SessionDescription(message.ice),
                function () {
                    if (pc.remoteDescription.type == "offer")
                        pc.createAnswer( function(answer) {
                            pc.setLocalDescription( answer, debugcb, debugcb );

                            transmit( message.caller, answer );
                            console.log("ANSWER",answer," -- CALLER -> ",message.caller);
                        }, debugcb );
                }, debugcb
            );
        }
        else {
            pc.addIceCandidate(
                new IceCandidate(message.ice),
                debugcb,
                debugcb
            );
        }
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Send SDP Call Offers/Answers and ICE Candidates to Peer
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function transmit( phone, ice ) {
        if (!ice) return;
        var message = { ice : ice, id  : sessionid, number : phone };
        debugcb(message);
        pubnub.publish({ channel : phone, message : message });
    }

    return PHONE;
};


})();
