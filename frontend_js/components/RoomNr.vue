<template>
    <div>
        <b>Room:</b> {{$parent.roomNr}}
        <a :href="origin + '#' + $parent.roomNr">{{origin + '#' + $parent.roomNr}}</a>
    </div>
</template>
<script>
    import VueQrcode from 'vue-qrcode'

    export default {
        data: function()
        {
            return {
                origin: window.origin
            }
        },
        components: {
            VueQrcode,
        },
    }
</script>
