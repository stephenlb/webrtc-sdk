PubNub WebRTC SDK - A simplified approach to RTC Peer Connections

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
