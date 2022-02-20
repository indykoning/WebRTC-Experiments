import AbstractRtcConnection from './AbstractRtcConnection';
/**
 * this class implements the socketIO server for negotiating.
 *
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

export default class SocketIoRtcConnection extends AbstractRtcConnection {
    afterConstructor(...args) {
        // An ice candidate came in!
        // Add it to the ice candidates.
        socket.on('candidate', (socketId, candidate) => {
            if (this.identifier !== socketId) return;
            this.rtc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // When we recieve an answer finish up the connection.
        socket.on('answer', (socketId, remoteDescription) => {
            if (this.identifier !== socketId) return;
            this.rtc.setRemoteDescription(remoteDescription);
        });

        // We recieved a connection offer, run the incoming script.
        socket.on('offer', (socketId, remoteDescription) => {
            if (this.identifier !== socketId) return;
            this.incomming(remoteDescription);
        });
    }

    sendCandidate(candidate)
    {
        socket.emit('candidate', this.identifier, candidate);

        return this;
    }

    sendOffer(localDescription)
    {
        socket.emit('offer', this.identifier, localDescription);

        return this;
    }

    sendAnswer(localDescription)
    {
        socket.emit('answer', this.identifier, localDescription);

        return this;
    }
}
