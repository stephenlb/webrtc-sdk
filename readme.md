# WebRTC V2 Simple Calling API + Mobile

[![Known Vulnerabilities](https://snyk.io/test/npm/webrtc-sdk/badge.svg)](https://snyk.io/test/npm/webrtc-sdk)
[![npm](https://img.shields.io/npm/v/webrtc-sdk.svg)]()

> WebRTC SDK Upgraded! ES6, new camera control and 100x less code than v1.

The following demo uses PubNub for signaling to transfer the metadata and establish the peer-to-peer connection. Once the connection is established, the video and voice runs on public Google STUN/TURN servers.
Keep in mind, PubNub can provide the signaling for WebRTC, and requires you to combine it with a hosted WebRTC solution. For more detail on what PubNub does, and what PubNub doesn’t do with WebRTC, check out this article: https://support.pubnub.com/support/solutions/articles/14000043715-does-pubnub-provide-webrtc-and-video-chat-

At PubNub we believe simplicity is essential for our SDK usability.
We've taken a simplified approach to WebRTC Peer Connections by creating
and easy-to-use SDK for developers.
The ideas of simplicity should span all platforms and devices too and
that's why we also support **Android** WebRTC mobile calling
with compatibility for iOS native Objective-C based WebRTC SDK.
This simple developer WebRTC SDK is powered by
[PubNub Data Stream Network](https://www.pubnub.com/).

### Supported WebRTC Features

WebRTC SDK offers many rich features and capabilities to enhance the
WebRTC experience.  Here is a list of the options available.

 1. Photo Snap Camera Transmit             *(STUN-less Firewall Ready)*
 1. WebRTC Dialing                         *(STUN-less Firewall Ready)*
 1. WebRTC Call Receiving                  *(STUN-less Firewall Ready)*
 1. JSON App Messaging (chat/signals/etc.) *(STUN-less Firewall Ready)*
 1. Multi-party Calling
 1. Audio only Calls Optional
 1. Broadcasting Mode
 1. Instant Connect Dialing Optional
 1. Security SSL, AES256, ACL Access Control Management
 1. Password Protection via Cipher
 1. Event History and Call Records
 1. Photo History and Recording Static Snapshots of Calls (only stills)
 1. Connectivity Detection and Auto-Recovery
 1. Pre-configured Video Element for Streaming Video/Audio
 1. Pre-configured Local Camera Video Element for Streaming Video/Audio
 1. Network Connectivity Hooks (online/offline)
 1. SDK Level Debug Output

### Testing Locally

You need an HTTPS (TLS) File Server. To start a local secure file server:

```shell
python <(curl -L https://goo.gl/LiW3lp)
```

Then open your browser and point it to your file in
the directory you ran the python HTTPS server.

```shell
open https://0.0.0.0:4443/your-file-here.html
```

> This is a Simple Python HTTPS Secure Server
> https://gist.github.com/stephenlb/2e19d98039469b9d0134

We posted an answer on
[StackOverflow WebRTC HTTPS](http://stackoverflow.com/a/41969170/524733).
This will get you started testing on your laptop.

### Supported WebRTC Calling API Mobile Devices and Browser

List of supported WebRTC Calling Clients including Android and Chrome.

 1. Chrome
 2. Firefox
 3. Opera
 4. Mobile Chrome - Android
 5. Mobile Firefox - Android
 6. *iOS Native Objective-C Compatible*
 6. *Android Native Java Compatible*

### The Basic Concepts of WebRTC Calling

##### Making a WebRTC phone Call

```javascript
// Dial Number
var session = phone.dial('123-456');
```

##### Receiving a WebRTC phone Call

```javascript
phone.receive(function(session){
    // On Call Receiving
});
```

##### Adding Video Live Stream

```javascript
phone.receive(function(session){
    session.connected(function(session){
        // Append Live Video Feed
        $('#display-div').append(session.video);
    });
});
```

### Simple WebRTC Walkthrough

Next we will start with a copy/paste example of our SDK.
This Simple Example Comes in **Two WebRTC Calling Sections**.

 1. *Part One* will talk about how you can **Make a WebRTC Call**.
 2. *Part Two* will teach you about **Receiving a WebRTC Call**.

#### Making a WebRTC Calling & Receiving - *Part One and Two*

Make your first html file named `dial.html` and copy/paste the following:

```html
<!-- dial.html -->

<!-- Video Output Zone -->
<div id="video-out"> Making a Call </div>

<!-- Libs and Scripts -->
<script src="https://stephenlb.github.io/webrtc-sdk/js/webrtc-v2.js"></script>
<script>(()=>{
    // ~Warning~ You must get your own API Keys for non-demo purposes.
    // ~Warning~ Get your PubNub API Keys: https://www.pubnub.com/get-started/
    // The phone *number* can by any string value
    var phone = PHONE({
        number        : '1234',
        publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c',
        subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe',
        ssl           : true
    });

    // As soon as the phone is ready we can make calls
    phone.ready(function(){

        // Dial a Number and get the Call Session
        // For simplicity the phone number is the same for both caller/receiver.
        // you should use different phone numbers for each user.
        var session = phone.dial('1234');

    });

    // When Call Comes In or is to be Connected
    phone.receive(function(session){

        // Display Your Friend's Live Video
        session.connected(function(session){
            phone.$('video-out').appendChild(session.video);
        });

    });

})();</script>
```

### Live WebRTC Call Dialer 

If you combine both the **WebRTC Dialer** and the **WebRTC Receiver**
you will get a complete working phone.
We have a live running WebRTC Demo which uses our WebRTC SDK.
This demo includes a soft-touch UI for an easy calling experience.

> try the **live WebRTC Dialing**:
[WebRTC Simple Calling API + Mobile](https://stephenlb.github.io/webrtc-sdk/)

[![WebRTC Simple Calling API + Mobile](http://pubnub.s3.amazonaws.com/assets/webrtc-simple-sdk-calling-api-peer-connect.png)](https://stephenlb.github.io/webrtc-sdk/)

You can click the link above to try our live WebRTC Demo
which is powered by our easy to use SDK.

### What Can you build with a WebRTC Simple Calling API?

There are a plethera of important and useful applications which may
be built using the PubNub WebRTC Calling SDK.
I have cataloged a list of ideas for **WebRTC Use Cases**:

 1. Amazon Mayday Help Button
 2. Salesforce SOS Help Button
 3. WebRTC Skype Replica
 4. Traditional Phone Replacement
 5. Chatroulette
 6. VoIP Replacement
 7. Customer Support Calls
 8. In-bound Sales Calls
 9. Easy Remote Meetings
 10. Call Assistant or Specialists
 11. Big Screen Public Announcemnt
 12. Live Presentations

So many different options and even more use cases
that have yet to be discovered.


### What is a WebRTC Session?

A WebRTC `Session` is a reference to a call instance
between two connected parties.
The idea is the session is active as long as the two parties are connected.
Once one party member disconnects or leaves, the session will be terminated.
You have access to several helper methods for
`session.connected()` and `session.ended()` events.

## API Documentation for WebRTC Calling SDK

The WebRTC Simple SDK API Reference will provide to you all the options
available to you as the developer.

### WebRTC Phone Initialization
##### `PHONE({ ... })`

> Initialize the phone object which can send/receive multiple
WebRTC call sessions without limit.
Be careful as your bandwidth is the true limiter.

```javascript
var phone = PHONE({
    number        : '1234567890',
    publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c',
    subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe',
    media         : { audio : true, video : true },
    ssl           : true
})
```

### WebRTC Phone Number

> Your phone number is your true ring-in point of truth.
You can set your phone number at init time from the 

```javascript
var phone = PHONE({ number : '1234567890' });
```

### WebRTC Local Camera Video Element

We provide you easy access to your local camera with
a pre-initialized video element that is easy to access.
Simply append the element to your DOM and the feed will
stream automatically.

```javascript
$('#display-div').append(phone.video);
```

### WebRTC Phone SSL Mode

> You can enable SSL signalling mode for the local client device
by setting the `ssl : true` parameter at init.

```javascript
var phone = PHONE({
    ssl : true
    ...
})
```

### WebRTC Cipher AES 256 Crypto Mode

> You can enable AES256 Encryption (essentially password mode)
on your phone for additional security.
You're friends have to know your password to call you.
AES256 option allows you to password protect your phone and 
only give access to people you know.  
You have to give your friend your password before they can call you.

```javascript
var phone = PHONE({
    cipher_key : 'SUPER-SECRET-PASSWORD-HERE'
    ...
})
```

### WebRTC Phone Audio Only Mode

> You can disable video codec and stream only Audio by setting
the following param in your init code.
Set `video : false` in the media section.

```javascript
var phone = PHONE({
    media : { audio : true, video : false }
    ...
})
```

### WebRTC Phone Mobile Calling on Android

WebRTC calling on Android is web-ready compatible and works
out-of-the-box today without modifications or additional code.
Also WebRTC Calling is supported for Android and iOS Native too.

## WebRTC Photo Sharing *Bonus STUN-less Ready*

You can easily snap a photo from the video stream and
send it to your friends in an instant.
You can think of this as an **Instagram WebRTC** style.
Also Photo Sharing works through Corprate Enterprise Firewalls.

### WebRTC Camera Photo Sharing Broadcast
##### `phone.snap()`

> Broadcast your camera photo to all connected sessions.
Also get the IMG data as base64 supported format
for local display if desired.

```javascript
phone.ready(function(){
    // Auto Send Camera's Photo to all connected Sessions.
    var photo = phone.snap();
    $('#photo-div').append(photo.image);
});
```

### WebRTC Session Camera Photo Share
##### `session.snap()`

> Send your camera's latest frame as raw IMG to
a specific call session.

```javascript
phone.ready(function(){
    var session = phone.dial('4321');
    var photo   = session.snap();
    $('#photo-div').append(photo.image);
});
```

### Prevent Camera from Starting Automatically

By default the WebRTC SDK starts user's camera.  You can optionally prevent this by setting the `autocam` flag to `false`.  Here is an example of disabling the camera on initialization.

```html
<!-- dial.html -->
<div id="number"></div>

<button id="startcam">Start Camera</button>
<button id="startcall">Start Call</button><input id="dial">

<!-- Video Output Zone -->
<div id="video-out"></div>

<!-- Libs and Scripts -->
<script src="https://stephenlb.github.io/webrtc-sdk/js/webrtc-v2.js"></script>
<script>(=>(){

    // ~Warning~ You must get your own API Keys for non-demo purposes.
    // ~Warning~ Get your PubNub API Keys: https://www.pubnub.com/get-started/
    // The phone *number* can by any string value
    var number  = Math.ceil(Math.random()*10000);
    var ready   = false;
    var session = null;
    var phone   = PHONE({
        number        : number
    ,   autocam       : false
    ,   publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c'
    ,   subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe'
    ,   ssl           : true
    });

    // Show Number
    phone('number').innerHTML = 'Number: ' + number;

    // Start Camera
    phone.bind( 'mousedown,touchstart', phone.$('startcam'), function() {
        phone.startcamera();
        return false;
    } );

    // Start Call
    phone.bind( 'mousedown,touchstart', phone.$('startcall'), function() {
        console.log('calling');
        session = phone.dial(phone.$('dial').value);
        return false;
    } );

    // As soon as the phone is ready we can make calls
    phone.ready(function(){

        // Dial a Number and get the Call Session
        // For simplicity the phone number is the same for both caller/receiver.
        // you should use different phone numbers for each user.
        ready = true;

    });

    // When Call Comes In or is to be Connected
    phone.receive(function(session){

        // Display Your Friend's Live Video
        session.connected(function(session){
            phone.$('video-out').appendChild(session.video);
        });

    });

})();</script>
```

## WebRTC JSON Messaging *Bonus STUN-less Ready*

Adding extra realtime capabilities between connected parties
is essential for creating collaborative and chat features.
You can do that with PubNub's WebRTC SDK easily without
firewall restrictions from corporate policies.

### Message Broadcasting to All Sessions
##### `phone.send(...)`

> Send a JSON message to all connected sessions.

```javascript
phone.send({ text : 'HI!' });
```

### Receive a JSON message from Any Session
##### `phone.message(function(message){ ... })`

> Get all messages sent from any session.

```javascript
phone.message(function( session, message ) {
    show_chat( session.number, message.text );
} );
```

### Send a JSON Message to One Session
##### `session.send(...)`

> You can send a direct JSON message to one session only.

```javascript
session.send({ text : 'Hi there!' });
```

### Receive a JSON message from One Session
##### `session.message(function(){ ... })`

> You can set callbacks to capture JSON messages
from a specific call session.

```javascript
session.message(function( session, message ) {
    show_chat( session.number, message.text );
} );
```

### WebRTC Phone Ready
##### `phone.ready(function(){ ... })`

> Making calls is easy but you can only do it when the phone is
ready to issue the signals properly and the local interfaces
have been configured such as audio/video media.

```javascript
phone.ready(function(){
    // Ready to make Calls
    var session = phone.dial("my-friend's-number");
});
```

### WebRTC Phone Receiving Calls
##### `phone.receive(function(session){ ... })`

> It's really ease to setup your phone to receive calls using
the `phone.receive()` method.
This method expects a callback function and will pass the
WebRTC Session object as the only parameter.

```javascript
phone.receive(function(session){
    session.connected(function(session){ /* call connected */ });
    session.ended(function(session){     /* call ended     */ });
});
```

### Get Your Phone Number
##### `var num = phone.number()`

> Sometimes you need to access the phone number
that was set during initialization time.
You can do that by calling `phone.number()` method
which returns the setup number.

```javascript
var num = phone.number();
```

### Get Caller Phone Number
##### `var num = session.number`

> To access current caller number, check the session
object number property `session.number`.

```javascript
var num = session.number;
```

### Get Call Start Time
##### `var start = session.started`

> The Session object stores the call start time which
you can use to display call timer on the screen.

```javascript
var start = session.started;
```

### WebRTC Phone Call History via PubNub
##### `phone.history(...)`

> You can get the call history of a phone number by issuing
a PubNub History call on the phne number.

```javascript
phone.history({
    number  : '1234',
    history : function(call_history) {
        console.log(call_history);
    }
});
```

### WebRTC Phone Dialing Numbers
##### `phone.dial(number)`

> You can easily make WebRTC calls by executing the `dial()` method.
The number can be any string value such as `"415-555-5555"`.

```javascript
var session = phone.dial(number);

session.connected(function(session){ /* call connected */ });
session.ended(function(session){     /* call ended     */ });
```

### Set Camera Resolution

You can change the resolution of your camera's media capture.
This allows you to set lower resolutions for slower p2p connections.
You can also set HD 4K resolutions if you have the camera to do so.

```javascript
// Phone
const phone = PHONE({
    number        : number
,   media         : { video: { width:1280, height:720 } } // <---- set res
,   publish_key   : pubkey
,   subscribe_key : subkey 
});
```

### WebRTC Phone Multi-party Dialing
##### `phone.dial(number)`

> The PubNub WebRTC Phone Dialer and Receiver supports
unlimited party in/out calling.

```javascript
var sessions = [];

sessions.push(phone.dial('friend-one'));
sessions.push(phone.dial('friend-two'));
sessions.push(phone.dial('friend-three'));
sessions.push(phone.dial('friend-four'));
sessions.push(phone.dial('friend-five'));

sessions.forEach(function(friend){
    friend.connected(function(session){ /* call connected */ });
    friend.ended(function(session){     /* call ended     */ });
});
```

### WebRTC Video and Audio Broadcasting Mode
##### `phone.receive(function(session){ ... })`

> You can receive unlimited inbound calls and become a broadcast
beacon stream.
You are limited by your bandwidth upload capacity.

## Broadcaster with Audience Members

You'll start by opening the stream for the broadcaster so audience members can join in.
Start broadcasting as the broadcaster:

### Broadcaster

```javascript
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Initialize the Broadcaster's Device
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
var broadcaster = PHONE({
    number        : "BROADCASTER",  // If you want more than one broadcaster, use unique ids
    publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c',
    subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe',
    ssl           : true
});

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Wait for New Viewers to Join
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
broadcaster.receive(function(new_viewer){
    new_viewer.connected(function(viewer){ /* ... */ }); // new viewer joined
    new_viewer.ended(function(viewer){ /* ... */ });  // viewer left
    //new_viewer.hangup();  // if you want to block the viewer
});
```

### Viewer

```javascript
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Initialize the Viewer's Device
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
var viewer = PHONE({
    number        : "VIEWER-"+new Date,
    publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c',
    subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe',
    ssl           : true
});

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Join a Broadcast as a Viewer
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
viewer.ready(function(){
    var broadcaster = phone.dial("BROADCASTER");
});

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Show Broadcast's Video Stream
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
viewer.receive(function(broadcaster){
    broadcaster.connected(function(broadcaster){
        document.body.appendChild(broadcaster.video);
    });
    broadcaster.ended(function(broadcaster){ /* broadcast ended */ });
});
```

### WebRTC Phone Hangup
##### `phone.hangup()`

> There are two ways to hangup WebRTC calls.
You can use the phone-level method `phone.hangup()`
which will hangup all calls at once.
Or you can use the session-level method `session.hangup()`
which will only hangup that call session.

```javascript
// hangup all calls
phone.hangup();

// hangup single session
session.hangup();
```

### WebRTC Phone Network Events
##### `PHONE.disconnect(function(){ ... })`

> You need to keep track of the connectivity state of your local
network connection. You can do that using these helper methods.

```javascript
PHONE.connect(function(){    console.log('network LIVE.') })
PHONE.disconnect(function(){ console.log('network GONE.') })
PHONE.reconnect(function(){  console.log('network BACK!') })
```

### WebRTC Phone Unable to Initialize
##### `phone.unable(function(details){ ... })`

> Some devices or in certain situations the phone may not initialize.
We give you a simple callback for when the phone startup fails.

```javascript
phone.unable(function(details){
    console.log("Phone is unable to initialize.");
    console.log("Try reloading, or give up.");
});
```

### WebRTC Stop Camera and Mic
##### `phone.camera.stop()`

> You may want to Stop the Camera/Mic recording.
By default the camera and mic are turned on as soon as possible.
This allows for faster calling connection speeds.

```javascript
var streamref = phone.camera.stop();
```

### WebRTC Phone Debugging
##### `phone.debug(function(details){ ... })`

> You might want to see under the covers of WebRTC Calling by
enabling debugging mode on the WebRTC SDK.

```javascript
phone.debug(function(details){
     console.log(details);
});
```

### WebRTC Phone Auto Hangup and Goodbye on Unload

The WebRTC Calling SDK will attempt an automatic `goodbye` upon graceful
disconnection attempts.
This allows the 2nd party on the other end of the phone line to
receive a call `ended` signal.
This happens automatically.

### The WebRTC Session Object

A WebRTC Session represents the connection between two parties with access
to the `session.video` element as well as the place to register
event callbacks as needed such as `session.connected`
and also the ended callback for when the call disconnects or hangs up.

```javascript
session.ended(function(session){})
```

A session object is generated automatically for you upon dialing

```javascript
var session = phone.dial('...')
```

and also inside registered event callbacks.

```javascript
phone.receive(function(session){})
```

### WebRTC Session Number
##### `session.number`

> Returns the 2nd party's (caller/callee)
Phone Number associated with the Call Session.

```javascript
var session = phone.dial('12345');
console.log(session.number == '12345');
```

### WebRTC Session Connected Callback
##### `session.connected(function(session){})`

> Sets the callback for when the session is connected and
the **video** stream is ready to display.

```javascript
session.connected(function(session){
    var body = phone.$$('body')[0];
    body.appendChild(session.video);
});
```

### WebRTC Session Ended Callback
##### `session.ended(function(session){})`

> The session has ended by one of the parties.
Any secondary session will continue to stream.

```javascript
session.ended(function(session){
    sounds.play('sound/goodbye');
    console.log("Bye!");
});
```

### WebRTC Session Hangup
##### `session.hangup()`

> End the session right now.
The `ended` callback will fire for both connected parties.

```javascript
$("#hangup").click(function(){
    // End the call
    session.hangup();
});
```

### WebRTC Session Video Element
##### `session.video`

> The Session Video Element is Accessable and Ready
inside the `connected` only.
The Session Video ref is an HTML Video Element `<video>`.

```javascript
session.connected(function(session){
    var body  = phone.$$('body')[0];
    var video = session.video;

    body.appendChild(video);
});
```

### WebRTC Session Image Element
##### `session.image`

> The Session Image Element is Accessable and Ready
inside the `thumbnail`, `connected` and `ended` callbacks.
The Session Image ref is an HTML Image Element `<img>`.

```javascript
session.thumbnail(function(session){
    var body  = phone.$$('body')[0];
    var image = session.image;

    body.appendChild(image);
});
```

### WebRTC Session RTCPeerConnection Reference
##### `session.pc`

> Reference to WebRTC RTCPeerConnection.

```javascript
var sesionPeerConnection = session.pc;
```

### WebRTC Session Call Rejection and Accept Permissions
##### `phone.send`

> `phone.send` allows you to send programmatic messages 
> between two phones without a video/audio stream.
> You may wish to setup a Call Accept/Reject phase to 
> allow to users to accept or reject calls.

Before the Sending the Video/Audio Stream, 
send a signal to ask for call permission: 

```javascript
let user_number = "1235445"; // my friends number

function call_request(number) {
    phone.send( { "accept" : "Would you like to accept this call?" }, user_number );
}
function call_accepted() {
    // start voice/video session
    phone.dial(user_number);
}
function call_rejected() {
    // show call rejected screen
}
```

This allows you to create a simple contract between 
two parties before the video and audio stream begins.


### WebRTC Adding Custom STUN and TURN Servers

> You may desire to add your own custom stun or turn servers by using
the `servers` parameter on initialization.
For example http://xirsys.com/ offers paid-stun solution.

```javascript
var phone = PHONE({
    servers : [
        {"username":"free","url":"turn:127.0.0.1?transport=udp","credential":"free"},
        {"username":"free","url":"turn:127.0.0.1?transport=tcp","credential":"free"}
    ]
    // ...
})
```

## SDK Possible Upgrade Future Patches

    - Race - During Ring/Receive Handshake, a Hangup will create Race
    - Wire-pulled Disconnect Detect via DataChannels Pings
    - 5 Second Timeout to Retry with 30 Second of Retries
    - Auto-reconnect re-SDP/ICE Recovery
    - Custom Message Events
    - Presence
    - Call History
    - User Lists

## Implementation Reference Upgrades

    - Pre-Allow Transmit - Before "allow" fire a PubNub message
    - Chat on Screen
    - Multi-Party Video in GUI
    - Full Screen Mode
    - Controlling an iFrame

### What is Happens Inside the Simple WebRTC SDK

##### Signaling and Exchanging ICE Candidates via PubNub 

The goal is to exchange ICE candidate packets between two peers.
`ICE candidate packets` are structured payloads which contain possible
path recommendations between two peers.
You can use a lib which will take care of the nitty gritty such as
[WebRTC Simple Calling API + Mobile](https://github.com/stephenlb/webrtc-sdk)
however below is the general direction that is taken inside the SDK itself.

Note that the demonstration code below is intintionally incomplete.
Note however the PubNub WebRTC Signaling SDK properly covers
most Calling Situations.

#### Signaling Example Code Follows

```html
<script src="https://cdn.pubnub.com/pubnub-3.6.3.min.js"></script>
<script>(function(){
    
    // INIT P2P Packet Exchanger
    var pubnub = PUBNUB({
        publish_key   : 'demo',
        subscribe_key : 'demo',
        ssl           : true
    })
    
    // You need to specify the exchange channel for the peers to
    // exchange ICE Candidates.
    var exchange_channel = "p2p-exchange";
    
    // LISTEN FOR SDP and ICE CANDIDATES
    pubnub.subscribe({
        channel : exchange_channel,
        message : receive_ice_candidates
    })
    
    // SDP and ICE CANDIDATES RECEIVER PROCESSOR FUNCTION
    function receive_ice_candidates(ice_candidate) {
        // Attempt peer connection or upgrade route if better route...
        console.log(ice_candidate);
        // ... RTC Peer Connection upgrade/attempt ...
    }
    
    // SEND SDP and ICE CANDIDATES
    function send_ice_candidate(ice) {
        pubnub.publish({
            channel : exchange_channel,
            message : ice
        })
    }

})();</script>
```

#### Generate ICE Candidates Example Code Follows:

```html
<script>(function(){
    // CREATE ICE CANDIDATES
    var pc = new RTCPeerConnection();
    navigator.getUserMedia( {video: true}, function(stream) {
        pc.onaddstream({stream:stream});
        pc.addStream(stream);
        pc.createOffer( function(offer) {
            pc.setLocalDescription(
                new RTCSessionDescription(offer),
                send_ice_candidate,
                error
            );
        }, error );
    } );

})();</script>
```

### WebRTC Troubleshooting

You may need to force clear your cache on your device, close the app completley, then restart it.
This is uncommon.
You can also enable debugging at the code-level by hooking onto the `phone.unable(fn)` and `phone.debug(fn)`.

