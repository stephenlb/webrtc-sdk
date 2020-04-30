(()=>{

'use strict';

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// WebRTC Simple Calling API + Mobile
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
const PHONE = window.PHONE = config => {
    const PHONE         = ()=>{};
    const pubnub        = socket(config);
    const pubkey        = config.publish_key   || 'demo';
    const subkey        = config.subscribe_key || 'demo';
    const autocam       = config.autocam !== false;
    const sessionid     = uuid();
    const mediaconf     = config.media || { audio : true, video : true };
    const conversations = {};
    let   myvideo       = document.createElement('video');
    let   snapper       = ()=>' ';
    let   mystream      = null;
    let   myconnection  = false;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // RTC Peer Connection Session (one per call)
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    const PeerConnection =
        window.RTCPeerConnection    ||
        window.mozRTCPeerConnection ||
        window.webkitRTCPeerConnection;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // ICE (many route options per call)
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    const IceCandidate =
        window.RTCIceCandidate ||
        window.mozRTCIceCandidate;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Media Session Description (offer and answer per call)
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    const SessionDescription =
        window.RTCSessionDescription    ||
        window.mozRTCSessionDescription ||
        window.webkitRTCSessionDescription;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // STUN Server List Configuration (public STUN list)
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    const rtcconfig = { iceServers : [{ "urls" :
        navigator.mozGetUserMedia    ? "stun:stun.services.mozilla.com" :
        navigator.webkitGetUserMedia ? "stun:stun.l.google.com:19302"   :
                                       "stun:23.21.150.121"
    }
    //,   {urls: "stun:stun.l.google.com:19302"}
    ,   {urls: "stun:stun1.l.google.com:19302"}
    ,   {urls: "stun:stun2.l.google.com:19302"}
    ,   {urls: "stun:stun3.l.google.com:19302"}
    //,   {urls: "stun:stun4.l.google.com:19302"}
    //,   {urls: "stun:23.21.150.121"}
    //,   {urls: "stun:stun01.sipphone.com"}
    //,   {urls: "stun:stun.ekiga.net"}
    //,   {urls: "stun:stun.fwdnet.net"}
    //,   {urls: "stun:stun.ideasip.com"}
    //,   {urls: "stun:stun.iptel.org"}
    //,   {urls: "stun:stun.rixtelecom.se"}
    //,   {urls: "stun:stun.schlund.de"}
    //,   {urls: "stun:stunserver.org"}
    //,   {urls: "stun:stun.softjoys.com"}
    //,   {urls: "stun:stun.voiparound.com"}
    //,   {urls: "stun:stun.voipbuster.com"}
    //,   {urls: "stun:stun.voipstunt.com"}
    //,   {urls: "stun:stun.voxgratia.org"}
    //,   {urls: "stun:stun.xten.com"}
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
    let messagecb    = ()=>{};
    let readycb      = ()=>{};
    let cameracb     = ()=>{};
    let unablecb     = ()=>{};
    let debugcb      = ()=>{};
    let connectcb    = ()=>{};
    let disconnectcb = ()=>{};
    let reconnectcb  = ()=>{};
    let callstatuscb = ()=>{};
    let receivercb   = ()=>{};

    PHONE.camera     = cb => cameracb     = cb;
    PHONE.message    = cb => messagecb    = cb;
    PHONE.ready      = cb => readycb      = cb;
    PHONE.unable     = cb => unablecb     = cb;
    PHONE.callstatus = cb => callstatuscb = cb;
    PHONE.debug      = cb => debugcb      = cb;
    PHONE.connect    = cb => connectcb    = cb;
    PHONE.disconnect = cb => disconnectcb = cb;
    PHONE.reconnect  = cb => reconnectcb  = cb;
    PHONE.receive    = cb => receivercb   = cb;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Add/Get Conversation - Creates a new PC or Returns Existing PC
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function get_conversation(number) {
        let talk = conversations[number] || (number => {
            let talk = {
                number  : number
            ,   status  : ''
            ,   image   : document.createElement('img')
            ,   started : +new Date
            ,   imgset  : false
            ,   imgsent : 0
            ,   pc      : new PeerConnection(rtcconfig)
            ,   closed  : false
            ,   usermsg : ()=>{}
            ,   thumb   : null
            ,   connect : ()=>{}
            ,   end     : ()=>{}
            };

            // Setup Event Methods
            talk.pc.ontrack        = config.ontrack || function(event) { onaddstream( number, event ) };;
            talk.pc.onicecandidate = function(event) { onicecandidate( number, event ) };
            talk.pc.number         = number;

            // Disconnect and Hangup
            talk.hangup = signal => {
                if (talk.closed) return;

                talk.closed = true;
                talk.imgset = false;

                if (signal !== false) transmit( number, { hangup : true } );

                talk.end(talk);
                talk.pc.close();
                close_conversation(number);
            };
           
            // Disconnected?
            talk.pc.oniceconnectionstatechange = function() {
                if(talk.pc.iceConnectionState == 'disconnected') {							
                    talk.hangup();									
                }
            }

            // Stop Audio/Video Stream
            talk.stop = () => {
                if (mystream) stopcamera();
                return mystream;
            };

            // Sending Messages
            talk.send = message => {
                transmit( number, { usermsg : message } );
            };

            // Sending Stanpshots
            talk.snap = () => {
                let pic = snapper();
                transmit( number, { thumbnail : pic } );
                let img = document.createElement('img');
                img.src = pic;
                return { data : pic, image : img };
            };

            // Take One Snapshot
            talk.snap();

            // Nice Accessor to Update Disconnect & Establis CBs
            talk.thumbnail = cb => {talk.thumb   = cb; return talk};
            talk.ended     = cb => {talk.end     = cb; return talk};
            talk.connected = cb => {talk.connect = cb; return talk};
            talk.message   = cb => {talk.usermsg = cb; return talk};

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
    // UUID
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.uuid = uuid;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // DOM Helper Functions
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.$  = el => document.getElementById(el);
    PHONE.$$ = el => document.getElementsByTagName(el);

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // DOM Bind
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.bind = ( type, el, fun ) => {
        type.split(',').forEach( etype => {
            const rapfun = e => {
                if (!e) e = window.event;
                if (!fun(e)) {
                    e.cancelBubble = true;
                    e.preventDefault  && e.preventDefault();
                    e.stopPropagation && e.stopPropagation();
                }
            };

            if ( el.addEventListener ) el.addEventListener(
                etype, rapfun, false
            );
            else if ( el.attachEvent ) el.attachEvent( 'on' + etype, rapfun );
            else  el[ 'on' + etype ] = rapfun;
        } );
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // DOM UNBind
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.unbind = ( type, el, fun ) => {
        if ( el.removeEventListener ) el.removeEventListener( type, false );
        else if ( el.detachEvent ) el.detachEvent( 'on' + type, false );
        else  el[ 'on' + type ] = null;
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Get Number
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.number = () => {
        return config.number;
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Get Call History
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.history = settings => {
        pubnub.history({
            channel  : settings[number],
            callback : call_history => {
                settings['history'](call_history[0]);
            }
        })
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Make Call - Create new PeerConnection
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.dial = function( number, servers ) {
        if (!!servers) add_servers(servers);
        if (!number) return debugcb("Missing Number to Dial.");

        let talk = get_conversation(number);
        let pc   = talk.pc;

        // Prevent Repeat Calls
        if (talk.dialed) return false;
        talk.dialed = true;

        // Send SDP Offer (Call)
        pc.createOffer().then( async offer => {
            debugcb(["pc.createOffer(PASS)", await pc.setLocalDescription(offer)]);
            transmit( number, offer );
        } ).catch( error => debugcb(["pc.createOffer(FAIL)", error]) );

        // Return Session Reference
        return talk;
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Send Image Snap - Send Image Snap to All Calls or a Specific Call
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.snap = function( message, number ) {
        if (number) return get_conversation(number).snap(message);
        let pic = {};
        for (let number in conversations) pic = conversations[number].snap();
        return pic;
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Send Message - Send Message to All Calls or a Specific Call
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.send = ( message, number ) => {
        if (number) return get_conversation(number).send(message);
        for (let number in conversations) conversations[number].send(message);
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // End Call - Close All Calls or a Specific Call
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.hangup = number => {
        if (number) return get_conversation(number).hangup();
        for (let number in conversations) conversations[number].hangup();
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Auto-hangup on Leave
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.bind( 'unload,beforeunload', window, () => {
        if (PHONE.goodbye) return true;
        PHONE.goodbye = true;

        for (let number in conversations) {
            let talk     = conversations[number];
            let mynumber = config.number;
            let packet   = { hangup:true };
            let message  = { packet:packet, id:sessionid, number:mynumber };
            let client   = new XMLHttpRequest();
            let url      = 'https://pubsub.pubnub.com/publish/'
                           + pubkey + '/'
                           + subkey + '/0/'
                           + number + '/0/'
                           + JSON.stringify(message);

            client.open( 'GET', url, false );
            client.send();
            talk.hangup();
        }

        return true;
    } );

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Grab Local Video Snapshot
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function snapshots_setup(stream) {
        let video   = myvideo || document.createElement('video');
        let canvas  = document.createElement('canvas');
        let context = canvas.getContext("2d");
        let snap    = { width: 240, height: 180 };

        // Video Settings
        video.width     = snap.width;
        video.height    = snap.height;
        video.srcObject = stream;
        video.volume    = 0.0;

        // Start Video Stream
        try { video.play() }
        catch(e) { debugcb(["video.play(FAIL)", e]) }

        // Canvas Settings
        canvas.width  = snap.width;
        canvas.height = snap.height;

        // Capture Local Pic
        snapper = () => {
            try {
                context.drawImage( video, 0, 0, snap.width, snap.height );
            } catch(e) { debugcb(["context.drawImage(FAIL)", e]) }
            return canvas.toDataURL( 'image/jpeg', 0.30 );
        };
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Visually Display New Stream
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function onaddstream( number, obj ) {
        let vid    = document.createElement('video');
        let talk   = get_conversation(number);

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
        if (!event.candidate) return;
        transmit( number, event.candidate );
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Listen For New Incoming Calls
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function dailer_subscribe() {
        pubnub.subscribe({
            restore    : false
        ,   channel    : config.number
        ,   message    : receive
        ,   disconnect : disconnectcb
        ,   reconnect  : reconnectcb
        ,   connect    : () => onready(true)
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
    function startcamera() {
        navigator.mediaDevices.getUserMedia(mediaconf).then( stream => {
            if (!stream) return unablecb(stream);
            mystream = stream;
            snapshots_setup(stream);
            onready();
            cameracb(myvideo);
        } ).catch( info => {
            debugcb(["navigator.mediaDevices.getUserMedia(FAIL)", info]);
            return unablecb(info);
        } );
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Stop Camera/Mic
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function stopcamera() {
        if (!mystream) return;
        for (let track of mystream.getTracks()) track.stop();
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Toggle Mic
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function toggleAudio() {
        if (!mystream) return;
        for (let track of mystream.getAudioTracks() ){
            track.enabled = !track.enabled ;
        }
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Toggle Camera
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function toggleVideo() {
        if (!mystream) return;
        for (let track of mystream.getVideoTracks() ){
            track.enabled = !track.enabled ;
        }
    }
    
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Initiate Dialing Socket
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function startsubscribe() {
        onready();
        dailer_subscribe();
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Send SDP Call Offers/Answers and ICE Candidates to Peer
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function transmit( phone, packet ) {
        if (!packet) return;
        let number  = config.number;
        let message = { packet : packet, id : sessionid, number : number };
        debugcb(["transmit(PASS)", message]);
        pubnub.publish({ channel : phone, message : message });
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // SDP Offers & ICE Candidates Receivable Processing
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function receive(message) {
        // Debug Callback of Data to Watch
        debugcb(["receive(PASS)", message]);

        // Get Call Reference
        let talk = get_conversation(message.number);

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
        let talk       = get_conversation(message.number);
        talk.image.src = message.packet.thumbnail;

        // Call only once
        if (!talk.thumb) return;
        if (!talk.imgset) talk.thumb(talk);
        talk.imgset = true;
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Add SDP Offer/Answers
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    async function add_sdp_offer(message) {
        // Get Call Reference
        let talk = get_conversation(message.number);
        let pc   = talk.pc;
        let type = message.packet.type == 'offer' ? 'offer' : 'answer';

        // Deduplicate SDP Offerings/Answers
        if (type in talk) return;
        talk[type]  = true;
        talk.dialed = true;

        // Notify of Call Status
        update_conversation( talk, 'routing' );

        // Add SDP Offer/Answer
        pc.setRemoteDescription(new SessionDescription(message.packet))
        .then( () => {
            // Set Connected Status
            update_conversation( talk, 'connected' );

            // Call Online and Ready
            if (pc.remoteDescription.type != 'offer') return;

            // Create Answer to Call
            pc.createAnswer().then( async answer => {
                debugcb([
                    "pc.createAnswer(PASS)",
                    await pc.setLocalDescription(answer)
                ]);
                transmit( message.number, answer );
            } ).catch( error => debugcb(["pc.createAnswer(FAIL)", error]) );
        } ).catch( error => debugcb(["pc.setRemoteDescription(FAIL)", error]) );
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Add ICE Candidate Routes
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function add_ice_route(message) {
        // Leave if Non-good ICE Packet
        if (!message.packet)           return;
        if (!message.packet.candidate) return;

        // Get Call Reference
        let talk = get_conversation(message.number);
        let pc   = talk.pc;

        // Add ICE Candidate Routes
        pc.addIceCandidate(new IceCandidate(message.packet))
        .then( info => debugcb(["pc.addIceCandidate(PASS)", info, message]))
        .catch( err => debugcb(["pc.addIceCandidate(FAIL)", err, message]) );
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Main - Setup Dialer Socket and Camera
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    PHONE.startcamera        = startcamera;
    PHONE.camera.start       = startcamera;
    PHONE.camera.stop        = stopcamera;
    PHONE.camera.toggleAudio = toggleAudio;
    PHONE.camera.toggleVideo = toggleVideo;
    PHONE.camera.video       = () => myvideo;
    PHONE.camera.ready       = PHONE.camera;

    // Start Camera Automatically
    if (autocam) startcamera();

    // Start Dailer Socket
    startsubscribe();

    // Return Phone API
    return PHONE;
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// UUID
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function uuid(callback) {
    let u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    function(c) {
        let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    if (callback) callback(u);
    return u;
}



// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// PubNub Socket Lib
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
function socket(setup) {
    const pubkey = setup.publish_key   || setup.pubkey || 'demo'
    ,     subkey = setup.subscribe_key || setup.subkey || 'demo';

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Publish
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    let publishing     = false;
    const publishQueue = [];

    function publish(data) {
        publishQueue.push(data);
        publishSender();
    }

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Publish Queue Worker
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function publishSender() {
        if (publishing) return;

        let data = publishQueue.shift();
        if (!data) return (publishing = false);
        publishing = true;

        const publisher = requester({
            timeout : 5000
        ,   success : () => { publishing = false; publishSender() }
        ,   fail    : () => publishQueue.unshift(data)
        });

        let url = ['https://pubsub.pubnub.com/publish'
                  , pubkey
                  , subkey,       '0'
                  , data.channel, '0'
                  , encodeURIComponent(JSON.stringify(data.message))
                  ].join('/');

        publisher({ url : url });
    }


    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Subscribe
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function subscribe(setup) {
        let channel    = setup.channel       || 'a'
        ,   message    = setup.message       || (()=>{})
        ,   connect    = setup.connect       || (()=>{})
        ,   disconnect = setup.disconnect    || (()=>{})
        ,   reconnect  = setup.reconnect     || (()=>{})
        ,   timetoken  = setup.timetoken     || '0'
        ,   timeout    = setup.timeout       || 300000
        ,   windy      = setup.windowing     || 10
        ,   restore    = setup.restore 
        ,   windowing  = 10
        ,   connected  = true
        ,   stop       = false
        ,   url        = ''
        ,   origin     = 'ps'+(Math.random()+'').split('.')[1]+'.pubnub.com';

        // Requester Object
        let request = requester({
            timeout : timeout,
            success : next,
            fail    : () => next()
        });

        // Subscribe Loop
        function next(payload) { 
            if (stop) return;
            if (payload) {
                if (+timetoken < 100000) connect();
                if (!connected)          reconnect();

                connected = true;

                if (!restore) timetoken = payload.t.t;
                else {
                    timetoken = '1000';
                    restore   = false;
                }

                payload.m.forEach( msg => message( msg.d, msg ) );
            }
            else {
                if (connected) disconnect();
                connected = false;
            }

            url = [
                'https://',       origin, 
                '/v2/subscribe/', subkey,
                '/',              channel,
                '/0/',            timetoken
            ].join('');

            setTimeout( () => {
                windowing = windy;
                request({ url : url });
            }, windowing );
        }

        // Cancel Subscription
        function unsubscribe() { stop = true }

        // Start Subscribe Loop
        next();

        // Allow Cancelling Subscriptions
        return { unsubscribe : unsubscribe };
    }

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // History
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function history(data) {
        // TODO
    }

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Request URL
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function requester(setup) {
        let xhr      = new XMLHttpRequest()
        ,   finished = false
        ,   timeout  = setup.timeout || 5000
        ,   success  = setup.success || function(){}
        ,   fail     = setup.fail    || function(){};

        // Cancel a Pending Request
        function abort() {
            if (finished) return;
            xhr.abort && xhr.abort();
            finish();
        }

        // Mark Request as Completed
        function finish() {
            finished = true;
        }

        // When a Request has a Payload
        xhr.onload = () => {
            if (finished) return;
            finish();
            let result;

            try      { result = JSON.parse(xhr.response) }
            catch(e) { fail(xhr) }

            if (result) success(result);
            else        fail(xhr);
            result = null;
        };

        // When a Request has Failed
        xhr.onabort = xhr.ontimeout = xhr.onerror = () => {
            if (finished) return;
            finish();
            fail(xhr);
        };

        // Timeout and Aboart for Slow Requests
        xhr.timer = setTimeout( () => {
            if (finished) return;
            abort();
            fail(xhr);
        }, timeout );

        // Return Requester Object
        return setup => {
            let url     = setup.url     || 'https://ps.pubnub.com/time/0'
            ,   headers = setup.headers || {}
            ,   method  = setup.method  || 'GET'
            ,   payload = setup.payload || null
            ,   params  = setup.params  || setup.data || {}
            ,   data    = [];

            // URL Parameters
            for (let param in params)
                data.push([ param, params[param] ].join('='));

            // Start Request
            finished = false;
            xhr.timeout = timeout;
            xhr.open(
                method,
                url + (data.length ? ('?' + data.join('&')) : ''),
                true
            );

            // Headers
            for (let header in headers)
                xhr.setRequestHeader( header, headers[header] );

            // Send Request
            xhr.send(payload);

            return {
                xhr   : xhr,
                abort : abort
            } 
        };
    }

    // Return Socket Lib Instance
    return {
        publish   : publish
    ,   subscribe : subscribe
    ,   history   : history
    };

}

})();
