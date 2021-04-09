export default class SocketIoRtcConnection {
    constructor(socketId, rtcConfig = null) {
        this.socketId = socketId;
        this.rtc = new RTCPeerConnection(rtcConfig);
        this.dataChannelLabel = 'data';
        this.dataChannel = null;

        // If the datachannel is added or updated set the channel.
        this.rtc.addEventListener('datachannel', (event) => {
            if (event.channel.label !== this.dataChannelLabel) return;
            this.dataChannel = event.channel;
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
    }

    // Set this rtcConnection as outgoing
    outgoing()
    {
        // Create a datachannel with name data.
        this.dataChannel = this.rtc.createDataChannel(this.dataChannelLabel);

        // Create and send out a connection offer.
        this.rtc.createOffer().then(offer => {
            this.rtc.setLocalDescription(offer);
            socket.emit('offer', this.socketId, this.rtc.localDescription);
        });

        // When we recieve an answer finish up the connection.
        socket.on('answer', (socketId, remoteDescription) => {
            if (this.socketId !== socketId) return;
            this.rtc.setRemoteDescription(remoteDescription);
        });

        return this;
    }

    // Set this rtcConnection as incomming
    incomming(remoteDescription)
    {
        // Add their remote description
        this.rtc.setRemoteDescription(remoteDescription);

        // send a counter offer (answer) to the player who initialised this connection.
        this.rtc.createAnswer().then(answer => {
            this.rtc.setLocalDescription(answer);
            socket.emit('answer', this.socketId, this.rtc.localDescription);
        });

        return this;
    }

    sendMessage(message)
    {
        if (typeof message !== 'object')
        {
            message = {'message': message};
        }

        message["socketId"] = this.socketId;
        this.dataChannel.send(JSON.stringify(message));
    }
}
