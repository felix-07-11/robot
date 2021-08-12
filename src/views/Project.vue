<template>
    <div></div>
</template>

<script lang="ts">
import PathSystem from '@/assets/PathSystem';
import Vue from 'vue';
export default Vue.extend({
    async mounted() {
        const ps = new PathSystem();

        await ps.createFile('test.rs', 'text/robotscript', '// Test');

        console.log(ps);
    },
});
</script>
