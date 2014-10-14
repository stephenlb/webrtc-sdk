# What is WebRTC?

WebRTC is a big bundle of open source technology.
Are you planning on building Skype on web and mobile iOS/Android?
WebRTC makes it easy for you to create new types of 
**communications apps** which require Audio or Video streaming.
Even better WebRTC allows you to connect two users Peer-to-Peer.
This style of connectivity is phenomenal for *business saving* 
on the tranditional middle-man server bandwidth costs.
The full WebRTC package includes P2P, Data Streaming, Video and Audio Codecs 
for transmission of live conversations between one or more peers.
WebRTC also includes the **mechanisms for P2P (Peer-to-Peer)** connectivity via common STUN
to generate network topology route ICE candidates (Interactive Connectivity Establishment).

```
<iframe src="//player.vimeo.com/video/108532169?title=0&amp;byline=0&amp;portrait=0" width="690" height="388" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
```


## Is **WebRTC Easy** to use for Developing Mobile and Web Apps?

Yes **WebRTC is easy to use** and great for Mobile and Web App development.
But it is even easier to use for mobile and web apps if you use our WebRTC SDK.
We built a **[WebRTC SDK](https://github.com/stephenlb/webrtc-sdk/)** for you to make it super easy.
At PubNub we believe simplicity is essential for our SDK usability.
We've taken a simplified approach to WebRTC Peer Connections by creating
and easy-to-use SDK for developers.
Simplicity should be included in all platforms and devices.
That's why we support **Android** WebRTC mobile calling
with compatibility for iOS native Objective-C based WebRTC SDK.
Our simple free developer WebRTC SDK is powered by
[PubNub Data Stream Network](http://www.pubnub.com/) for 
[High-replication Signalling via Data Streams](http://www.pubnub.com/how-it-works/data-streams/), 
[Call Presence Connectivity Detection](http://www.pubnub.com/how-it-works/presence/), 
[Phone API for Push Notifications](http://www.pubnub.com/how-it-works/mobile-push/), 
[Call Event Logging Storage and Playback](http://www.pubnub.com/how-it-works/storage-and-playback/) and
[Call Access Control Management](http://www.pubnub.com/how-it-works/access-manager/).

## WebRTC SDK for Voice and Video Calling

The basics of WebRTC Voice and Video calling has been simplified for your mobile app development ease.
We've created simple calling methods which match that of a standard **telephony calling systems**.
Use the `phone.dial()` method for starting a call and `phone.receive()` method to receive the call.

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

##### Adding Voice and Video Live Stream

```javascript
phone.receive(function(session){
    session.connected(function(session){
        // Append Live Video and Voice Feed
        $('#display-div').append(session.video);
    });
});
```

# Demo and Details

GIF GIF!!!

# What can you Build with WebRTC?


