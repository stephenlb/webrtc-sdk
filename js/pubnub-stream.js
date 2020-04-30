(async ()=>{ 
'use strict';

const PubNub = window.PubNub = (setup) => {
    for (let key of Object.keys(setup)) PubNub[key] = setup[key];
};

const defaultSubkey  = 'demo';
const defaultPubkey  = 'demo';
const defaultChannel = 'pubnub';
const defaultOrigin  = 'ps.pndsn.com';

const subscribe = PubNub.subscribe = (setup={}) => {
    let subkey     = setup.subkey     || PubNub.subscribeKey || defaultSubkey;
    let channel    = setup.channel    || PubNub.channel      || defaultChannel;
    let origin     = setup.origin     || PubNub.origin       || defaultOrigin;
    let messages   = setup.messages   || PubNub.messages     || (a => a);
    let authkey    = setup.authkey    || PubNub.authKey      || '';
    let timetoken  = setup.timetoken  || '0';
    let params     = `${authkey?'auth='+authkey:''}`;
    let decoder    = new TextDecoder();
    let boundry    = /(?<=,"\d{17}"\])[\n,]*/;
    let resolver   = null;
    let promissory = () => new Promise(resolve => resolver = (data) => resolve(data) ); 
    let receiver   = promissory();
    let reader     = null;
    let response   = null;
    let buffer     = '';
    let subscribed = true;

    // Start Stream
    startStream();

    async function startStream() {
        let uri = `https://${origin}/stream/${subkey}/${channel}/0/${timetoken}`;
        buffer  = '';

        try      { response = await fetch(`${uri}?${params}`) }
        catch(e) { return continueStream(1000)                }

        try      { reader = response.body.getReader() }
        catch(e) { return continueStream(1000)        }

        try      { readStream()                       }
        catch(e) { return continueStream(1000)        }
    }

    function continueStream(delay) {
        if (!subscribed) return;
        setTimeout( () => startStream(), delay || 1000 );
    }

    async function readStream() {
        let chunk   = await reader.read().catch(continueStream);
        if (!chunk) return;

        buffer     += decoder.decode(chunk.value || new Uint8Array);
        let parts   = buffer.split(boundry);
        let message = parts[0];

        try {
            let jsonmsg     = JSON.parse(message);
            setup.timetoken = timetoken = jsonmsg[1];

            jsonmsg[0].forEach(m => {
                messages(m);
                resolver(m);
                receiver = promissory();
            });

            buffer = parts.slice(1).join('');
        }
        catch(error) {
            // Typically chunk is unfinished JSON in buffer.
            // console.error(error);
        }

        if (!chunk.done) readStream();
        else             continueStream(10);
    }

    // Subscription Structure
    async function* subscription() {
        while (subscribed) yield await receiver;
    }

    subscription.messages    = receiver => messages = setup.messages = receiver;
    subscription.unsubscribe = () => subscribed = false;

    return subscription;
};

const publish = PubNub.publish = async (setup={}) => {
    let pubkey    = setup.pubkey     || PubNub.publishKey   || defaultPubkey;
    let subkey    = setup.subkey     || PubNub.subscribeKey || defaultSubkey;
    let channel   = setup.channel    || PubNub.channel      || defaultChannel;
    let origin    = setup.origin     || PubNub.origin       || defaultOrigin;
    let authkey   = setup.authkey    || PubNub.authKey      || '';
    let message   = setup.message    || 'missing-message';
    let uri       = `https://${origin}/publish/${pubkey}/${subkey}/0/${channel}/0`;
    let params    = `${authkey?'auth='+authkey:''}`;
    let payload   = { method: 'POST', body: JSON.stringify(message) };

    try      { return await fetch(`${uri}?${params}`, payload) }
    catch(e) { return false }
};

})();
