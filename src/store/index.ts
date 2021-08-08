import Vue from 'vue'
import Vuex from 'vuex'

// robot script
import { Nodes } from '@/assets/robotscript'

Vue.use(Vuex)

export class FileTreeItem {
    constructor(
        public name: string,
        public type: 'dir' | 'file' = 'file',
        public children: FileTreeItem[] = []
    ) {}

    searchPath(name: string, path: string[] = []): string[] {
        if (name == this.name) return [...path, this.name]

        for (const cc of this.children) {
            const result = cc.searchPath(name, [...path, this.name])
            if (result.length !== 0) return result
        }
        return []
    }

    search(name: string): FileTreeItem | null {
        if (name == this.name) return this

        for (const cc of this.children) {
            const result = cc.search(name)
            if (result !== null) return result
        }
        return null
    }

    createFile(file: FileTreeItem) {
        if (this.type !== 'dir') throw `'${this.name}' is no directory`
        this.children.push(file)
    }

    deleteFile(name: string) {
        if (name == this.name) return true
        this.children.forEach((cc, i) => {
            const result = cc.deleteFile(name)
            if (result) this.children.splice(i, 1)
        })
        return false
    }

    static fromJson(json: string) {
        const jsonTree = JSON.parse(json)

        return new FileTreeItem(
            jsonTree.name,
            jsonTree.type == 'dir' ? 'dir' : 'file',
            FileTreeItem.makeChildren(jsonTree.children)
        )
    }

    static makeChildren(json: any): FileTreeItem[] {
        if (!Array.isArray(json) || json.length === 0) return []
        return json.map(
            (val) =>
                new FileTreeItem(
                    val.name,
                    val.type == 'dir' ? 'dir' : 'file',
                    FileTreeItem.makeChildren(val.children)
                )
        )
    }
}

export default new Vuex.Store({
    state: {
        // -----------------------------------------
        // platform
        // -----------------------------------------

        platform: 'other' as 'other' | 'desktop',
        electron: null as Electron.Remote | null,
        fs: null as any,

        // -----------------------------------------
        // filesystem
        // -----------------------------------------

        fileTree: new FileTreeItem('') as FileTreeItem,
        workingDir: '' as string,
        activeRsFilePath: '' as string,

        // -----------------------------------------
        // rs
        // -----------------------------------------

        fallback: '' as string,
        parsed: undefined as Nodes | undefined,

        // -----------------------------------------
        // rw
        // -----------------------------------------

        world: '{"size":{"width":5,"height":5,"depth":8},"resetPosition":{"x":0,"z":0},"boxes":[],"marked":[]}' as string,
        newWorld: true as boolean,
    },
    mutations: {
        SET_FILE_TREE(state) {
            localStorage.setItem('fileTree', JSON.stringify(state.fileTree))
        },
        SET_ACTIVE_RS_FILE_PATH(state, payload: string) {
            state.activeRsFilePath = payload
            localStorage.setItem('activeRsFilePath', payload)

            state.fallback = localStorage.getItem(payload) || ''
            localStorage.setItem('fallback', state.fallback)
        },
        SET_ACTIVE_RS_FILE_VALUE(state, payload: string) {
            state.fallback = payload
            localStorage.setItem('fallback', state.fallback)
            localStorage.setItem(state.activeRsFilePath, state.fallback)
        },
        SET_WORLD(state, payload: string) {
            state.world = payload
        },
        SET_NODES(state, payload: Nodes) {
            state.parsed = payload
        },
    },
    actions: {
        // -----------------------------------------
        // init
        // -----------------------------------------

        async init() {
            this.state.platform = /Electron/.test(navigator.userAgent)
                ? 'desktop'
                : 'other'

            if (this.state.platform == 'other') {
                this.state.workingDir = ''

                const ft = localStorage.getItem('fileTree')
                if (ft === null) return this.dispatch('createFileTree')
                return this.dispatch('loadFileTree')
            }

            this.state.workingDir = localStorage.getItem('workingDir') || ''
            this.state.electron = __non_webpack_require__('electron')
                .remote as Electron.Remote
            this.state.fs = __non_webpack_require__('fs')
        },

        async createFileTree() {
            this.state.fileTree = new FileTreeItem('@', 'dir', [
                new FileTreeItem('storage', 'dir', [
                    new FileTreeItem('willkommen.rs'),
                    new FileTreeItem('ersteWelt.rw'),
                ]),
                new FileTreeItem('modules', 'dir', []),
            ])

            localStorage.setItem(
                this.state.fileTree.searchPath('willkommen.rs').join('/'),
                `/*\n\tBeispielprogramm:\n\tRobot läuft 1 Runde\n*/\n\nvar zähler = 4\nwiederhole (zähler):\n\twiederhole_solange (nichtIstWand()):\n\t\tschritt()\n\t*wiederhole\n\tlinksdrehen()\n*wiederhole`
            )
            localStorage.setItem(
                this.state.fileTree.searchPath('ersteWelt.rw').join('/'),
                `{"size":{"width":5,"height":5,"depth":8},"resetPosition":{"x":0,"z":0},"boxes":[],"marked":[]}`
            )

            this.commit('SET_FILE_TREE')

            this.commit(
                'SET_ACTIVE_RS_FILE_PATH',
                this.state.fileTree.searchPath('willkommen.rs').join('/')
            )
        },

        async loadFileTree() {
            try {
                this.state.fileTree = FileTreeItem.fromJson(
                    localStorage.getItem('fileTree') || ''
                )

                this.commit(
                    'SET_ACTIVE_RS_FILE_PATH',
                    localStorage.getItem('activeRsFilePath') || ''
                )
            } catch (e) {
                console.log(e)
            }
        },

        async createFile(
            _,
            { dir, name, val = '' }: { dir: string; name: string; val?: string }
        ) {
            console.log(dir, name, val)
            const d = this.state.fileTree.search(dir)
            if (d === null) return
            let filename = name
            if (d.search(name) === null) d.createFile(new FileTreeItem(name))
            else
                for (let i = 1; i !== 0; i++) {
                    filename = `${i}-${name}`
                    if (d.search(filename) === null) {
                        d.createFile(new FileTreeItem(filename))
                        break
                    }
                }

            const filepath = this.state.fileTree.searchPath(filename).join('/')
            localStorage.setItem(filepath, val || '')

            if (!/\.rw/.test(filepath))
                this.commit('SET_ACTIVE_RS_FILE_PATH', filepath)
            this.commit('SET_FILE_TREE')
        },

        async deleteFile(_, { name }: { name: string }) {
            const path = this.state.fileTree.searchPath(name).join('/')
            this.state.fileTree.deleteFile(name)
            localStorage.removeItem(path)

            if (path === this.state.activeRsFilePath)
                this.commit('SET_ACTIVE_RS_FILE_PATH', '')
            this.commit('SET_FILE_TREE')
        },
    },
    modules: {},
})
