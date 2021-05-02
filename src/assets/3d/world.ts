import {
    BoxGeometry,
    DoubleSide,
    Group,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    Texture,
    TextureLoader,
} from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

import floor from '@/assets/3d/models/floor/floor.png'
import wall from '@/assets/3d/models/wall/wall.png'

import boxOrange from '@/assets/3d/models/box/box.orange.png'
import boxBlue from '@/assets/3d/models/box/box.blue.png'
import boxGreen from '@/assets/3d/models/box/box.green.png'
import boxPink from '@/assets/3d/models/box/box.pink.png'
import boxRed from '@/assets/3d/models/box/box.red.png'
import boxPurple from '@/assets/3d/models/box/box.purple.png'

import box from '@/assets/3d/models/box/box.fbx'
import mark from '@/assets/3d/models/mark/mark.fbx'

export function createFloorPart(texture: Texture) {
    return new Mesh(
        new BoxGeometry(1, 0.001, 1),
        new MeshBasicMaterial({ map: texture, side: DoubleSide })
    )
}

export function createWallPart(texture: Texture) {
    return new Mesh(
        new BoxGeometry(1, 0.5, 0.001),
        new MeshBasicMaterial({ map: texture, side: DoubleSide })
    )
}

export function createWorld(
    textureFloor: Texture,
    textureWall: Texture,
    w = 1,
    h = 1,
    d = 1
) {
    const master = new Mesh()

    let newPart: Mesh

    for (let width = 1; width <= w; width++)
        for (let depth = 1; depth <= d; depth++) {
            newPart = createFloorPart(textureFloor)

            newPart.position.set(width, 0, depth)

            master.add(newPart)
        }

    for (let height = 0; height < h; height++) {
        for (let width = 1; width <= w; width++) {
            newPart = createWallPart(textureWall)

            newPart.position.set(width, 0.25 + 0.5 * height, d + 0.5)

            master.add(newPart)
        }

        for (let depth = 1; depth <= d; depth++) {
            newPart = createWallPart(textureWall)

            newPart.rotateY(Math.PI / 2)
            newPart.position.set(w + 0.5, 0.25 + 0.5 * height, depth)

            master.add(newPart)
        }
    }

    return master
}

export class World {
    private isInit = false

    // Root Mesh
    private mesh!: Mesh | Group

    // Meshes
    private box!: Mesh | Group
    private mark!: Mesh | Group

    // World Data
    private size!: { width: number; height: number; depth: number }
    private resetPosition!: { x: number; z: number }

    private boxOffset = { x: 1.05, y: 0.25, z: 1 }
    private markOffset = { x: 1, y: 0.001, z: 1 }

    private boxes: {
        [key: string]: { height: number; meshes: Array<Mesh | Group> }
    } = {}
    private marked: { [key: string]: Mesh | Group } = {}

    // Textures
    private TextureFloor!: Texture
    private TextureWall!: Texture

    private TextureBoxOrange!: Texture
    private TextureBoxBlue!: Texture
    private TextureBoxGreen!: Texture
    private TextureBoxPink!: Texture
    private TextureBoxRed!: Texture
    private TextureBoxPurple!: Texture

    // --------------------------------------------------------------------------------------------------------
    // init & make

    async init() {
        await Promise.all([this.loadObjects(), this.loadTextures()])
        this.isInit = true

        return this
    }

    async makeWorld(
        json = '{"size":{"width":5,"height":5,"depth":8},"resetPosition":{"x":0,"z":0},"boxes":[],"marked":[]}'
    ) {
        if (!this.isInit) throw 'init() methode must be called first!'
        const pj = JSON.parse(json)
        this.size = pj.size
        this.mesh = createWorld(
            this.TextureFloor,
            this.TextureWall,
            this.size.width,
            this.size.height,
            this.size.depth
        )

        return this
    }

    async createNewWorld({
        w = 5,
        h = 5,
        d = 8,
    }: {
        w: number
        h: number
        d: number
    }) {
        return `{"size":{"width":${w},"height":${h},"depth":${d}},"resetPosition":{"x":0,"z":0},"boxes":[],"marked":[]}`
    }

    // --------------------------------------------------------------------------------------------------------
    // getters

    get Mesh() {
        return this.mesh
    }

    get ResetPosition() {
        return this.resetPosition
    }

