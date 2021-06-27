<template>
    <div class="d-flex flex-column justify-center for">
        <div class="py-1" style="padding-left: 30px">
            Wiederhole {{ value }} mal
        </div>
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
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Call from './Call.vue'

export default Vue.extend({
    name: 'For',
    components: {
        Call,
    },
    props: {
        value: {
            type: String,
            default: '0',
        },
        children: {
            type: Array,
            default: () => [
                { type: 'call', value: 'schritt' },
                { type: 'call', value: 'links drehen' },
                { type: 'call', value: 'schritt' },
            ],
        },
    },
})
</script>

<style lang="sass">
.for
    .part
        .child
            &:last-child
                border-bottom: none !important
</style>
