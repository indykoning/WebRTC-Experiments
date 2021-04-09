window.rtcConnections = [];

socket.on('joined', (socketId) => {
    if (socketId === socket.id) {
        return;
    }
    // A player joined, create a new connection in order
    // to connect with them
    const outgoingConnection = new RTCPeerConnection();
    // Create a datachannel to send and recieve messages
    const dataChannel = outgoingConnection.createDataChannel('data');
    dataChannel.addEventListener('message', dataChannelRecieved);

    // Send available ice candidates to the other player
    outgoingConnection.onicecandidate = event => {
        if (event.candidate == null) return;
        socket.emit('candidate', socketId, event.candidate);
    }

    // Create a connection offer and send this to the new player
    outgoingConnection.createOffer().then(offer => {
        outgoingConnection.setLocalDescription(offer);
        socket.emit('offer', socketId, outgoingConnection.localDescription);
    });
    window.rtcConnections[socketId] = {connection: outgoingConnection, dataChannel: dataChannel};
});

socket.on('candidate', (socketId, candidate) => {
    window.rtcConnections[socketId].connection.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('offer', (socketId, remoteDescription) => {
    // Someone sent a connection offer prepare a connection
    // for them to hook on to
    const incommingConnection = new RTCPeerConnection();

    // Add their data channel to send and recieve messages
    incommingConnection.ondatachannel = (event) => {
        window.rtcConnections[socketId]['dataChannel'] = event.channel;
        event.channel.addEventListener('message', dataChannelRecieved);
    };

    // Send available ice candidates to the other player
    incommingConnection.onicecandidate = event => {
        if (event.candidate == null) return;
        socket.emit('candidate', socketId, event.candidate);
    }

    // Add their remote description
    incommingConnection.setRemoteDescription(remoteDescription);

    // send a counter offer (answer) to the player who initialised this connection.
    incommingConnection.createAnswer().then(answer => {
        incommingConnection.setLocalDescription(answer);
        socket.emit('answer', socketId, incommingConnection.localDescription);
    });
    window.rtcConnections[socketId] = {connection: incommingConnection, dataChannel: null};
});

socket.on('answer', (socketId, remoteDescription) => {
    window.rtcConnections[socketId].connection.setRemoteDescription(remoteDescription);
});

function dataChannelRecieved(messageEvent)
{
    const message = JSON.parse(messageEvent.data);
    console.log(message);
}

window.broadcastMessage = function(message) {
    if (typeof message !== 'object')
    {
        message = {'message': message};
    }
    message["socketId"] = socket.id;
    for (const socketId in window.rtcConnections) {
        window.rtcConnections[socketId].dataChannel.send(JSON.stringify(message));
    }
}