    toJSON() {
        const boxes: string[] = []
        const marked: string[] = []
        for (const box in this.boxes) {
            if (this.boxes[box].height !== 0) {
                boxes.push(...Array(this.boxes[box].height).fill(box))
            }
        }
        for (const mark in this.marked) {
            if (this.boxes[mark].height) {
                boxes.push(mark)
            }
        }
        return JSON.stringify({
            size: this.size,
            resetPosition: this.resetPosition,
            boxes: boxes,
            marked: marked,
        })
    }

    isInWorld(x: number, z: number) {
        return x >= 0 && x < this.size.width && z >= 0 && z < this.size.depth
    }

    isWall(
        d: 'x' | '-x' | 'z' | '-z',
        x: { x: number; z: number; [key: string]: any }
    ): boolean
    isWall(d: 'x' | '-x' | 'z' | '-z', x: number, z: number): boolean
    isWall(
        d: 'x' | '-x' | 'z' | '-z',
        x: number | { x: number; z: number; [key: string]: any },
        z?: number
    ): boolean {
        if (z === undefined && typeof x !== 'number') {
            z = x.z
            x = x.x
        }
        return (
            (x === 0 && d === '-x') ||
            (x === this.size.width - 1 && d === 'x') ||
            (z === 0 && d === '-z') ||
            (z === this.size.depth - 1 && d === 'z')
        )
    }

    isBox(
        d: 'x' | '-x' | 'z' | '-z',
        x: { x: number; z: number; [key: string]: any }
    ): boolean
    isBox(d: 'x' | '-x' | 'z' | '-z', x: number, z: number): boolean
    isBox(
        d: 'x' | '-x' | 'z' | '-z',
        x: number | { x: number; z: number; [key: string]: any },
        z?: number
    ): boolean {
        if (z === undefined && typeof x !== 'number') {
            z = x.z
            x = x.x
        }
        return (
            (d === '-x' &&
                this.boxes[`${<number>x - 1}:${z}`] !== undefined &&
                this.boxes[`${<number>x - 1}:${z}`].height !== 0) ||
            (d === 'x' &&
                this.boxes[`${<number>x + 1}:${z}`] !== undefined &&
                this.boxes[`${<number>x + 1}:${z}`].height !== 0) ||
            (d === '-z' &&
                this.boxes[`${<number>x}:${<number>z - 1}`] !== undefined &&
                this.boxes[`${<number>x}:${<number>z - 1}`].height !== 0) ||
            (d === 'z' &&
                this.boxes[`${<number>x}:${<number>z + 1}`] !== undefined &&
                this.boxes[`${<number>x}:${<number>z + 1}`].height !== 0)
        )
    }

    isMarked(x: number, z: number) {
        return this.marked[`${x}:${z}`]
    }

    heightOfPosition(x: number, z: number) {
        return {
            current: this.boxes[`${x}:${z}`]
                ? this.boxes[`${x}:${z}`].height
                : 0,
            max: this.size.height - 1,
        }
    }

    // --------------------------------------------------------------------------------------------------------
    // methodes

    private async loadObjects() {
        this.box = await new Promise((resolve) => {
            new FBXLoader().load(box, (fbx) => {
                fbx.scale.set(0.005, 0.005, 0.005)
                fbx.rotateX(Math.PI / 2)
                resolve(fbx)
            })
        })
        this.mark = await new Promise((resolve) => {
            new FBXLoader().load(mark, (fbx) => {
                fbx.scale.set(0.005, 0.005, 0.005)
                fbx.rotateX(Math.PI / 2)
                resolve(fbx)
            })
        })
    }

    private loadTextures() {
        this.TextureFloor = new TextureLoader().load(floor)
        this.TextureWall = new TextureLoader().load(wall)

        this.TextureBoxOrange = new TextureLoader().load(boxOrange)
        this.TextureBoxBlue = new TextureLoader().load(boxBlue)
        this.TextureBoxGreen = new TextureLoader().load(boxGreen)
        this.TextureBoxPink = new TextureLoader().load(boxPink)
        this.TextureBoxRed = new TextureLoader().load(boxRed)
        this.TextureBoxPurple = new TextureLoader().load(boxPurple)
    }

