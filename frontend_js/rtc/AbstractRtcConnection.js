/**
 * This class handles the basics of the rtcConnection.
 * but it does not handle sending anything out via a server.
 *
 * This class is made to be extended by a class which handles
 * the sending of the candidates and localDescriptions.
 */

export default class AbstractRtcConnection {
    constructor(identifier, rtcConfig = null) {
        this.identifier = identifier;
        this.rtc = new RTCPeerConnection(rtcConfig);
        this.messageListeners = {};
        this.dataChannels = [];

        // If the datachannel is added or updated set the channel
        // and add an event listener to handle incoming messages.
        this.rtc.addEventListener('datachannel', (event) => {
            this.dataChannels[event.channel.label] = event.channel;
            event.channel.addEventListener('message', (event) => {
                this.handleIncommingMessage(event);
            });
        });

        // Once an ice candidate is available send to the other client
        // to negotiate.
        this.rtc.addEventListener('icecandidate', event => {
            if (event.candidate == null) return;
            this.sendCandidate(event.candidate);
        });

        this.afterConstructor(identifier, rtcConfig);
    }

    afterConstructor(...args)
    {
        // Execute after constructor
        return this;
    }

    sendCandidate(candidate)
    {
        // Send the candidate to the other peer.
        return this;
    }

    sendOffer(localDescription)
    {
        // Send the offer to the other peer.
        return this;
    }

    sendAnswer(localDescription)
    {
        // Send the anser to the other peer.
        return this;
    }

    // Set this rtcConnection as outgoing
    outgoing(dataChannels)
    {
        // Create a datachannel with name data.
        for (const idx in dataChannels) {
            let topic = dataChannels[idx];
            this.dataChannels[topic] = this.rtc.createDataChannel(topic);
        }

        // Send an offer to connect with the client.
        this.createAndSendOffer();

        return this;
    }

    // Create and send out a connection offer.
    createAndSendOffer()
    {
        this.rtc.createOffer().then(offer => {
            this.rtc.setLocalDescription(offer);
            this.sendOffer(this.rtc.localDescription);
        });

        return this;
    }

    // Set this rtcConnection as incomming
    incomming(remoteDescription)
    {
        // Add their remote description
        this.rtc.setRemoteDescription(remoteDescription);

        // Send an answer to the player who initialised this connection.
        this.rtc.createAnswer().then(answer => {
            this.rtc.setLocalDescription(answer);
            this.sendAnswer(this.rtc.localDescription)
        });

        return this;
    }

    // Emit a message to the topic.
    emit(topic, ...args)
    {
        if (!this.dataChannels[topic]) {
            this.dataChannels[topic] = this.rtc.createDataChannel(topic);
            this.dataChannels[topic].addEventListener('message', (event) => {
                this.handleIncommingMessage(event);
            });
        }

        const message = JSON.stringify(args);

        if (this.dataChannels[topic].readyState === 'open') {
            this.dataChannels[topic].send(message);
        } else {
            this.dataChannels[topic].addEventListener('open', (event) => {
                this.dataChannels[topic].send(message);
            });

            this.createAndSendOffer();
        }

        return this;
    }

    // Register a callback when a message has
    // been received on the topic.
    on(topic, callback)
    {
        if (!this.messageListeners[topic])
        {
            this.messageListeners[topic] = [];
        }

        this.messageListeners[topic].push(callback);

        return this;
    }

    // Decode the incomming event and call the listeners.
    handleIncommingMessage(event)
    {
        const topic = event.target.label;
        if (!this.messageListeners.hasOwnProperty(topic)) {
            return;
        }
        const response = JSON.parse(event.data);

        for (const idx in this.messageListeners[topic]) {
            this.messageListeners[topic][idx](...response);
        }
    }
}
