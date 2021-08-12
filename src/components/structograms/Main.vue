<template>
    <div
        style="width: 100%; height: 100%"
        class="d-flex flex-column justify-center main"
    >
        <div class="part py-1">Programm</div>
        <div class="part d-flex flex-column">
            <component
                v-for="(child, i) in children"
                :key="i"
                :is="
                    child.type === 'call'
                        ? 'Call'
                        : child.type === 'for'
                        ? 'For'
                        : 'div'
                "
                :value="child.value"
                class="child"
            ></component>
        </div>
        <div class="part py-1" style="height: 24px"></div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Call from './Call.vue';
import For from './For.vue';

export default Vue.extend({
    components: {
        Call,
        For,
    },
    props: {
        children: {
            type: Array,
            default: () => [
                { type: 'call', value: 'schritt' },
                { type: 'call', value: 'links drehen' },
                { type: 'call', value: 'schritt' },
                { type: 'for', value: '5' },
            ],
        },
    },
});
</script>

<style lang="sass">
.main
    border: 1px solid black

    .part
        margin-left: 30px
        position: relative
        .child
            border-left: 1px solid black
            border-top: 1px solid black
            &:last-child
                border-bottom: 1px solid black
</style>
