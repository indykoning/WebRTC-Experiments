window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
var io = require("socket.io-client");
window.socket = io('localhost:3000');
require('./rtc');
Vue.component('login', {
    render() {
        return this.$scopedSlots.default({
            joined: this.joined,
            joinRoom: this.joinRoom,
        })
    },
    data: function () {
        return {
            joined: false
        }
    },
    methods: {
        joinRoom: function () {
            this.$parent.socket.emit('join', {'roomNr': this.$parent.roomNr});
            this.joined = true;
        }
    },
    template: '<div><slot></slot></div>',
    mounted: function () {
        console.log(this.$parent.socket);
    }
});

Vue.component('room-nr', {
    template: '<div><slot></slot></div>'
});

let app = new Vue({
  el: '#app',
  data: {
    socket: socket,
    roomNr: '0000', //Math.round(Math.random() * 10000),
    name: '',
    connections: '',
  }
})

// function joinRoom(roomNr)
// {
//     socket.emit('joinRoom', {'roomNr': roomNr});
//     window.roomNr = roomNr;
// }

// socket.on('playerJoined', (data) => {
//     console.log(data);
// });

// let createRoomButton = document.getElementById('create-room');
// createRoomButton.addEventListener('click', () => {
//     createRoom();
// });

// document.getElementById('join-room').addEventListener('click', () => {
//     joinRoom(document.getElementById('room-nr').value);
// });
