import SocketIoRtcConnection from './rtc/SocketIoRtcConnection';
window.rtcConnections = [];

// Someone new joined, create connection to them.
socket.on('joined', (socketId) => {
    if (socketId === socket.id) {
        return;
    }
    const conn = new SocketIoRtcConnection(socketId).outgoing();

    conn.dataChannel.addEventListener('message', dataChannelRecieved);

    window.rtcConnections[socketId] = conn;
});

// Someone sent us an offer, create a connection and accept the offer.
socket.on('offer', (socketId, remoteDescription) => {
    const conn = new SocketIoRtcConnection(socketId).incomming(remoteDescription);

    conn.rtc.addEventListener('datachannel', (event) => {
        event.channel.addEventListener('message', dataChannelRecieved);
    });

    window.rtcConnections[socketId] = conn;
});


function dataChannelRecieved(messageEvent)
{
    const message = JSON.parse(messageEvent.data);
    console.log(message);
}

window.broadcastMessage = function(message) {
    for (const socketId in window.rtcConnections) {
        window.rtcConnections[socketId].sendMessage(message);
    }
}

