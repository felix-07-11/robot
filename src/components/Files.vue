<template>
    <v-container fill-height fliud>
        <v-row align="center" justify="space-around">
            <v-col cols="10" lg="6" xl="6" class="pt-4">
                <v-alert type="info">
                    <div class="text-h6">Alpha-Version</div>
                    <v-divider class="my-3" />
                    Diese App befindet sich noch in der Entwicklung. <br />
                    <v-divider class="my-3" />
                    An folgenden Funktionen wird gearbeitet:
                    <ul>
                        <li>Struktogramme</li>
                        <li>Robotscript Module</li>
                        <li>Robotscript (Weitere Funktionen)</li>
                        <li>Robotscript (Return Statement)</li>
                        <li>Anpassung für Tablets</li>
                        <li>Robotscript (Bugfix)</li>
                        <li>Robotscript (Konvertierung von Robot Karol)</li>
                    </ul>
                    <v-divider class="my-3" />
                    Dies ist die PWA Version der App. Später wird es eine
                    Desktop Version für Windows, Linux und Mac OSX geben.
                    <v-divider class="my-3" />
                    <v-btn
                        block
                        href="https://de.wikipedia.org/wiki/Electron_(Framework)"
                        target="_blank"
                    >
                        Was ist Electron?
                    </v-btn>
                    <v-btn
                        block
                        class="mt-4"
                        href="https://www.ionos.de/digitalguide/websites/web-entwicklung/progressive-web-apps-welche-vorteile-bieten-sie/"
                        target="_blank"
                    >
                        Was ist eine PWA App?
                    </v-btn>
                    <v-divider class="my-3" />
                    <v-btn
                        block
                        class="mt-4"
                        href="https://github.com/felix-07-11/robot/issues"
                        target="_blank"
                    >
                        Problem / Bug melden
                    </v-btn>
                </v-alert>

                <v-btn v-if="platform === 'desktop'" block class="mb-4">
                    <v-icon left>mdi-folder-plus</v-icon>
                    Arbeitsverzeichnis erstellen
                </v-btn>
                <v-btn v-if="platform === 'desktop'" block class="mb-8">
                    <v-icon left>mdi-folder-open</v-icon>
                    Arbeitsverzeichnis öffnen
                </v-btn>

                <v-card elevation="2" class="pa-4">
                    <v-toolbar dense flat class="mb-4">
                        <v-btn
                            color="primary"
                            v-if="
                                /\.rmodule/.test(active) || /\.rs/.test(active)
                            "
                            @click="openRsFile"
                        >
                            <v-icon class="mr-2">mdi-open-in-new</v-icon>
                            Im Editor öffnen
                        </v-btn>
                        <v-btn v-if="/\.rw/.test(active)" color="primary">
                            <v-icon class="mr-2">mdi-open-in-new</v-icon>
                            Welt öffnen
                        </v-btn>
                        <v-spacer></v-spacer>

                        <!-- Import -->

                        <v-dialog max-width="600">
                            <template v-slot:activator="{ on: dialog }">
                                <v-tooltip bottom>
                                    <template
                                        v-slot:activator="{
                                            on: tooltip,
                                            attrs,
                                        }"
                                    >
                                        <v-btn
                                            icon
                                            v-bind="attrs"
                                            v-on="{ ...dialog, ...tooltip }"
                                        >
                                            <v-icon>mdi-import</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Datei importieren</span>
                                </v-tooltip>
                            </template>
                            <template v-slot:default="dialog">
                                <v-card>
                                    <v-card-title>
                                        Datei importieren
                                    </v-card-title>
                                    <v-card-text>
                                        <v-form
                                            ref="formImport"
                                            v-model="formImportValid"
                                        >
                                            <v-container fluid fill-height>
                                                <v-row>
                                                    <v-col cols="8">
                                                        <v-text-field
                                                            v-model="
                                                                formImportLink
                                                            "
                                                            label="Link"
                                                            :rules="[
                                                                (val) =>
                                                                    /^(\b(https?|ftp|file):\/\/)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$/.test(
                                                                        val
                                                                    ) ||
                                                                    'Die Eingabe muss ein Link sein',
                                                                (val) =>
                                                                    !!val ||
                                                                    'Dieses Feld muss ausgefüllt werden!',
                                                            ]"
                                                            required
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col cols="4">
                                                        <v-select
                                                            v-model="
                                                                formImportType
                                                            "
                                                            :items="[
                                                                'RobotScript',
                                                                'Welt',
                                                                'Modul',
                                                            ]"
                                                            label="Typ"
                                                            :rules="[
                                                                (val) =>
                                                                    !!val ||
                                                                    'Dieses Feld muss ausgefüllt werden!',
                                                            ]"
                                                        ></v-select>
                                                    </v-col>
                                                    <v-col
                                                        cols="12"
                                                        :class="
                                                            formImportLink &&
                                                            /(\.rs|\.rw|\.rmodule)/.test(
                                                                formImportLink
                                                            )
                                                                ? 'd-none'
                                                                : ''
                                                        "
                                                    >
                                                        <v-text-field
                                                            v-model="
                                                                formImportFileName
                                                            "
                                                            :rules="[
                                                                checkFormImportLink,
                                                            ]"
                                                            label="Dateiname"
                                                        ></v-text-field>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-form>
                                    </v-card-text>
                                    <v-card-actions class="justify-end">
                                        <v-btn
                                            text
                                            @click="
                                                $refs.formImport.reset()
                                                dialog.value = false
                                            "
                                            >Abbrechen</v-btn
                                        >
                                        <v-btn
                                            color="primary"
                                            text
                                            @click="
                                                () => {
                                                    if (
                                                        $refs.formImport.validate()
                                                    ) {
                                                        formImportFileName = ''
                                                        importFile()
                                                        $refs.formImport.reset()
                                                        dialog.value = false
                                                    }
                                                }
                                            "
                                            >Importieren</v-btn
                                        >
                                    </v-card-actions>
                                </v-card>
                            </template>
                        </v-dialog>

                        <!-- Upload -->

                        <v-dialog max-width="600">
                            <template v-slot:activator="{ on: dialog }">
                                <v-tooltip bottom>
                                    <template
                                        v-slot:activator="{
                                            on: tooltip,
                                            attrs,
                                        }"
                                    >
                                        <v-btn
                                            icon
                                            v-bind="attrs"
                                            v-on="{ ...dialog, ...tooltip }"
                                        >
                                            <v-icon>mdi-file-upload</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Datei hochladen</span>
                                </v-tooltip>
                            </template>
                            <template v-slot:default="dialog">
                                <v-card>
                                    <v-card-title>
                                        Datei importieren
                                    </v-card-title>
                                    <v-card-text>
                                        <v-form
                                            ref="formUpload"
                                            v-model="formImportValid"
                                        >
                                            <v-container fluid fill-height>
                                                <v-row>
                                                    <v-col cols="12">
                                                        <v-file-input
                                                            v-model="
                                                                formUploadFiles
                                                            "
                                                            label="Klicken um Dateien auszuwählen"
                                                            accept=".rs,.rw,.rmodule"
                                                            :rules="[
                                                                (val) =>
                                                                    val.length !==
                                                                        0 ||
                                                                    'Es muss mindestens eine Datei ausgeählt werden!',
                                                            ]"
                                                            multiple
                                                            counter
                                                            show-size
                                                        ></v-file-input>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-form>
                                    </v-card-text>
                                    <v-card-actions class="justify-end">
                                        <v-btn
                                            text
                                            @click="
                                                $refs.formUpload.reset()
                                                dialog.value = false
                                            "
                                            >Abbrechen</v-btn
                                        >
                                        <v-btn
                                            color="primary"
                                            text
                                            @click="
                                                () => {
                                                    if (
                                                        $refs.formUpload.validate()
                                                    ) {
                                                        uploadFiles()
                                                        $refs.formUpload.reset()
                                                        dialog.value = false
                                                    }
                                                }
                                            "
                                        >
                                            Hochladen
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </template>
                        </v-dialog>

                        <!-- Share -->

                        <v-tooltip v-if="canShare" bottom>
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

                        <!-- Download -->

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    :disabled="active.length === 0"
                                    icon
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="downloadFile"
                                >
                                    <v-icon>mdi-file-download</v-icon>
                                </v-btn>
                            </template>
                            <span>Datei herunterladen</span>
                        </v-tooltip>

                        <!-- Delete -->

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    :disabled="active.length === 0"
                                    icon
                                    color="red"
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="deleteFile"
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
import store from '@/store'
import Vue from 'vue'

