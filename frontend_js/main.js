window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
var io = require("socket.io-client");
window.socket = io('localhost:3000');
require('./rtc');
var Vue = require('vue');

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
            socket.emit('join', {'roomNr': this.$parent.roomNr});
            this.joined = true;
        }
    },
    template: '<div><slot></slot></div>'
});

Vue.component('room-nr', {
    template: '<div><slot></slot></div>'
});

let app = new Vue({
  el: '#app',
  data: {
    roomNr: '0000', //Math.round(Math.random() * 10000),
    name: '',
  }
});
