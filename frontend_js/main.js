window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
var io = require("socket.io-client");
window.socket = io('localhost:3000');
require('./rtc');
var Vue = require('vue');
import '../css/style.css';

const files = require.context('./components/', true, /\.vue$/i)
files.keys().map(key => {Vue.component(key.split('/').pop().split('.')[0], files(key).default)})

let app = new Vue({
  el: '#app',
  data: {
    roomNr: window.location.hash.substring(1) ? window.location.hash.substring(1) : Math.round(Math.random() * 10000),
    name: '',
  }
});
