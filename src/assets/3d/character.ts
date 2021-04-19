import * as THREE from 'three'
import { World } from './world'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

import legoFigure from '!!url-loader!@/assets/3d/models/characters/lego_minifigure.fbx'
import { Mesh, MeshBasicMaterial, MeshPhongMaterial } from 'three'

export class Character {
    private rotation: { x: number; y: number; z: number }

    // ########################################################################################################
    // constructor

    constructor(
        private mesh: THREE.Group | THREE.Mesh,
        private world: World,
        private readonly positionOffset: { x: number; y: number; z: number } = {
            x: 0,
            y: 0,
            z: 0,
        },
        private readonly rotationOffset: { x: number; y: number; z: number } = {
            x: 0,
            y: 0,
            z: 0,
        },
        private readonly scale: { x: number; y: number; z: number } = {
            x: 1,
            y: 1,
            z: 1,
        },
        private position: { x: number; y: number; z: number } = {
            x: 0,
            y: 0,
            z: 0,
        },
        private direction: 'x' | '-x' | 'z' | '-z' = 'z',
        private height: number = 0
    ) {
        mesh.position.set(
            positionOffset.x + position.x,
            positionOffset.y + position.y,
            positionOffset.z + position.z
        )
        mesh.scale.set(scale.x, scale.y, scale.z)
        mesh.rotation.set(rotationOffset.x, rotationOffset.y, rotationOffset.z)
        this.rotation = {
            x: this.rotationOffset.x,
            y: this.rotationOffset.y,
            z: this.rotationOffset.z,
        }
    }

    // ########################################################################################################
    // getter

    get Position() {
        return this.position
    }

    get PositionInFrontOf() {
        return this.position
    }

    get Mesh() {
        return this.mesh
    }

    get Direction() {
        return this.direction
    }

    get Height() {
        return this.height
    }

    toString() {
        return JSON.stringify(this)
    }

    // ########################################################################################################
    // setter

    set World(value: World) {
        this.world = value
    }

    // ########################################################################################################
    // methods

    async reset() {
        this.position = {
            x: this.world.ResetPosition.x,
            y:
                this.world.heightOfPosition(
                    this.world.ResetPosition.x,
                    this.world.ResetPosition.x
                ).current / 2,
            z: this.world.ResetPosition.x,
        }
        this.rotation = {
            x: this.rotationOffset.x,
            y: this.rotationOffset.y,
            z: this.rotationOffset.z,
        }

        this.mesh.position.set(
            this.positionOffset.x + this.position.x,
            this.positionOffset.y + this.position.y,
            this.positionOffset.z + this.position.z
        )
        this.mesh.rotation.set(
            this.rotationOffset.x,
            this.rotationOffset.y,
            this.rotationOffset.z
        )

        this.direction = 'z'
    }

    async step(n: number, d: 'x' | '-x' | 'z' | '-z' = this.direction) {
        const old = JSON.parse(JSON.stringify(this.position))

        if (d === 'x') {
            this.position.x += n
        } else if (d === '-x') {
            this.position.x -= n
        } else if (d === 'z') {
            this.position.z += n
        } else if (d === '-z') {
            this.position.z -= n
        }

        const newpos = this.position
        const ch =
            this.world.heightOfPosition(this.position.x, this.position.z)
                .current / 2

        if (ch == this.position.y + 0.5) this.position.y += 0.5
        else if (ch == this.position.y - 0.5) this.position.y -= 0.5
        else if (ch < this.position.y - 0.5 || ch > this.position.y + 0.5) {
            this.position = old
            throw `Character kann nicht von (${old.x}|${old.y * 2}|${
                old.z
            }) nach (${newpos.x}|${
                this.world.heightOfPosition(newpos.x, newpos.z).current
            }|${newpos.z}) laufen: Höhenunterschied zu groß!`
        }

        if (!this.world.isInWorld(this.position.x, this.position.z)) {
            this.position = old
            throw `Character kann nicht von (${old.x}|${old.y * 2}|${
                old.z
            }) nach (${newpos.x}|${
                this.world.heightOfPosition(newpos.x, newpos.z).current
            }|${newpos.z}) laufen: Welt zu klein!`
        }

        this.mesh.position.set(
            this.positionOffset.x + this.position.x,
            this.positionOffset.y + this.position.y,
            this.positionOffset.z + this.position.z
        )
    }

