import SocketIoRtcConnection from './rtc/SocketIoRtcConnection';
window.rtcConnections = [];

// Someone new joined, create connection to them.
socket.on('joined', (socketId) => {
    if (socketId === socket.id) {
        return;
    }
    console.log('new socket joined!', socketId);
    const conn = new SocketIoRtcConnection(socketId).outgoing();

    addTestChannelListener(conn);

    window.rtcConnections[socketId] = conn;
});

// Someone sent us an offer, create a connection and accept the offer.
socket.on('offer', (socketId, remoteDescription) => {
    // Don't create a new connection for an existing connection.
    if (window.rtcConnections[socketId]) {
        return;
    }
    const conn = new SocketIoRtcConnection(socketId).incomming(remoteDescription);

    addTestChannelListener(conn);

    window.rtcConnections[socketId] = conn;
});

function addTestChannelListener(conn)
{
    console.log(conn.on('test', console.log));
}

function dataChannelRecieved(messageEvent)
{
    const message = JSON.parse(messageEvent.data);
    console.log(message);
}

window.broadcastMessage = function(topic, ...message) {
    for (const socketId in window.rtcConnections) {
        window.rtcConnections[socketId].emit(topic, ...message);
    }
}

