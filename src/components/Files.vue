<template>
    <v-container fill-height fliud>
        <v-row align="center" justify="space-around">
            <v-col md="6" class="pt-4">
                <v-card elevation="2" class="pa-4">
                    <v-toolbar dense flat class="mb-4">
                        <v-btn
                            v-if="
                                /\.rmodule/.test(active) || /\.rs/.test(active)
                            "
                        >
                            <v-icon class="mr-2">mdi-open-in-new</v-icon>
                            Im Editor öffnen
                        </v-btn>
                        <v-btn v-if="/\.rw/.test(active)">
                            <v-icon class="mr-2">mdi-open-in-new</v-icon>
                            Welt öffnen
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn icon v-bind="attrs" v-on="on">
                                    <v-icon>mdi-import</v-icon>
                                </v-btn>
                            </template>
                            <span>Datei importieren</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn icon v-bind="attrs" v-on="on">
                                    <v-icon>mdi-file-upload</v-icon>
                                </v-btn>
                            </template>
                            <span>Datei hochladen</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    :disabled="active.length === 0"
                                    icon
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-icon>mdi-share-variant</v-icon>
                                </v-btn>
                            </template>
                            <span>Datei teilen</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    :disabled="active.length === 0"
                                    icon
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-icon>mdi-file-download</v-icon>
                                </v-btn>
                            </template>
                            <span>Datei herunterladen</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    :disabled="active.length === 0"
                                    icon
                                    color="red"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </template>
                            <span>Datei löschen</span>
                        </v-tooltip>
                    </v-toolbar>
                    <v-treeview
                        :active.sync="active"
                        :open.sync="open"
                        :items="filetree"
                        activatable
                        item-key="name"
                        open-on-click
                    >
                        <template v-slot:prepend="{ item, open }">
                            <v-icon
                                v-if="
                                    /\.d/.test(item.name) || item.type === 'dir'
                                "
                            >
                                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                            </v-icon>
                            <v-icon
                                v-else-if="
                                    /\.rmodule/.test(item.name) ||
                                    item.type === 'module'
                                "
                            >
                                mdi-package
                            </v-icon>
                            <v-icon v-else> mdi-file-document-outline </v-icon>
                        </template>
                    </v-treeview>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    computed: {
        filetree: () => [
            {
                name: '@storage',
                type: 'dir',
                children: [{ name: 'willkommen.rs' }, { name: 'ersteWelt.rw' }],
            },
            {
                name: '@modules',
                type: 'dir',
                children: [{ name: 'basic.rmodule' }],
            },
        ],
        canShare: () => (navigator.share === undefined ? false : true),
    },

    data: () => ({
        active: [],
        open: ['@storage'],
    }),
    mounted() {
        console.log(this.active.length)
    },
})
</script>