    async addBox(x: number, z: number): Promise<THREE.Group | THREE.Mesh>
    async addBox(
        x: number,
        z: number,
        color: 'orange' | 'blue' | 'green' | 'pink' | 'red' | 'purple'
    ): Promise<THREE.Group | THREE.Mesh>
    async addBox(
        x: number,
        z: number,
        color: 'orange' | 'blue' | 'green' | 'pink' | 'red' | 'purple' = 'blue'
    ): Promise<THREE.Group | THREE.Mesh> {
        if (
            this.boxes[`${x}:${z}`] &&
            this.boxes[`${x}:${z}`].height >= this.size.height
        )
            throw `Box kann nicht plaziert werden an der Stelle (${x}|${
                this.size.height + 1
            }|${z}): Welt zu niedrig!`

        if (x < 0 || x >= this.size.width || z < 0 || z >= this.size.depth)
            throw `Box kann nicht plaziert werden an der Stelle (${x}|${this.size.height}|${z}): Stelle ist außerhalb der Welt!`

        const box = this.box.clone() as Group

        box.traverse((model) => {
            if ((model as THREE.Mesh).isMesh)
                (model as THREE.Mesh).material = new MeshBasicMaterial({
                    map:
                        color === 'orange'
                            ? this.TextureBoxOrange
                            : color === 'blue'
                            ? this.TextureBoxBlue
                            : color === 'green'
                            ? this.TextureBoxGreen
                            : color === 'pink'
                            ? this.TextureBoxPink
                            : color === 'red'
                            ? this.TextureBoxRed
                            : this.TextureBoxPurple,
                })
        })

        if (this.boxes[`${x}:${z}`] !== undefined) {
            this.boxes[`${x}:${z}`].height += 1
            this.boxes[`${x}:${z}`].meshes.push(box)
        } else
            this.boxes[`${x}:${z}`] = {
                height: 1,
                meshes: new Array<Mesh | Group>(box),
            }

        box.position.set(
            this.boxOffset.x + x,
            this.boxOffset.y + (this.boxes[`${x}:${z}`].height - 1) / 2,
            this.boxOffset.z + z
        )

        this.mesh.add(box)

        if (this.marked[`${x}:${z}`] !== undefined) {
            this.marked[`${x}:${z}`].position.set(
                this.markOffset.x + x,
                this.markOffset.y +
                    (this.boxes[`${x}:${z}`]
                        ? 0.5 + (this.boxes[`${x}:${z}`].height - 1) / 2
                        : 0),
                this.markOffset.z + z
            )
        }

        return box
    }

    async removeBox(x: number, z: number) {
        if (
            this.boxes[`${x}:${z}`] === undefined ||
            this.boxes[`${x}:${z}`].height === 0
        )
            throw `Box kann nicht entfernt werden an der Stelle (${x}|1|${z}): Keine Box vorhanden!`

        this.boxes[`${x}:${z}`].height -= 1
        const box = this.boxes[`${x}:${z}`].meshes.pop()
        this.mesh.remove(box as Object3D)

        if (this.marked[`${x}:${z}`] !== undefined) {
            this.marked[`${x}:${z}`].position.set(
                this.markOffset.x + x,
                this.markOffset.y +
                    (this.boxes[`${x}:${z}`]
                        ? 0.5 + (this.boxes[`${x}:${z}`].height - 1) / 2
                        : 0),
                this.markOffset.z + z
            )
        }
    }

    async addMark(x: number, z: number): Promise<THREE.Group | THREE.Mesh> {
        if (this.marked[`${x}:${z}`] !== undefined)
            throw `Markierung kann nicht plaziert werden an der Stelle (${x}|${this.size.height}|${z}): Markierung schon gestzt!`

        if (x < 0 || x >= this.size.width || z < 0 || z >= this.size.depth)
            throw `Markierung kann nicht plaziert werden an der Stelle (${x}|${this.size.height}|${z}): Stelle ist außerhalb der Welt!`

        const mark = this.mark.clone() as Group

        mark.traverse((model) => {
            if ((model as THREE.Mesh).isMesh)
                (model as THREE.Mesh).material = new MeshBasicMaterial({
                    color: 'rgb(0,0,0)',
                    side: DoubleSide,
                })
        })

        this.marked[`${x}:${z}`] = mark

        mark.position.set(
            this.markOffset.x + x,
            this.markOffset.y +
                (this.boxes[`${x}:${z}`]
                    ? 0.5 + (this.boxes[`${x}:${z}`].height - 1) / 2
                    : 0),
            this.markOffset.z + z
        )

        this.mesh.add(mark)

        return mark
    }

    async removeMark(x: number, z: number) {
        if (this.marked[`${x}:${z}`] === undefined)
            throw `Markierung kann nicht entfernt werden an der Stelle (${x}|1|${z}): Keine Markierung vorhanden!`

        this.mesh.remove(this.marked[`${x}:${z}`] as Object3D)

        delete this.marked[`${x}:${z}`]
    }
}
