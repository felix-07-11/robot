<template>
    <v-container fluid fill-height>
        <v-row>
            <v-col>
                <v-alert type="warning">
                    An der Abbildung des Programmcodes mit einem Struktogramm
                    wird noch gearbeitet.
                </v-alert>
            </v-col>
        </v-row>
        <v-row justify="center">
            <v-col cols="10"><Main /></v-col>
        </v-row>
    </v-container>
    <!-- <div
        class="d-flex flex-column align-center justify-center pa-5"
        style="height: 100%; width: 100%"
    >
        <v-alert type="warning">
            An der Abbildung des Programmcodes mit einem Struktogramm wird noch
            gearbeitet.
        </v-alert>
    </div> -->
</template>

<script lang="ts">
import Vue from 'vue'
import Main from '@/components/structograms/Main.vue'

export default Vue.extend({
    components: {
        Main,
    },
})
</script>