export default Vue.extend({
    computed: {
        filetree: () => [store.state.fileTree],
        canShare: () => false, // (navigator.share === undefined ? false : true),
        platform: () => store.state.platform,
    },

    data: () => ({
        active: [] as string[],
        open: ['@', 'storage'],

        formImportValid: true,
        formImportLink: '',
        formImportType: '',
        formImportFileName: '',

        formUploadFiles: [] as File[],
    }),

    methods: {
        checkFormImportLink(val: string | null) {
            if (this.formImportLink === null) this.formImportLink = ''
            if (val === null) val = ''
            try {
                if (!/(\.rs|\.rw|\.rmodule)/.test(this.formImportLink) && !val)
                    return 'Dieses Feld muss ausgefüllt werden!'
                return true
            } catch {
                return false
            }
        },
        async openRsFile() {
            store.commit(
                'SET_ACTIVE_RS_FILE_PATH',
                store.state.fileTree.searchPath(this.active[0]).join('/')
            )
        },
        // async openRwFile() {

        // },

        async importFile() {
            const link = this.formImportLink
            const type = this.formImportType
            let filename = this.formImportFileName

            const t = await (await fetch(link)).text()

            if (filename == '') {
                filename = link
                    .split(/[/?]/g)
                    .filter((v) => /(\.rs|\.rw|\.rmodule)/.test(v))[0]
            }

            if (type == 'Modul')
                this.$store.dispatch('createFile', {
                    dir: 'modules',
                    name: /\.rmodule/.test(filename)
                        ? filename
                        : `${filename}.rmodule`,
                    val: t,
                })
            else
                this.$store.dispatch('createFile', {
                    dir: 'storage',
                    name:
                        /\.rs/.test(filename) && type == 'RobotScript'
                            ? filename
                            : /\.rw/.test(filename) && type == 'Welt'
                            ? filename
                            : type == 'RobotScript'
                            ? `${filename}.rs`
                            : `${filename}.rw`,
                    val: t,
                })
        },
        async uploadFiles() {
            for (const file of this.formUploadFiles) {
                const fr = new FileReader()
                fr.onload = (e: ProgressEvent<FileReader>) => {
                    const f = e.target?.result
                    const lines = (f as string).split(/\r\n|\n/)
                    this.$store.dispatch('createFile', {
                        dir: 'storage',
                        name: file.name,
                        val: lines.join('\n'),
                    })
                }
                fr.onerror = (e) => console.log(e.target?.error?.name)

                fr.readAsText(file)
            }
        },
        async downloadFile() {
            const filepath = store.state.fileTree
                .searchPath(this.active[0])
                .join('/')
            const type =
                this.active[0].split('.')[this.active[0].split('.').length - 1]
            const file = new Blob([localStorage.getItem(filepath) || ''], {
                type: `text/${
                    type == 'rw' ? 'robotworld' : 'robotscript'
                };charset=utf-8`,
            })
            const url = URL.createObjectURL(file)
            const a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.download = this.active[0]
            a.click()
            URL.revokeObjectURL(url)
        },
        async deleteFile() {
            store.dispatch('deleteFile', { name: this.active[0] })
        },
    },
})
</script>