    async turn_right(): Promise<void>
    async turn_right(d: 'x' | '-x' | 'z' | '-z'): Promise<void>
    async turn_right(d?: 'x' | '-x' | 'z' | '-z'): Promise<void> {
        if (d === undefined) {
            this.rotation.z = (this.rotation.z - Math.PI / 2) % (Math.PI * 2)
            this.mesh.rotation.set(
                this.rotation.x,
                this.rotation.y,
                this.rotation.z
            )
        } else {
            this.rotation.z =
                (this.rotationOffset.z -
                    (d === '-x'
                        ? Math.PI / 2
                        : d === '-z'
                        ? Math.PI
                        : d === 'x'
                        ? (Math.PI / 2) * 3
                        : 0)) %
                (Math.PI * 2)
            this.mesh.rotation.set(
                this.rotationOffset.x,
                this.rotationOffset.y,
                this.rotation.z
            )
        }

        const rot = Math.abs(
            (this.mesh.rotation.z + this.rotationOffset.z) % (Math.PI * 2)
        )
        if (rot == 0) this.direction = 'z'
        else if (rot == Math.PI / 2) this.direction = '-x'
        else if (rot == Math.PI) this.direction = '-z'
        else if (rot == (Math.PI / 2) * 3) this.direction = 'x'
    }

    async turn_left(): Promise<void>
    async turn_left(d: 'x' | '-x' | 'z' | '-z'): Promise<void>
    async turn_left(d?: 'x' | '-x' | 'z' | '-z'): Promise<void> {
        if (d === undefined) {
            this.rotation.z =
                (this.rotation.z - (Math.PI / 2) * 3) % (Math.PI * 2)
            this.mesh.rotation.set(
                this.rotation.x,
                this.rotation.y,
                this.rotation.z
            )
        } else {
            this.rotation.z =
                (this.rotationOffset.z +
                    (d === '-x'
                        ? Math.PI / 2
                        : d === '-z'
                        ? Math.PI
                        : d === 'x'
                        ? (Math.PI / 2) * 3
                        : 0)) %
                (Math.PI * 2)
            this.mesh.rotation.set(
                this.rotationOffset.x,
                this.rotationOffset.y,
                this.rotation.z
            )
        }

        const rot = Math.abs(
            (this.mesh.rotation.z + this.rotationOffset.z) % (Math.PI * 2)
        )
        if (rot == 0) this.direction = 'z'
        else if (rot == Math.PI / 2) this.direction = '-x'
        else if (rot == Math.PI) this.direction = '-z'
        else if (rot == (Math.PI / 2) * 3) this.direction = 'x'
    }

    async put(): Promise<void>
    async put(
        color: 'orange' | 'blue' | 'green' | 'pink' | 'red' | 'purple'
    ): Promise<void>
    async put(
        color: 'orange' | 'blue' | 'green' | 'pink' | 'red' | 'purple' = 'blue'
    ): Promise<void> {
        const pos: { x: number; y: number; z: number } = JSON.parse(
            JSON.stringify(this.position)
        )

        if (this.direction === 'x') {
            pos.x += 1
        } else if (this.direction === '-x') {
            pos.x -= 1
        } else if (this.direction === 'z') {
            pos.z += 1
        } else if (this.direction === '-z') {
            pos.z -= 1
        }

        await this.world.addBox(pos.x, pos.z, color)
    }

    async pick() {
        const pos: { x: number; y: number; z: number } = JSON.parse(
            JSON.stringify(this.position)
        )

        if (this.direction === 'x') {
            pos.x += 1
        } else if (this.direction === '-x') {
            pos.x -= 1
        } else if (this.direction === 'z') {
            pos.z += 1
        } else if (this.direction === '-z') {
            pos.z -= 1
        }

        await this.world.removeBox(pos.x, pos.z)
    }

    // ########################################################################################################
    // staic methods

    static async createLegoCharacter(world: World) {
        const mesh = await new Promise((resolve) => {
            new FBXLoader().load(legoFigure, (fbx) => {
                fbx.scale.set(0.005, 0.005, 0.005)
                fbx.rotateX(Math.PI / 2)
                resolve(fbx)
            })
        })

        const m = mesh as THREE.Group

        m.traverse((model) => {
            if ((model as Mesh).isMesh)
                (model as Mesh).material = new MeshBasicMaterial({
                    color: ((model as Mesh).material as MeshPhongMaterial)
                        .specular,
                })
        })

        return new Character(
            mesh as THREE.Mesh,
            world,
            { x: 1, y: 0.58, z: 1 },
            { x: -Math.PI / 2, y: 0, z: 0 },
            { x: 0.002, y: 0.002, z: 0.002 }
        )
    }

    static async createDefaultCharacter(world: World) {
        return new Character(
            new THREE.Mesh(
                new THREE.ConeGeometry(0.2, 0.7, 6),
                new THREE.MeshBasicMaterial({
                    color: 'rgb(200,100,100)',
                    side: THREE.DoubleSide,
                })
            ),
            world,
            { x: 1, y: 0.3, z: 1 },
            { x: -Math.PI / 2, y: 0, z: -Math.PI },
            { x: 1, y: 1, z: 1 }
        )
    }
}
