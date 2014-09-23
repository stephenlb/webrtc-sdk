# WebRTC Simple Calling API + Mobile

At PubNub we believe in simplicity of our SDK usability.
We've taken a simplified approach to WebRTC Peer Connections by creating
and easy-to-use SDK for developers.
These ideas should span all platforms and devices too and
that's why we also support **Android** WebRTC mobile calling
with compatibility for iOS native Objective-C based WebRTC SDK.
This simple developer WebRTC SDK is powered by
[PubNub Data Stream Network](http://www.pubnub.com/).

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

Making a WebRTC phone call.

```javascript
// Dial Number
var session = phone.dial('123-456');
```

Receiving a WebRTC phone call.

```javascript
phone.receive(function(session){
    // On Call Receiving
});
```

### Simple WebRTC Walkthrough

Next we will start with a copy/paste example of our SDK.
This Simple Example Comes in **Two WebRTC Calling Sections**.

 1. *Part One* will talk about how you can **Make a WebRTC Call**.
 2. *Part Two* will teach you about **Receiving a WebRTC Call**.

#### Making a WebRTC Call - *Part One*

Make your first html file named `dial.html` and copy/paste the following:

```html
<!-- dial.html -->

<!-- Video Output Zone -->
<div id="video-out"> Making a Call </div>

<!-- Libs and Scripts -->
<script src="https://cdn.pubnub.com/pubnub.min.js"></script>
<script src="http://stephenlb.github.io/webrtc-sdk/js/webrtc.js"></script>
<script>(function(){

    // Initialize the Phone
    // The phone number can by any string value

    // ~Warning~ For simplicity this example uses demo API Keys.
    // ~Warning~ You must get your own API Keys for non-demo purposes.
    // ~Warning~ This document will later describe where to get your API Keys.

    var phone = PHONE({
        number        : '1234',
        publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c',
        subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe',
        ssl           : true
    });

    // As soon as the phone is ready we can make calls
    phone.ready(function(){

        // Dial a Number and get the Call Session
        var session = phone.dial('4321');

        // Call Connected
        session.connected(function(session){

            // Display Your Friend's Live Video
            PUBNUB.$('video-out').appendChild(session.video);

        });

    });

})();</script>
```

#### Receiving a WebRTC Call - *Part Two*

Make a Second Page called `receive.html` and copy/paste the following.

```html
<!-- receive.html -->

<!-- Video Output Zone -->
<div id="video-out"> Waiting for Call </div>

<!-- Libs and Scripts -->
<script src="https://cdn.pubnub.com/pubnub.min.js"></script>
<script src="http://stephenlb.github.io/webrtc-sdk/js/webrtc.js"></script>
<script>(function(){

    // Initialize the Phone
    // The phone number can by any string value

    // ~Warning~ For simplicity this example uses demo API Keys.
    // ~Warning~ You must get your own API Keys for non-demo purposes.
    // ~Warning~ This document will later describe where to get your API Keys.

    var phone = PHONE({
        number        : '4321',
        publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c',
        subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe',
        ssl           : true
    });

    // When someone calls you
    phone.receive(function(session){

        // Session Connected
        session.connected(function(session){

            // Display Your Friend's Live Video
            PUBNUB.$('video-out').appendChild(session.video);

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
[WebRTC Simple Calling API + Mobile](http://stephenlb.github.io/webrtc-sdk/)

[![WebRTC Simple Calling API + Mobile](http://pubnub.s3.amazonaws.com/assets/webrtc-simple-sdk-calling-api-peer-connect.png)](http://stephenlb.github.io/webrtc-sdk/)

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

### WebRTC Phone SSL Mode

> You can enable SSL signalling mode for the local client device
by setting the `ssl : true` paramater at init.

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
out-of-the-box today without modifications or addtional code.
Also WebRTC Calling is supported for Android and iOS Native too.


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
WebRTC Session object as the only paramater.

```javascript
phone.receive(function(session){
    session.connected(function(session){ /* call connected */ });
    session.ended(function(session){     /* call ended     */ });
});
```

### WebRTC Phone Dialing Numbers
##### `phone.dial(number)`

> You can easily make WebRTC calls by executing the `dail()` method.
The number can be any string value such as `"415-555-5555"`.

```javascript
var session = phone.dial(number);

session.connected(function(session){ /* call connected */ });
session.ended(function(session){     /* call ended     */ });
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
    session.connected(function(session){ /* call connected */ });
    session.ended(function(session){     /* call ended     */ });
});
```

### WebRTC Phone Broadcasting Mode
##### `phone.receive(function(session){ ... })`

> You can receive unlimited inbound calls and become a broadcast
beacon stream.
You are limited by your bandwidth upload capacity.

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
##### `THETHING`

> THEDETAILS.

```javascript
THEJS
```

### WebRTC Phone Unable to Initialize
##### `THETHING`

> THEDETAILS.

```javascript
THEJS
```

### WebRTC Phone Debugging
##### `THETHING`

> THEDETAILS.

```javascript
THEJS
```

### WebRTC Phone Auto Hangup and Goodbye on Unload
##### `THETHING`

> THEDETAILS.

```javascript
THEJS
```


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
    var body = document.getElementsByTagName('body')[0];
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
    var body  = document.getElementsByTagName('body')[0];
    var video = session.video;

    body.appendChild(video);
});
```

### WebRTC Session RTCPeerConnection Reference
##### `session.pc`

> Reference to WebRTC RTCPeerConnection.

```javascript
var sesionPeerConnection = session.pc;
```



# TODOs

## SDK Upgrade TODOs

    - Wire-pulled Disconnect Detect via DataChannels Pings
    - 5 Second Timeout to Retry with 30 Second of Retries
    - Auto-reconnect re-SDP/ICE Recovery
    - Custom Message Events
    - Presence
    - Call History
    - User Lists
    - 
    - 

## Implementation Reference TODOs

    - Pre-Allow Transmit - Before "allow" fire a pubnub message
    - Chat
    - Multi-Party Video
    - Full Screen
    - Controlable iFrame

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
<script src="http://cdn.pubnub.com/pubnub-3.6.3.min.js"></script>
<script>(function(){
    
    // INIT P2P Packet Exchanger
    var pubnub = PUBNUB({
        publish_key   : 'demo',
        subscribe_key : 'demo'
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

