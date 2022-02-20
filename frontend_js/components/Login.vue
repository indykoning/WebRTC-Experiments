<template>
    <div>
        <div v-show="!joined">
            <b>Room:</b><input v-model="$parent.roomNr" type="text" id="room-nr"/>
            <b>Name:</b><input v-model="$parent.name" type="text" id="name"/>
            <input class="btn bg-blue" v-on:click="joinRoom" type="button" id="join-room" value="Join Room"/>
        </div>
    </div>
</template>
<script>
    export default {
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
        }
    }
</script>
