# What is WebRTC?

![What is WebRTC](http://stephenlb.github.io/webrtc-sdk/blogs/webrtc-overview.png)

WebRTC is a big bundle of open source technology.
Are you planning on building Skype-like apps on web and mobile iOS/Android?
WebRTC makes it easy for you to create new types of 
**communications apps** which require Audio or Video streaming.
Even better WebRTC allows you to connect two users Peer-to-Peer.
This style of connectivity is phenomenal for *business saving* 
on the traditional middle-man server bandwidth costs.
The full WebRTC package includes P2P, Data Streaming, Video and Audio Codecs 
for transmission of live conversations between one or more peers.
WebRTC also includes the **mechanisms for P2P (Peer-to-Peer)** connectivity via common STUN
to generate network topology route ICE candidates (Interactive Connectivity Establishment).

> [What is WebRTC Video Intro](https://vimeo.com/108532169)

```
<iframe 
src="//player.vimeo.com/video/108532169?title=0&amp;byline=0&amp;portrait=0" 
width="690" 
height="388" 
frameborder="0" 
webkitallowfullscreen 
mozallowfullscreen 
allowfullscreen></iframe>
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
[High-replication Signaling via Data Streams](http://www.pubnub.com/how-it-works/data-streams/), 
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

Those are some of the basics.
But you'll want to use a lot more features that are documented on the 
[GitHub WebRTC Documentation](https://github.com/stephenlb/webrtc-sdk/blob/gh-pages/README.md) 
readme file.
Some extra features include **Multi-party Calling** and a 
simple `phone.hangup()` disconnect session method when 
you're done with your conversation.

# WebRTC Live Demo

> View the [Live WebRTC Calling App Demo](http://stephenlb.github.io/webrtc-sdk/)

A WebRTC SDK implementation reference has been built for you to help surface
some of the SDK feature use cases.
You may be interested in the insta-frame snapshot feature which allows
you to transmit and capture the raw
image video feed output into an `<img>` DOM element.
Or you may want to know how WebRTC Dialing has been simplified for you.

[![WebRTC Live Calling App](http://stephenlb.github.io/webrtc-sdk/blogs/webrtc-demo.gif)](http://stephenlb.github.io/webrtc-sdk/)

We've created a simple dialer and reciever app that works on Android and WebRTC Supported browsers.
This app demonstrates some of the **WebRTC SDK capabilities** including some of the following WebRTC Features:

 1. Photo Snap Camera Transmit             *(STUN-less Firewall Ready)*
 1. WebRTC Dialing                         *(STUN-less Firewall Ready)*
 1. WebRTC Call Receiving                  *(STUN-less Firewall Ready)*
 1. JSON App Messaging (chat/signals/etc.) *(STUN-less Firewall Ready)*
 1. Broadcasting Mode
 1. Instant Connect Dialing
 1. Security SSL, AES256, ACL Access Control Management
 1. Password Protection via Cipher
 1. Connectivity Detection and Auto-Recovery
 1. Pre-configured Video Element for Streaming Video/Audio
 1. Pre-configured Local Camera Video Element for Streaming Video/Audio
 1. Network Connectivity Hooks (online/offline)
 1. SDK Level Debug Output


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
 7. Facetime
 8. In-bound Sales Calls
 9. Easy Remote Meetings
 10. Call Assistant or Specialists
 11. Big Screen Public Announcemnt
 12. Live Presentations

There are many applications for WebRTC with more to be discovered soon.
With the wide-spread support and availability of WebRTC on the web and full mobile support
there's good reason to get started with WebRTC as your voice/video streaming solution
for users who will be communicating in realtime.
From **WebRTC Screen Sharing** to **WebRTC Facetime** the applications to build for user connectivity
seem to be in the boundless realm.

## WebRTC Resources and SDK Links

 1. Download: [ZIP Download WebRTC SDK](https://github.com/stephenlb/webrtc-sdk/archive/gh-pages.zip)
 1. GitHub: [GitHub Repository for WebRTC SDK](https://github.com/stephenlb/webrtc-sdk/) 
 1. Documentation: [GitHub WebRTC Documentation](https://github.com/stephenlb/webrtc-sdk/blob/gh-pages/README.md) 
 1. Video: [What is WebRTC Video Introduction](https://vimeo.com/108532169)
 1. Demo: [WebRTC Live Calling App Demo](http://stephenlb.github.io/webrtc-sdk/)
