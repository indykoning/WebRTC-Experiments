/**
 * Usage:
 *
 * Create new connection
 * let sock = new SocketIoRtcConnection(socketId).outgoing();
 *
 * Create new connection when connection is incoming
 * let sock = new SocketIoRtcConnection(socketId).incomming(remoteDescription);
 *
 * Respond to an incomming message on a topic
 * outgoingSocksock.on('test', console.log);
 *
 * Send out a message on a topic
 * sock.emit('test', 'test', [123]);
 */

export default class SocketIoRtcConnection {
    constructor(socketId, rtcConfig = null) {
        this.socketId = socketId;
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
            socket.emit('candidate', this.socketId, event.candidate);
        });

        // An ice candidate came in!
        // Add it to the ice candidates.
        socket.on('candidate', (socketId, candidate) => {
            if (this.socketId !== socketId) return;
            this.rtc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // When we recieve an answer finish up the connection.
        socket.on('answer', (socketId, remoteDescription) => {
            if (this.socketId !== socketId) return;
            this.rtc.setRemoteDescription(remoteDescription);
        });

        // We recieved a connection offer, run the incoming script.
        socket.on('offer', (socketId, remoteDescription) => {
            if (this.socketId !== socketId) return;
            this.incomming(remoteDescription);
        });
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
        this.sendOffer();

        return this;
    }

    sendOffer()
    {
        // Create and send out a connection offer.
        this.rtc.createOffer().then(offer => {
            this.rtc.setLocalDescription(offer);
            socket.emit('offer', this.socketId, this.rtc.localDescription);
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
            socket.emit('answer', this.socketId, this.rtc.localDescription);
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

            this.sendOffer();
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
