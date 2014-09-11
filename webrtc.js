(function(){


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// WebRTC Peer Connection
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var PHONE = window.PHONE = function(config) {
    var PHONE        = function(){};
    var pubnub       = PUBNUB(config);
    var sessionid    = PUBNUB.uuid();
    var readycb      = function(){};
    var debugcb      = function(){};
    var connectcb    = function(){};
    var mystream     = null;
    var disconnectcb = function(){};
    var reconnectcb  = function(){};

    var PeerConnection =
        window.RTCPeerConnection    ||
        window.mozRTCPeerConnection ||
        window.webkitRTCPeerConnection;

    var IceCandidate =
        window.mozRTCIceCandidate ||
        window.RTCIceCandidate;

    var SessionDescription =
        window.RTCSessionDescription    ||
        window.mozRTCSessionDescription ||
        window.webkitRTCSessionDescription;

    navigator.getUserMedia = 
        navigator.getUserMedia       ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia    ||
        navigator.msGetUserMedia;

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

    // PHONE Events
    PHONE.ready      = function(cb) { readycb      = cb };
    PHONE.debug      = function(cb) { debugcb      = cb };
    PHONE.connect    = function(cb) { connectcb    = cb };
    PHONE.disconnect = function(cb) { disconnectcb = cb };
    PHONE.reconnect  = function(cb) { reconnectcb  = cb };

    // Make Call
    PHONE.call = function(phone) {
        pc.calling = phone;
        pc.createOffer( function(offer) {
            send( phone, offer );
            pc.setLocalDescription( offer, debugcb, debugcb );
        }, debugcb );
    };

    // Setup PeerConnection
    var pc = new PeerConnection(rtcconfig);
    pc.onaddstream = function(obj) {
        // TODO // allow user to sepcify...
        // TODO // allow user to sepcify...
        // TODO // allow user to sepcify...
        var vid = document.createElement("video");
        vid.setAttribute( 'autoplay', 'autoplay' );
        vid.setAttribute( 'width', '100' );
        vid.src = URL.createObjectURL(obj.stream);
        document.getElementsByTagName('body')[0].appendChild(vid);
    };
    pc.onicecandidate = function(event) {
        if (event.candidate == null) return;
        console.log("CALLING --->",pc.caller || pc.calling);
        send( pc.caller || pc.calling, event.candidate );
    };

    // Listen For ICE Candidates
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
        if (message.id === sessionid) return;
        // Attempt peer connection or upgrade route if better route...
        // Attempt peer connection or upgrade route if better route...
        // Attempt peer connection or upgrade route if better route...
        debugcb(message);
        //pc.onaddstream({ stream : stream });
        // ... RTC Peer Connection upgrade/attempt ...
        // Attempt peer connection or upgrade route if better route...
        // Attempt peer connection or upgrade route if better route...

        pc.caller = message.caller;
        if (message.ice.sdp) {
            console.log("!!!!!! SDP !!!!!!!!!! ");
            pc.setRemoteDescription(
                new SessionDescription(message.ice),
                function () {
                    if (pc.remoteDescription.type == "offer")
                        pc.createAnswer( function(answer) {
                            pc.setLocalDescription( answer, debugcb, debugcb );

                            send( message.caller, answer );
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

    // Send Candidates
    function send( phone, ice ) {
        if (!ice) return;
        var message = { ice : ice, id  : sessionid, caller : phone };
        debugcb(message);
        pubnub.publish({ channel : phone, message : message });
    }

    // Create ICE Candidates
    function emit_ice(phone) {

        // PeerConnection
    }

    return PHONE;
};


})();
