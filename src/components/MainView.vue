<template>
    <v-container fill-height fluid class="pa-0">
        <v-row no-gutters class="fill-height">
            <!-- Editor -->
            <v-col
                :sm="showEditor ? '12' : 'auto'"
                :md="showEditor ? '6' : 'auto'"
                :lg="showEditor ? '4' : 'auto'"
                :xl="showEditor ? '3' : 'auto'"
            >
                <v-card
                    flat
                    class="grey lighten-4 pa-4"
                    style="height: 100%; width: 100%"
                    :style="showEditor ? '' : 'display: none;'"
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
                                                v-if="platform === 'desktop'"
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
                                    {{ filepath }}
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
                                            <v-list-item
                                                v-if="platform === 'desktop'"
                                                link
                                            >
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
                            <v-btn
                                icon
                                @click="
                                    showEditor = !showEditor
                                    resize()
                                "
                            >
                                <svg
                                    style="width: 20px; height: 20px"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
                                    />
                                </svg>
                            </v-btn>
                        </div>
                    </div>
                </v-card>
                <v-card
                    flat
                    class="grey lighten-4 d-flex align-center justify-center"
                    style="height: 100%; width: 100%"
                    :style="showEditor ? 'display: none !important;' : ''"
                >
                    <v-card-text>
                        <v-btn
                            icon
                            @click="
                                showEditor = !showEditor
                                resize()
                            "
                        >
                            <svg
                                style="width: 20px; height: 20px"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
                                />
                            </svg>
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
            <!-- ------------------------------------------------------------------------------------------->
            <!-- 3d View -->
            <v-col
                class="d-md-flex flex-column align-center justify-center"
                :class="showEditor ? 'd-sm-none' : 'd-sm-flex'"
                :sm="!showEditor ? '11' : '1'"
                :md="!showEditor ? '11' : '6'"
                :lg="!showEditor ? '11' : '8'"
                :xl="!showEditor ? '11' : '9'"
            >
                <div
                    class="flex-grow-1 d-flex flex-column align-center justify-center"
                    style="width: 100%"
                >
                    <div
                        class="flex-grow-1 d-flex flex-column align-center justify-center"
                        style="width: 100%"
                    >
                        <canvas id="threeeJS"></canvas>
                    </div>
                    <v-card
                        color="grey lighten-4"
                        class="flex-grow-0"
                        style="width: 100%"
                        flat
                        tile
                    >
                        <v-card-text>
                            <!-- Script Actions -->

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        color="green accent-4"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <v-icon>mdi-play</v-icon>
                                    </v-btn>
                                </template>
                                <span>Programm Starten</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn icon v-bind="attrs" v-on="on">
                                        <v-icon>mdi-skip-next</v-icon>
                                    </v-btn>
                                </template>
                                <span>Nächster Schritt</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn icon v-bind="attrs" v-on="on">
                                        <v-icon>mdi-pause</v-icon>
                                    </v-btn>
                                </template>
                                <span>Pause</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        color="error"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <v-icon>mdi-stop</v-icon>
                                    </v-btn>
                                </template>
                                <span>Programm stoppen</span>
                            </v-tooltip>

                            <!-- reload -->

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        class="ml-4"
                                    >
                                        <v-icon>mdi-undo</v-icon>
                                    </v-btn>
                                </template>
                                <span>Roboter zurücksetzen</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn icon v-bind="attrs" v-on="on">
                                        <v-icon>mdi-reload</v-icon>
                                    </v-btn>
                                </template>
                                <span>Welt neu laden</span>
                            </v-tooltip>

                            <!-- Move -->

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        class="ml-4"
                                        @click="turnLeft"
                                    >
                                        <v-icon>mdi-arrow-left</v-icon>
                                    </v-btn>
                                </template>
                                <span>Nach links drehen (A)</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="step"
                                    >
                                        <v-icon>mdi-arrow-up</v-icon>
                                    </v-btn>
                                </template>
                                <span>Einen Schritt machen (W)</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="turnRight"
                                    >
                                        <v-icon>mdi-arrow-right</v-icon>
                                    </v-btn>
                                </template>
                                <span>Nach rechts drehen (D)</span>
                            </v-tooltip>

                            <!-- Boxes -->

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        class="ml-4 font-weight-bold"
                                        @click="put"
                                    >
                                        P
                                    </v-btn>
                                </template>
                                <span>Box hinlegen (P)</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        class="font-weight-bold"
                                        @click="pick"
                                    >
                                        U
                                    </v-btn>
                                </template>
                                <span>Box aufheben (U)</span>
                            </v-tooltip>

                            <!-- Marks -->

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        class="ml-4 font-weight-bold"
                                    >
                                        M
                                    </v-btn>
                                </template>
                                <span>Markierung setzen (M)</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        class="font-weight-bold"
                                    >
                                        R
                                    </v-btn>
                                </template>
                                <span>Markierung löschen (R)</span>
                            </v-tooltip>
                        </v-card-text>
                    </v-card>
                </div>
                <v-card
                    class="flex-grow-0 d-flex align-center justify-center"
                    min-height="300px"
                    flat
                    >Log Bereich</v-card
                >
            </v-col>
            <!-- Log -->
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

// Codemirror
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'firacode/distr/fira_code.css'
import store from '@/store'

