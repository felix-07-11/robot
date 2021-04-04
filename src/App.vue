<template>
    <v-app>
        <v-main>
            <v-toolbar color="blue darken-1" dark>
                <v-toolbar-title>Robot</v-toolbar-title>

                <v-spacer></v-spacer>

                <v-menu v-if="platform === 'other'" offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn dark v-bind="attrs" v-on="on">
                            Installieren
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item link>
                            <v-list-item-icon>
                                <svg
                                    style="width: 20px; height: 20px"
                                    viewBox="0 0 24 24"
                                    class="ml-2"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M12 22C10.33 22 8.84 20.5 7.9 17.93C7.83 17.73 7.93 17.5 8.14 17.44C8.34 17.36 8.56 17.47 8.63 17.67C9.44 19.9 10.7 21.23 12 21.23C12.94 21.23 13.87 20.55 14.62 19.31C14.73 19.13 14.96 19.07 15.15 19.18C15.33 19.29 15.39 19.53 15.28 19.71C14.38 21.19 13.22 22 12 22M15.91 17.72C15.87 17.72 15.83 17.71 15.8 17.7C15.59 17.63 15.5 17.42 15.54 17.21C16 15.81 16.22 14.18 16.22 12.5C16.22 8.65 14.97 5.24 13.19 4.14C12.94 4.5 12.5 4.78 12 4.78C11.24 4.78 10.61 4.16 10.61 3.39C10.61 2.62 11.24 2 12 2C12.77 2 13.4 2.61 13.41 3.37C15.53 4.5 17 8.21 17 12.5C17 14.25 16.75 15.96 16.28 17.45C16.23 17.61 16.08 17.72 15.91 17.72M12 2.77C11.66 2.77 11.38 3.05 11.38 3.39C11.38 3.73 11.67 4 12 4C12.35 4 12.64 3.73 12.64 3.39C12.64 3.05 12.35 2.77 12 2.77M4.08 18.54C3.31 18.54 2.68 17.91 2.68 17.15C2.68 16.66 2.94 16.22 3.33 15.97C3.19 13.56 5.68 10.41 9.5 8.22C11.09 7.32 12.75 6.67 14.32 6.34C14.5 6.29 14.73 6.42 14.77 6.63C14.82 6.84 14.69 7.05 14.5 7.09C13 7.41 11.41 8.03 9.9 8.89C6.46 10.86 4.1 13.68 4.1 15.76C4.86 15.77 5.5 16.39 5.5 17.15C5.5 17.92 4.85 18.54 4.08 18.54M4.08 16.53C3.74 16.53 3.46 16.81 3.46 17.15C3.46 17.5 3.74 17.77 4.08 17.77S4.71 17.5 4.71 17.15C4.71 16.81 4.42 16.53 4.08 16.53M18.5 13.44C18.43 13.44 18.34 13.41 18.27 13.35C18.11 13.21 18.09 12.97 18.23 12.8C19.77 11 20.3 9.26 19.64 8.14C19.17 7.33 18.1 6.88 16.63 6.86C16.41 6.86 16.24 6.68 16.25 6.47C16.25 6.26 16.43 6.1 16.64 6.09C18.39 6.11 19.7 6.7 20.31 7.75C21.15 9.19 20.6 11.21 18.82 13.3C18.74 13.39 18.63 13.44 18.5 13.44M16.5 18.9C14.5 18.9 11.94 18.16 9.5 16.77C7.95 15.88 6.57 14.79 5.5 13.63C5.35 13.47 5.36 13.23 5.5 13.08C5.68 12.94 5.92 12.95 6.07 13.11C7.08 14.21 8.4 15.25 9.89 16.1C13.2 18 16.77 18.63 18.65 17.72C18.57 17.55 18.5 17.35 18.5 17.15C18.5 16.38 19.15 15.76 19.92 15.76C20.69 15.76 21.32 16.38 21.32 17.15C21.32 17.92 20.69 18.54 19.92 18.54C19.64 18.54 19.39 18.46 19.17 18.32C18.47 18.71 17.56 18.9 16.5 18.9M19.5 17.63C19.63 17.71 19.77 17.77 19.92 17.77C20.27 17.77 20.55 17.5 20.55 17.15C20.55 16.81 20.27 16.53 19.92 16.53S19.3 16.81 19.3 17.15C19.3 17.29 19.35 17.42 19.43 17.53C19.47 17.55 19.5 17.59 19.5 17.63M4.46 12C4.33 12 4.2 11.92 4.13 11.8C3.23 10.25 3.08 8.81 3.7 7.74C4.54 6.3 6.58 5.76 9.31 6.25C9.5 6.29 9.66 6.5 9.62 6.7C9.59 6.91 9.39 7.05 9.18 7C6.82 6.59 5 7 4.37 8.13C3.89 8.95 4.04 10.11 4.8 11.41C4.9 11.6 4.84 11.83 4.65 11.94C4.59 11.97 4.53 12 4.46 12M12.21 13.4C11.71 13.5 11.21 13.19 11.11 12.69C11 12.2 11.32 11.71 11.81 11.6C12.31 11.5 12.81 11.81 12.91 12.31C13 12.8 12.7 13.29 12.21 13.4Z"
                                    />
                                </svg>
                            </v-list-item-icon>
                            <v-list-item-content>
                                Linux & Windows
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item link>
                            <v-list-item-icon>
                                <svg
                                    style="
                                        width: 20px;
                                        height: 20px;
                                        fill-rule: evenodd;
                                        clip-rule: evenodd;
                                        stroke-linejoin: round;
                                        stroke-miterlimit: 2;
                                    "
                                    class="ml-2"
                                    viewBox="0 0 978 388"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    xml:space="preserve"
                                    xmlns:serif="http://www.serif.com/"
                                >
                                    <g
                                        transform="matrix(7.83465,0,0,7.83465,-398.586,-488.321)"
                                    >
                                        <path
                                            d="M142.662,103.442L146.265,94.331L156.668,94.331L151.73,80.51L157.905,64.896L175.59,111.852L162.548,111.852L159.526,103.442L142.662,103.442Z"
                                            fill="currentColor"
                                            style="
                                                fill-opacity: 0.91;
                                                fill-rule: nonzero;
                                            "
                                        />
                                    </g>
                                    <g
                                        transform="matrix(7.83465,0,0,7.83465,-398.586,-488.321)"
                                    >
                                        <path
                                            d="M131.535,109.284L150.467,62.328L137.916,62.329L124.965,92.673L115.755,62.329L106.108,62.329L96.22,92.673L89.246,78.845L82.935,98.288L89.343,109.284L101.695,109.284L110.631,82.072L119.15,109.284L131.535,109.284Z"
                                            fill="currentColor"
                                            style="
                                                fill-opacity: 0.91;
                                                fill-rule: nonzero;
                                            "
                                        />
                                    </g>
                                    <g
                                        transform="matrix(7.83465,0,0,7.83465,-398.586,-488.321)"
                                    >
                                        <path
                                            d="M62.789,93.166L70.52,93.166C72.862,93.166 74.947,92.905 76.776,92.382L78.775,86.223L84.363,69.007C83.938,68.333 83.452,67.694 82.905,67.093C80.036,63.917 75.838,62.33 70.312,62.33L50.875,62.33L50.875,109.286L62.789,109.286L62.789,93.166ZM73.022,73.132C74.143,74.26 74.703,75.77 74.703,77.66C74.703,79.566 74.21,81.077 73.225,82.194C72.144,83.435 70.155,84.056 67.257,84.056L62.789,84.056L62.789,71.441L67.29,71.441C69.991,71.441 71.902,72.004 73.022,73.132Z"
                                            fill="currentColor"
                                            style="
                                                fill-opacity: 0.91;
                                                fill-rule: nonzero;
                                            "
                                        />
                                    </g>
                                </svg>
                            </v-list-item-icon>
                            <v-list-item-content>
                                Alle Platformen
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            v-if="platform === 'desktop'"
                            class="mr-2"
                            x-small
                            color="transparent"
                            fab
                            elevation="0"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <svg
                                style="width: 20px; height: 20px"
                                viewBox="0 0 24 24"
                            >
                                <path fill="currentColor" d="M20,14H4V10H20" />
                            </svg>
                        </v-btn>
                    </template>
                    <span>Minimieren</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            v-if="platform === 'desktop'"
                            class="mr-2"
                            x-small
                            color="transparent"
                            fab
                            elevation="0"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <svg
                                style="width: 20px; height: 20px"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M4,4H20V20H4V4M6,8V18H18V8H6Z"
                                />
                            </svg>
                        </v-btn>
                    </template>
                    <span>Fenster Modus</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            v-if="platform === 'desktop'"
                            class="mr-4"
                            x-small
                            color="red darken-1"
                            fab
                            dark
                            elevation="0"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <svg
                                style="width: 20px; height: 20px"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z"
                                />
                            </svg>
                        </v-btn>
                    </template>
                    <span>Schließen</span>
                </v-tooltip>

                <template v-slot:extension>
                    <v-tabs v-model="tab" align-with-title>
                        <v-tabs-slider></v-tabs-slider>

                        <v-tab v-if="platform === 'other'"> Dateien </v-tab>
                        <v-tab> 3D-Ansicht </v-tab>
                        <v-tab> RobotScript </v-tab>
                        <v-tab> Welt </v-tab>
                        <v-tab> Konvertierung </v-tab>
                        <v-tab v-if="platform === 'desktop'"> Electron </v-tab>
                        <v-tab> Info </v-tab>
                    </v-tabs>
                </template>
            </v-toolbar>
            <v-tabs-items v-model="tab">
                <v-tab-item v-if="platform === 'other'"> <files /> </v-tab-item>
                <v-tab-item> <main-view /> </v-tab-item>
                <v-tab-item> <rs-settings /> </v-tab-item>
                <v-tab-item> <rw-settings /> </v-tab-item>
                <v-tab-item> <convert /> </v-tab-item>
                <v-tab-item v-if="platform === 'desktop'">
                    <electron-settings />
                </v-tab-item>
                <v-tab-item> <info /> </v-tab-item>
            </v-tabs-items>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import Vue from 'vue'

import Files from '@/components/Files.vue'
import MainView from '@/components/MainView.vue'
import RsSettings from '@/components/RSSettings.vue'
import RwSettings from '@/components/RWSettings.vue'
import Convert from '@/components/Convert.vue'
import ElectronSettings from '@/components/ElectronSettings.vue'
import Info from '@/components/Info.vue'

export default Vue.extend({
    name: 'App',

    components: {
        Files,
        MainView,
        RsSettings,
        RwSettings,
        Convert,
        ElectronSettings,
        Info,
    },

    computed: {
        platform: () => 'other',
    },

    data: () => ({
        tab: null,
    }),
})
</script>

<style scoped>
.v-tabs-items {
    height: calc(100vh - 112px);
}
.v-window-item {
    height: 100% !important;
}
</style>
