import * as THREE from 'three'
import { World } from './world'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

import legoFigure from '@/assets/3d/models/characters/lego_minifigure.fbx'
import { DoubleSide, Mesh, MeshBasicMaterial, MeshPhongMaterial } from 'three'

async function wait() {
    const time = localStorage.getItem('wait')
    let ms = 500
    if (time == 'pause') {
        return new Promise((resolve) => {
            const i = setInterval(() => {
                if (localStorage.getItem('wait') != 'pause') {
                    clearInterval(i)
                    resolve(null)
                }
            }, 2)
        })
    }

    return new Promise((resolve) => {
        if (!isNaN(Number(time))) ms = Number(time)
        setTimeout(() => resolve(null), ms)
    })
}

export class Character {
    private rotation: { x: number; y: number; z: number }

    // ########################################################################################################
    // constructor

    constructor(
        private _mesh: THREE.Group | THREE.Mesh,
        private _world: World,
        private readonly _positionOffset: {
            x: number
            y: number
            z: number
        } = {
            x: 0,
            y: 0,
            z: 0,
        },
        private readonly _rotationOffset: {
            x: number
            y: number
            z: number
        } = {
            x: 0,
            y: 0,
            z: 0,
        },
        private readonly _scale: { x: number; y: number; z: number } = {
            x: 1,
            y: 1,
            z: 1,
        },
        private _position: { x: number; y: number; z: number } = {
            x: 0,
            y: 0,
            z: 0,
        },
        private _direction: 'x' | '-x' | 'z' | '-z' = 'z',
        private _height: number = 0
    ) {
        this._mesh.position.set(
            this._positionOffset.x + this._position.x,
            this._positionOffset.y + this._position.y,
            this._positionOffset.z + this._position.z
        )
        this._mesh.scale.set(_scale.x, _scale.y, _scale.z)
        this._mesh.rotation.set(
            _rotationOffset.x,
            _rotationOffset.y,
            _rotationOffset.z
        )
        this.rotation = {
            x: this._rotationOffset.x,
            y: this._rotationOffset.y,
            z: this._rotationOffset.z,
        }
    }

    // ########################################################################################################
    // getter

    get position() {
        return this._position
    }

    get positionInFrontOf() {
        return this._position
    }

    get mesh() {
        return this._mesh
    }

    get direction() {
        return this._direction
    }

    get height() {
        return this._height
    }

    toString() {
        return JSON.stringify(this)
    }

    // ########################################################################################################
    // setter

    set world(value: World) {
        this._world = value
    }

    // ########################################################################################################
    // methods

    /**
     * move the character to the resetposition of the World
     */
    async reset() {
        this._position = {
            x: this._world.ResetPosition.x,
            y:
                this._world.heightOfPosition(
                    this._world.ResetPosition.x,
                    this._world.ResetPosition.x
                ).current / 2,
            z: this._world.ResetPosition.x,
        }
        this.rotation = {
            x: this._rotationOffset.x,
            y: this._rotationOffset.y,
            z: this._rotationOffset.z,
        }

        this._mesh.position.set(
            this._positionOffset.x + this._position.x,
            this._positionOffset.y + this._position.y,
            this._positionOffset.z + this._position.z
        )
        this._mesh.rotation.set(
            this._rotationOffset.x,
            this._rotationOffset.y,
            this._rotationOffset.z
        )

        this._direction = 'z'
    }

    async step(n: number, d: 'x' | '-x' | 'z' | '-z' = this._direction) {
        await wait()

        const old = JSON.parse(JSON.stringify(this._position))

        if (d === 'x') {
            this._position.x += n
        } else if (d === '-x') {
            this._position.x -= n
        } else if (d === 'z') {
            this._position.z += n
        } else if (d === '-z') {
            this._position.z -= n
        }

        const newpos = this._position
        const ch =
            this._world.heightOfPosition(this._position.x, this._position.z)
                .current / 2

        if (ch == this._position.y + 0.5) this._position.y += 0.5
        else if (ch == this._position.y - 0.5) this._position.y -= 0.5
        else if (ch < this._position.y - 0.5 || ch > this._position.y + 0.5) {
            this._position = old
            throw `Character kann nicht von (${old.x}|${old.y * 2}|${
                old.z
            }) nach (${newpos.x}|${
                this._world.heightOfPosition(newpos.x, newpos.z).current
            }|${newpos.z}) laufen: Höhenunterschied zu groß!`
        }

        if (!this._world.isInWorld(this._position.x, this._position.z)) {
            this._position = old
            throw `Character kann nicht von (${old.x}|${old.y * 2}|${
                old.z
            }) nach (${newpos.x}|${
                this._world.heightOfPosition(newpos.x, newpos.z).current
            }|${newpos.z}) laufen: Welt zu klein!`
        }

        this._mesh.position.set(
            this._positionOffset.x + this._position.x,
            this._positionOffset.y + this._position.y,
            this._positionOffset.z + this._position.z
        )
    }

