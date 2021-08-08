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
                            class="
                                flex-grow-1
                                d-flex
                                flex-column
                                justify-center
                                align-center
                            "
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
                            class="
                                flex-grow-0
                                d-flex
                                justify-center
                                align-center
                                pl-4
                            "
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
                    class="
                        flex-grow-1
                        d-flex
                        flex-column
                        align-center
                        justify-center
                    "
                    style="width: 100%"
                >
                    <div
                        class="
                            flex-grow-1
                            d-flex
                            flex-column
                            align-center
                            justify-center
                        "
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
                        <v-card-text class="d-flex flex-row align-center">
                            <!-- Script Actions -->

                            <!-- Play -->
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        color="green accent-4"
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="play"
                                    >
                                        <v-icon>mdi-play</v-icon>
                                    </v-btn>
                                </template>
                                <span>Programm Starten</span>
                            </v-tooltip>

                            <!-- Next -->
                            <!-- <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="next"
                                    >
                                        <v-icon>mdi-skip-next</v-icon>
                                    </v-btn>
                                </template>
                                <span>Nächster Schritt</span>
                            </v-tooltip> -->

                            <!-- Pause -->
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="pause"
                                    >
                                        <v-icon>mdi-pause</v-icon>
                                    </v-btn>
                                </template>
                                <span>Pause</span>
                            </v-tooltip>

                            <!-- Stop -->
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        color="error"
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="stop"
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
                                        @click="reset"
                                    >
                                        <v-icon>mdi-undo</v-icon>
                                    </v-btn>
                                </template>
                                <span>Roboter zurücksetzen</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        v-bind="attrs"
                                        v-on="on"
                                        @click="reload"
                                    >
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
                                        @click="mark"
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
                                        @click="removeMark"
                                    >
                                        R
                                    </v-btn>
                                </template>
                                <span>Markierung löschen (R)</span>
                            </v-tooltip>

                            <v-spacer></v-spacer>
                            <div
                                style="width: 30%"
                                class="d-flex align-center justify-center mr-4"
                            >
                                <v-slider
                                    v-model="speed"
                                    thumb-label
                                    :thumb-size="50"
                                    :min="0"
                                    :max="1000"
                                    step="50"
                                    dense
                                    :hide-details="true"
                                    :prepend-icon="
                                        speed >= 700
                                            ? 'mdi-speedometer-slow'
                                            : speed <= 300
                                            ? 'mdi-speedometer'
                                            : 'mdi-speedometer-medium'
                                    "
                                >
                                    <template v-slot:thumb-label="{ value }">
                                        {{ value }} ms
                                    </template>
                                </v-slider>
                            </div>
                        </v-card-text>
                    </v-card>
                </div>

                <!-- Log -->

                <v-card
                    class="
                        flex-grow-0
                        d-flex
                        flex-row
                        align-center
                        justify-center
                        pa-4
                    "
                    style="width: 100%"
                    min-height="220px"
                    flat
                >
                    <v-textarea
                        solo
                        label=""
                        readonly
                        no-resize
                        v-model="log"
                        clearable
                        style="font-family: 'Fira Code'; font-size: 0.93rem"
                    ></v-textarea>
                    <div class="px-8">
                        <svg
                            v-if="status === 'waiting'"
                            viewBox="0 0 24 24"
                            height="120"
                            width="120"
                            class="light-blue--text text--lighten-2 turnY"
                        >
                            <path
                                fill="currentColor"
                                d="M23,12H17V10L20.39,6H17V4H23V6L19.62,10H23V12M15,16H9V14L12.39,10H9V8H15V10L11.62,14H15V16M7,20H1V18L4.39,14H1V12H7V14L3.62,18H7V20Z"
                            />
                        </svg>
                        <svg
                            v-else-if="status === 'running'"
                            xmlns="http://www.w3.org/2000/svg"
                            enable-background="new 0 0 24 24"
                            viewBox="0 0 24 24"
                            height="120"
                            width="120"
                            class="blue-grey--text text--darken-3 turnZ"
                        >
                            <g>
                                <path d="M0,0h24v24H0V0z" fill="none" />
                                <path
                                    d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
                                    fill="currentColor"
                                />
                            </g>
                        </svg>
                        <svg
                            v-else-if="status === 'error'"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            height="120"
                            width="120"
                            class="red--text text--darken-4 turnY"
                        >
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                                fill="currentColor"
                            />
                        </svg>
                        <svg
                            v-else-if="status === 'done'"
                            height="120"
                            width="120"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M14.4,6H20V16H13L12.6,14H7V21H5V4H14L14.4,6M14,14H16V12H18V10H16V8H14V10L13,8V6H11V8H9V6H7V8H9V10H7V12H9V10H11V12H13V10L14,12V14M11,10V8H13V10H11M14,10H16V12H14V10Z"
                                class="jump"
                            />
                        </svg>
                        <svg
                            v-else-if="status === 'pause'"
                            class="blue-grey--text text--darken-4 turnY"
                            height="120"
                            width="120"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M14,19H18V5H14M6,19H10V5H6V19Z"
                            />
                        </svg>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