// 3d
import { World } from '@/assets/3d/world'
import { Character } from '@/assets/3d/character'
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts'

export default Vue.extend({
    data: () => ({
        showEditor: true,
        editor: undefined as undefined | CodeMirror.EditorFromTextArea,

        // THREE JS

        scene: new Scene(),
        camera: new PerspectiveCamera(
            75,
            (document.querySelector('#threeeJS')?.clientWidth || 1) /
                (document.querySelector('#threeeJS')?.clientHeight || 1),
            0.1,
            1000
        ),
        renderer: null as WebGLRenderer | null,
        controls: null as OrbitControls | null,

        // World
        world: new World(),

        // Character
        character: null as Character | null,
    }),

    computed: {
        platform: () => store.state.platform,
        filepath: () => store.state.activeRsFilePath,
        isSaved: () => false,
    },

    methods: {
        initCodeMirror() {
            this.editor = CodeMirror.fromTextArea(
                document.getElementById('editor') as HTMLTextAreaElement,
                {
                    lineNumbers: true,
                    value: 'var a = 1;',
                }
            )

            this.editor.on('change', () => {
                store.commit(
                    'SET_ACTIVE_RS_FILE_VALUE',
                    this.editor ? this.editor.getValue() : ''
                )
            })

            this.editor.setValue(localStorage.getItem(this.filepath) || '')
        },
        async initThreeJS() {
            // THREE JS

            this.camera.position.set(-1, 5, -7)
            this.camera.rotation.set(0, Math.PI, 0)
            this.camera.lookAt(new Vector3(0, 0, 0))

            this.renderer = new WebGLRenderer({
                canvas: document.querySelector(
                    '#threeeJS'
                ) as HTMLCanvasElement,
                antialias: true,
            })
            this.renderer.setSize(
                document.querySelector('#threeeJS')?.clientWidth || 1,
                document.querySelector('#threeeJS')?.clientHeight || 1
            )
            this.renderer.shadowMap.enabled = true
            this.renderer.setClearColor(0xffffff, 1)

            this.controls = new OrbitControls(
                this.camera as PerspectiveCamera,
                this.renderer.domElement
            )
            this.controls.enableDamping = true
            this.controls.enablePan = true

            // World
            await (await this.world.init()).makeWorld()

            // Charakter
            this.character = await Character.createDefaultCharacter(this.world)

            this.scene.add(this.world.Mesh, this.character.Mesh)

            // Camera
            this.camera.aspect =
                (document.querySelector('#threeeJS')?.clientWidth || 1) /
                (document.querySelector('#threeeJS')?.clientHeight || 1)
            this.camera.updateProjectionMatrix()
            this.renderer?.setSize(
                document.querySelector('#threeeJS')?.clientWidth || 1,
                document.querySelector('#threeeJS')?.clientHeight || 1
            )
            this.updateThreeJS()

            // Window resize event
            window.addEventListener('resize', this.resize)
        },

        // Three JS update loop
        async updateThreeJS() {
            this.renderer?.render(this.scene, this.camera)

            this.controls?.update()

            requestAnimationFrame(() => {
                this.updateThreeJS()
            })
        },

        resize() {
            this.camera.aspect =
                (document.querySelector('#threeeJS')?.clientWidth || 1) /
                (document.querySelector('#threeeJS')?.clientHeight || 1)
            this.camera.updateProjectionMatrix()
            this.renderer?.setSize(
                document.querySelector('#threeeJS')?.clientWidth || 1,
                document.querySelector('#threeeJS')?.clientHeight || 1
            )
        },

        // --------------------------------------------------------------------------------------------------------
        // 3d Controles

        async step() {
            try {
                await this.character?.step(1)
            } catch (e) {
                console.log(e)
            }
        },
        async turnLeft() {
            try {
                await this.character?.turn_left()
            } catch (e) {
                console.log(e)
            }
        },
        async turnRight() {
            try {
                await this.character?.turn_right()
            } catch (e) {
                console.log(e)
            }
        },

        async put() {
            try {
                await this.character?.put()
            } catch (e) {
                console.log(e)
            }
        },
        async pick() {
            try {
                await this.character?.pick()
            } catch (e) {
                console.log(e)
            }
        },

        // --------------------------------------------------------------------------------------------------------
        // Key events

        handleKeyEvent(e: KeyboardEvent) {
            if (e.code === 'KeyW') this.step()
            if (e.code === 'KeyA') this.turnLeft()
            if (e.code === 'KeyD') this.turnRight()
            if (e.code === 'KeyP') this.put()
            if (e.code === 'KeyU') this.pick()
        },
    },

    watch: {
        filepath() {
            console.log(this.filepath)

            this.editor?.setValue(localStorage.getItem(this.filepath) || '')
            setTimeout(() => {
                this.editor?.refresh()
            }, 1000)
        },
    },

    mounted() {
        this.initCodeMirror()
        this.initThreeJS()

        window.addEventListener('keydown', this.handleKeyEvent)
    },

    beforeDestroy() {
        window.addEventListener('keydown', this.handleKeyEvent)
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
    font-family: 'Fira Code';
    font-size: 0.93rem !important;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
}

#threeeJS {
    width: 100% !important;
    height: 100% !important;
    max-height: calc(100vh - 112px - 300px - 36px - 34px);
    padding: 0;
    margin: 0;
    display: block;
}
</style>
