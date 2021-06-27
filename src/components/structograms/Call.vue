<template>
    <div class="py-1" style="padding-left: 30px">{{ value }}</div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    props: {
        value: {
            type: String,
            default: 'Schritt',
        },
    },
})
</script>