// Codemirror
import CodeMirror from 'codemirror'
import '@/assets/robotscript/highlighting'
import 'codemirror/lib/codemirror.css'
import 'firacode/distr/fira_code.css'
import store from '@/store'

// 3d
import { World } from '@/assets/3d/world'
import { Character } from '@/assets/3d/character'
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts'

// robot script
import {
    Interpreter,
    Nodes,
    parse,
    RSError,
    RSRuntimeError,
} from '@/assets/robotscript'

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
        resetWorld: '',

        // Character
        character: null as Character | null,

        // Interpreter
        interpreter: null as Interpreter | null,

        // Log
        log: 'Auf ▶️ drücken um das Programm zu starten...',
        status: 'waiting' as 'waiting' | 'running' | 'pause' | 'error' | 'done',

        // robot script
        parsed: null as null | RSError | Nodes,

        speed: 500 as number,
    }),

    computed: {
        platform: () => store.state.platform,
        filepath: () => store.state.activeRsFilePath,
        isSaved: () => false,
        worldString: () => store.state.world,
    },

    methods: {
        //#region Init
        async initCodeMirror() {
            this.editor = CodeMirror.fromTextArea(
                document.getElementById('editor') as HTMLTextAreaElement,
                {
                    lineNumbers: true,
                    value: '',
                    mode: 'robotscript',
                }
            )

            this.editor.on('change', async () => {
                store.commit(
                    'SET_ACTIVE_RS_FILE_VALUE',
                    this.editor ? this.editor.getValue() : ''
                )

                this.parsed = await parse(
                    this.editor ? this.editor.getValue() : ''
                )

                if (this.parsed instanceof RSError) {
                    this.log = this.parsed.toString()
                    this.status = 'error'
                } else {
                    if (this.parsed !== null)
                        store.commit('SET_NODES', this.parsed)
                    this.log = 'Auf ▶️ drücken um das Programm zu starten...'
                    this.status = 'waiting'
                }
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
            if (store.state.newWorld) {
                store.state.newWorld = false
                this.resetWorld = this.worldString
            }
            await (await this.world.init()).makeWorld(this.resetWorld)

            // Charakter
            this.character = await Character.createLegoCharacter(this.world)

            this.scene.add(this.world.Mesh, this.character.mesh)

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

        //#endregion

        //#region RS Controles

        async play() {
            localStorage.setItem('wait', String(this.speed))
            localStorage.removeItem('stop')
            if (this.status === 'pause') {
                this.status = 'running'
                return
            }
            if (this.status === 'running' || !this.character) return
            this.status = 'running'
            if (this.parsed && !(this.parsed instanceof RSError)) {
                this.interpreter = new Interpreter(this.character, this.world)
                const i = await this.interpreter.run(this.parsed)
                console.log('test4', i)

                if (
                    !localStorage.getItem('stop') &&
                    i &&
                    i.error instanceof RSRuntimeError
                ) {
                    this.status = 'error'
                    this.log = i.error.toString()
                } else if (!localStorage.getItem('stop')) {
                    this.status = 'done'
                    this.log = 'Das Prgramm wurde erfolgreich beedet.'
                }
                this.updateWorld()
            }
        },

        // async next() {
        //     if (this.status !== 'pause') return
        //     await this.play()
        //     setTimeout(async () => {
        //         await this.pause()
        //     }, 2)
        // },

        async pause() {
            if (this.status !== 'running') return
            this.status = 'pause'
            localStorage.setItem('wait', 'pause')
        },

        async stop() {
            if (
                this.status === 'error' ||
                this.status === 'waiting' ||
                this.status === 'done' ||
                this.interpreter === null
            )
                return
            localStorage.setItem('stop', 'true')
            this.status = 'done'
            this.log = 'Das Prgramm wurde abgebrochen.'
            this.updateWorld()
        },

        //#endregion

        //#region 3d Controles

        async step() {
            try {
                await this.character?.step(1)
                this.updateWorld()
            } catch (e) {
                this.changeLog(e)
            }
        },
        async turnLeft() {
            try {
                await this.character?.turn_left()
                this.updateWorld()
            } catch (e) {
                this.changeLog(e)
            }
        },
        async turnRight() {
            try {
                await this.character?.turn_right()
                this.updateWorld()
            } catch (e) {
                this.changeLog(e)
            }
        },

        async put() {
            try {
                await this.character?.put()
                this.updateWorld()
            } catch (e) {
                this.changeLog(e)
            }
        },
        async pick() {
            try {
                await this.character?.pick()
                this.updateWorld()
            } catch (e) {
                this.changeLog(e)
            }
        },

        async mark() {
            try {
                await this.character?.mark()
                this.updateWorld()
            } catch (e) {
                this.changeLog(e)
            }
        },
        async removeMark() {
            try {
                await this.character?.removeMark()
                this.updateWorld()
            } catch (e) {
                this.changeLog(e)
            }
        },

        async reset() {
            try {
                await this.character?.reset()
                this.updateWorld()
            } catch (e) {
                this.changeLog(e)
            }
        },
        async reload() {
            try {
                this.scene.remove(this.world.Mesh)
                await this.world.makeWorld(this.resetWorld)
                this.scene.add(this.world.Mesh)
                await this.character?.reset()
                this.updateWorld()
            } catch (e) {
                this.changeLog(e)
            }
        },

        //#endregion

        updateWorld() {
            store.commit(
                'SET_WORLD',
                this.world.toJSON(
                    this.character ? this.character.position : undefined
                )
            )
        },

        //#region Log

        changeLog(newLog: string) {
            this.log = `${newLog}\n${this.log === null ? '' : this.log}`
        },

        //#endregion

        //#region Key events

        handleKeyEvent(e: KeyboardEvent) {
            if (document.activeElement?.nodeName === 'TEXTAREA') return
            if (e.code === 'KeyW') this.step()
            if (e.code === 'KeyA') this.turnLeft()
            if (e.code === 'KeyD') this.turnRight()
            if (e.code === 'KeyP') this.put()
            if (e.code === 'KeyU') this.pick()
            if (e.code === 'KeyM') this.mark()
            if (e.code === 'KeyR') this.removeMark()
        },

        //#endregion
    },

    //#region watch + livecicle events

    watch: {
        filepath() {
            console.log(this.filepath)

            this.editor?.setValue(localStorage.getItem(this.filepath) || '')
            setTimeout(() => {
                this.editor?.refresh()
            }, 1000)
        },
        speed() {
            if (localStorage.getItem('wait') != 'pause')
                localStorage.setItem('wait', String(this.speed))
        },
        worldString() {
            if (!store.state.newWorld) return
            store.state.newWorld = false
            this.resetWorld = this.worldString
            this.reload()
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

    //#endregion
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

.turnY {
    animation: turnerY 3.5s infinite linear;
}

.turnZ {
    animation: turnerZ 4s infinite linear;
}

.jump {
    animation: jump 1.4s infinite linear;
}

@keyframes turnerY {
    from {
        transform: rotateY(0deg);
    }
    to {
        transform: rotateY(360deg);
    }
}

@keyframes turnerZ {
    from {
        transform: rotateZ(0deg);
    }
    to {
        transform: rotateZ(360deg);
    }
}
@keyframes jump {
    0% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-3px);
    }
    50% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(0);
    }
}
</style>
