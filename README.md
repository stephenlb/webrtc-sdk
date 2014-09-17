# WebRTC Simple Calling API + Mobile

At PubNub we believe in simplicity of our SDK usability.
We've taken a simplified approach to WebRTC Peer Connections by creating
and easy-to-use SDK for developers.
These ideas should span all platforms and devices too and
that's why we also support **Android** WebRTC mobile calling
with compatibility for iOS native Objective-C based WebRTC SDK.
Here we will start with a copy/paste example of our SDK.

### Simple Example Walkthrough

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
    var phone = PHONE({ number : '1234' });

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
    var phone = PHONE({ number : '4321' });

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

### Full Live Example

We have a live running WebRTC Demo which uses our WebRTC SDK.
This demo includes a soft-touch UI for an easy calling experience.

> try the **live WebRTC demo**:
[WebRTC Simple Calling API + Mobile](http://stephenlb.github.io/webrtc-sdk/)




TODOs
    -  supported devices list ios android chrom operaff
    - live demo ready to try
    - full SESSION and PHONE docs
    - idea section
    - getn your pubnub keys
    - landing page
    - add pubnub logo to demo
    - enable SSL
    - mobile Calling
    - 
    - 
    - 
    - 
    - 
    - 
    - 
    - 

PubNub WebRTC SDK - A 

                <li> SOS Button - Help! (Mayday)
                <li> instant calling
                <li> skype
                <li> Chatroulette
                <li> insta call (this demo is insta call)
                <li> announce board - (locked announc screen)
                <li> Dial Pad
                <li> friend list
                <li> sales calls
                <li> customer contact questions
                <li> remote meetings
                <li> live presentations
                <li> live specialist advice center
                <li> 
                <li> 

[PubNub](http://www.pubnub.com/)


Most people will look down on place holder answers...Please answer fully when you have a full answer... –  Benjamin Trent Jun 20 at 20:08
1	 	
Agreed! :-) Got side tracked and it's updated above, answer is in better shape now. –  PubNub Jun 21 at 2:10    
  	
 		
THank you! This is extremely helpful :D –  JerryFox Jun 21 at 21:06
  	
 		
Do you know if pubunb could handle 10k+ peers trying to connect to a single broadcast at the same time? –  JerryFox Jun 21 at 21:07
1	 	
@JerryFox - Yes! :-) PubNub today has peaked over 3 million broadcast for single broadcast on a channel. In a pool of over quarter billion devices connected. –  PubNub Jun 23 at 17:59    


# WebRTC Signaling Exchanging ICE Candidates via PubNub 

The goal is to exchange ICE candidate packets between two peers. `ICE candidate packets are structured payloads which contain possible path recommendations between two peers.`  You can use a lib which will take care of the nitty gritty such as http://www.sinch.com/ and below is the general direction you want to take:

### Signaling Example Code Follows

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
        
        // LISTEN FOR ICE CANDIDATES
        pubnub.subscribe({
            channel : exchange_channel,
            message : receive_ice_candidates
        })
        
        // ICE CANDIDATES RECEIVER PROCESSOR FUNCTION
        function receive_ice_candidates(ice_candidate) {
            // Attempt peer connection or upgrade route if better route...
            console.log(ice_candidate);
            // ... RTC Peer Connection upgrade/attempt ...
        }
        
        // SEND ICE CANDIDATE
        function send_ice_candidate(ice) {
            pubnub.publish({
                channel : exchange_channel,
                message : ice
            })
        }


### Generate ICE Candidates Example Code Follows:

        // CREATE ICE CANDIDATES
        var pc = new RTCPeerConnection();
        navigator.getUserMedia( {video: true}, function(stream) {
            pc.onaddstream({stream:stream});
            pc.addStream(stream);
            pc.createOffer( function(offer) {
                pc.setLocalDescription(
                    new RTCSessionDescription(offer),
                    send_ice_candidate, // - SEND ICE CANDIDATE via PUBNUB
                    error
                );
            }, error );
        } );
        
        // ERROR CALLBACK
        function error(e) {
            console.log(e);
        }
    })();</script>


More fun details await - https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