    async turn_right(): Promise<void>
    async turn_right(d: 'x' | '-x' | 'z' | '-z'): Promise<void>
    async turn_right(d?: 'x' | '-x' | 'z' | '-z'): Promise<void> {
        await wait()

        if (d === undefined) {
            this.rotation.z = (this.rotation.z - Math.PI / 2) % (Math.PI * 2)
            this._mesh.rotation.set(
                this.rotation.x,
                this.rotation.y,
                this.rotation.z
            )
        } else {
            this.rotation.z =
                (this._rotationOffset.z -
                    (d === '-x'
                        ? Math.PI / 2
                        : d === '-z'
                        ? Math.PI
                        : d === 'x'
                        ? (Math.PI / 2) * 3
                        : 0)) %
                (Math.PI * 2)
            this._mesh.rotation.set(
                this._rotationOffset.x,
                this._rotationOffset.y,
                this.rotation.z
            )
        }

        const rot = Math.abs(
            (this._mesh.rotation.z + this._rotationOffset.z) % (Math.PI * 2)
        )
        if (rot == 0) this._direction = 'z'
        else if (rot == Math.PI / 2) this._direction = '-x'
        else if (rot == Math.PI) this._direction = '-z'
        else if (rot == (Math.PI / 2) * 3) this._direction = 'x'
    }

    async turn_left(): Promise<void>
    async turn_left(d: 'x' | '-x' | 'z' | '-z'): Promise<void>
    async turn_left(d?: 'x' | '-x' | 'z' | '-z'): Promise<void> {
        await wait()

        if (d === undefined) {
            this.rotation.z =
                (this.rotation.z - (Math.PI / 2) * 3) % (Math.PI * 2)
            this._mesh.rotation.set(
                this.rotation.x,
                this.rotation.y,
                this.rotation.z
            )
        } else {
            this.rotation.z =
                (this._rotationOffset.z +
                    (d === '-x'
                        ? Math.PI / 2
                        : d === '-z'
                        ? Math.PI
                        : d === 'x'
                        ? (Math.PI / 2) * 3
                        : 0)) %
                (Math.PI * 2)
            this._mesh.rotation.set(
                this._rotationOffset.x,
                this._rotationOffset.y,
                this.rotation.z
            )
        }

        const rot = Math.abs(
            (this._mesh.rotation.z + this._rotationOffset.z) % (Math.PI * 2)
        )
        if (rot == 0) this._direction = 'z'
        else if (rot == Math.PI / 2) this._direction = '-x'
        else if (rot == Math.PI) this._direction = '-z'
        else if (rot == (Math.PI / 2) * 3) this._direction = 'x'
    }

    async put(): Promise<void>
    async put(
        color: 'orange' | 'blue' | 'green' | 'pink' | 'red' | 'purple'
    ): Promise<void>
    async put(
        color: 'orange' | 'blue' | 'green' | 'pink' | 'red' | 'purple' = 'blue'
    ): Promise<void> {
        await wait()

        const pos: { x: number; y: number; z: number } = JSON.parse(
            JSON.stringify(this._position)
        )

        if (this._direction === 'x') {
            pos.x += 1
        } else if (this._direction === '-x') {
            pos.x -= 1
        } else if (this._direction === 'z') {
            pos.z += 1
        } else if (this._direction === '-z') {
            pos.z -= 1
        }

        await this._world.addBox(pos.x, pos.z, color)
    }

    async pick() {
        await wait()

        const pos: { x: number; y: number; z: number } = JSON.parse(
            JSON.stringify(this._position)
        )

        if (this._direction === 'x') {
            pos.x += 1
        } else if (this._direction === '-x') {
            pos.x -= 1
        } else if (this._direction === 'z') {
            pos.z += 1
        } else if (this._direction === '-z') {
            pos.z -= 1
        }

        await this._world.removeBox(pos.x, pos.z)
    }

    async mark() {
        await wait()

        const pos: { x: number; y: number; z: number } = JSON.parse(
            JSON.stringify(this._position)
        )

        await this._world.addMark(pos.x, pos.z)
    }

    async removeMark() {
        await wait()

        const pos: { x: number; y: number; z: number } = JSON.parse(
            JSON.stringify(this._position)
        )

        await this._world.removeMark(pos.x, pos.z)
    }

    // ########################################################################################################
    // staic methods

    /**
     * Creates a 'lego' Character
     * @param _world
     * @returns a Charakter
     */
    static async createLegoCharacter(_world: World) {
        const _mesh = await new Promise((resolve) => {
            new FBXLoader().load(legoFigure, (fbx) => {
                fbx.scale.set(0.005, 0.005, 0.005)
                fbx.rotateX(Math.PI / 2)
                resolve(fbx)
            })
        })

        const m = _mesh as THREE.Group

        m.traverse((model) => {
            if ((model as Mesh).isMesh)
                (model as Mesh).material = new MeshBasicMaterial({
                    color: ((model as Mesh).material as MeshPhongMaterial)
                        .specular,
                    map: ((model as Mesh).material as MeshPhongMaterial).map,
                    side: DoubleSide,
                })
        })

        return new Character(
            _mesh as THREE.Mesh,
            _world,
            { x: 1, y: 0.58, z: 1 },
            { x: -Math.PI / 2, y: 0, z: 0 },
            { x: 0.002, y: 0.002, z: 0.002 }
        )
    }

    /**
     * Creates a 'cone' Character
     * @param _world
     * @returns a Charakter
     */
    static async createDefaultCharacter(_world: World) {
        return new Character(
            new THREE.Mesh(
                new THREE.ConeGeometry(0.2, 0.7, 6),
                new THREE.MeshBasicMaterial({
                    color: 'rgb(200,100,100)',
                    side: THREE.DoubleSide,
                })
            ),
            _world,
            { x: 1, y: 0.3, z: 1 },
            { x: -Math.PI / 2, y: 0, z: -Math.PI },
            { x: 1, y: 1, z: 1 }
        )
    }
}
