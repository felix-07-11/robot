<template>
    <v-container fill-height fluid class="pa-0">
        <v-row no-gutters class="fill-height" style="display: absolute">
            <!-- Editor -->
            <v-col
                :sm="showEditor ? '12' : '0'"
                :md="showEditor ? '6' : '0'"
                :lg="showEditor ? '5' : '0'"
            >
                <v-card
                    flat
                    class="grey lighten-4 pa-4"
                    style="height: 100%; width: 100%"
                >
                    <div class="d-flex" style="height: 100%; width: 100%">
                        <div
                            class="flex-grow-1 d-flex flex-column justify-center align-center"
                        >
                            <div
                                class="d-flex flex-row pl-4 pr-4"
                                style="width: 100%"
                            >
                                <v-toolbar dense flat class="transparent">
                                    <v-tooltip bottom>
                                        <template
                                            v-slot:activator="{ on, attrs }"
                                        >
                                            <v-btn
                                                icon
                                                v-bind="attrs"
                                                v-on="on"
                                                :color="!isSaved ? 'red' : ''"
                                            >
                                                <svg
                                                    v-if="isSaved"
                                                    style="
                                                        width: 20px;
                                                        height: 20px;
                                                    "
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fill="currentColor"
                                                        d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"
                                                    />
                                                </svg>
                                                <svg
                                                    v-else
                                                    style="
                                                        width: 20px;
                                                        height: 20px;
                                                    "
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fill="currentColor"
                                                        d="M13 9H3V5H13M10 19C8.3 19 7 17.7 7 16S8.3 13 10 13 13 14.3 13 16 11.7 19 10 19M15 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H17C18.1 21 19 20.1 19 19V7L15 3M23 14H21V7H23V14M23 18H21V16H23V18Z"
                                                    />
                                                </svg>
                                            </v-btn>
                                        </template>
                                        <span>Datei speichern</span>
                                    </v-tooltip>
                                    <v-spacer></v-spacer>
                                    {{ filename }}
                                    <v-spacer></v-spacer>
                                    <v-menu bottom left>
                                        <template
                                            v-slot:activator="{ on, attrs }"
                                        >
                                            <v-btn
                                                icon
                                                v-bind="attrs"
                                                v-on="on"
                                            >
                                                <svg
                                                    style="
                                                        width: 20px;
                                                        height: 20px;
                                                    "
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fill="currentColor"
                                                        d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"
                                                    />
                                                </svg>
                                            </v-btn>
                                        </template>

                                        <v-list>
                                            <v-list-item link>
                                                <v-list-item-content>
                                                    Speichern unter
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-list-item link>
                                                <v-list-item-content>
                                                    Zu einem Modul konvertieren
                                                </v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </v-toolbar>
                            </div>

                            <div class="pa-4" style="height: 100%; width: 100%">
                                <div
                                    class="block flex-grow codeArea"
                                    style="height: 100%; width: 100%"
                                >
                                    <textarea id="editor"></textarea>
                                </div>
                            </div>
                        </div>
                        <div
                            class="flex-grow-0 d-flex justify-center align-center pl-4"
                        >
                            <v-btn icon @click="showEditor = !showEditor">
                                <svg
                                    v-if="showEditor"
                                    style="width: 20px; height: 20px"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
                                    />
                                </svg>
                                <svg
                                    v-else
                                    style="width: 20px; height: 20px"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
                                    />
                                </svg>
                            </v-btn>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <!-- 3d View -->

            <!-- Log -->
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

// Codemirror
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'

export default Vue.extend({
    data: () => ({
        showEditor: true,
        editor: undefined as undefined | CodeMirror.EditorFromTextArea,
    }),

    computed: {
        filename: () => 'willkommen.rs',
        isSaved: () => false,
    },

    mounted() {
        this.editor = CodeMirror.fromTextArea(
            document.getElementById('editor') as HTMLTextAreaElement,
            {
                lineNumbers: true,
                value: 'var a = 1;',
            }
        )
    },
})
</script>

<style>
.codeArea {
    flex: 1 1 auto;
    margin-top: 0;
    height: 100%;
    position: relative;
}

.CodeMirror {
    /* font-family: 'Fira Code'; */
    font-size: 0.93rem !important;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
}
</style>
