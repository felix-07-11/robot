/* eslint-disable */

//#region import

import {
    BinaryOperationNode,
    Nodes,
    NumberNode,
    Position,
    RSError,
    UnaryOperationNode,
    VarAccessNode,
    VarAssignNode,
} from './parser'

//#endregion

//#region Runtime Error

export class RSRuntimeError extends RSError {
    constructor(
        details: string,
        posStart: Position,
        posEnd: Position,
        private _context: Context
    ) {
        super('Laufzeitfehler', details, posStart, posEnd)
    }

    toString() {
        return `Zeile ${this.posStart.line + 1} in ${
            this._context.displayName
        }\n${this.error}: ${this.details}`
    }
}

//#endregion

//#region Interpreter

export class Interpreter {
    private _run_VarAccessNode(node: Nodes, context: Context) {
        const res = new RTResult()
        const n = node as VarAccessNode
        let value = context.symboltable?.getVar(n.varName.value)

        if (!value)
            return res.fail(
                new RSRuntimeError(
                    `${n.varName.value} ist nicht definiert.`,
                    n.posStart,
                    n.posEnd,
                    context
                )
            )

        value = value.copy.setPos(n.posStart, n.posEnd)
        return res.success(value)
    }

    private _run_VarAssignNode(node: Nodes, context: Context) {
        const res = new RTResult()
        const n = node as VarAssignNode

        const value = res.register(this.run(n.node, context))

        if (res.error) return res

        context.symboltable?.setVar(n.varName.value, value)
        return res.success(value as RSNumber)
    }

    // -----------------------------------------------------

    private _run_NumberNode(node: Nodes, context: Context) {
        return new RTResult().success(
            new RSNumber(
                (<NumberNode>node).token.value,
                context,
                node.posStart,
                node.posEnd
            )
        )
    }

    private _run_BinaryOperationNode(node: Nodes, context: Context) {
        const res = new RTResult()
        const left = res.register(
            this.run((<BinaryOperationNode>node).leftNode, context)
        )
        const right = res.register(
            this.run((<BinaryOperationNode>node).rightNode, context)
        )
        const op = (<BinaryOperationNode>node).operationToken

        let number: RSNumber | undefined = undefined,
            error: RSRuntimeError | undefined = undefined

        if (op.type === 'plus') number = left.add(right).number
        else if (op.type === 'minus') number = left.sub(right).number
        else if (op.type === 'mul') number = left.mul(right).number
        else if (op.type === 'div') {
            const r = left.div(right)
            number = r.number
            error = r.error
        }
        // equals
        else if (op.type === 'ee') {
            const r = left.compareEE(right)
            number = r.number
            error = r.error
        }
        // not equals
        else if (op.type === 'ne') {
            const r = left.compareNE(right)
            number = r.number
            error = r.error
        }
        // less than
        else if (op.type === 'lt') {
            const r = left.compareLT(right)
            number = r.number
            error = r.error
        }
        // less than equals
        else if (op.type === 'lte') {
            const r = left.compareLTE(right)
            number = r.number
            error = r.error
        }
        // greater than
        else if (op.type === 'gt') {
            const r = left.compareGT(right)
            number = r.number
            error = r.error
        }
        // greater than equals
        else if (op.type === 'gte') {
            const r = left.compareGTE(right)
            number = r.number
            error = r.error
        }
        // logical and
        else if (op.matches('keyword', 'und')) {
            const r = left.and(right)
            number = r.number
            error = r.error
        }
        // logical or
        else if (op.matches('keyword', 'oder')) {
            const r = left.or(right)
            number = r.number
            error = r.error
        }

        if (error) return res.fail(error)
        else
            return res.success(
                (number as RSNumber).setPos(node.posStart, node.posEnd)
            )
    }

    private _run_UnaryOperationNode(node: Nodes, context: Context) {
        const res = new RTResult()
        const number = res.register(
            this.run((<UnaryOperationNode>node).node, context)
        )
        if (res.error) return res

        if ((<UnaryOperationNode>node).operationToken.type === 'minus')
            return res.success(
                (number.mul(new RSNumber(-1, context))
                    .number as RSNumber).setPos(node.posStart, node.posEnd)
            )
        return res.success(
            (number.mul(new RSNumber(1, context)).number as RSNumber).setPos(
                node.posStart,
                node.posEnd
            )
        )
    }

    // -----------------------------------------------------

    public run(node: Nodes): RTResult
    public run(node: Nodes, context: Context): RTResult
    public run(node: Nodes, context?: Context): RTResult {
        const func_name = `_run_${node.constructor.name}`

        if (!context) {
            context = new Context({
                displayName: '<programm>',
                symboltable: new SymbolTable(),
            })
            context.symboltable?.setVar(
                'null',
                new RSNumber(
                    0,
                    context,
                )
            )
            context.symboltable?.setVar(
                'wahr',
                new RSNumber(
                    1,
                    context,
                )
            )
            context.symboltable?.setVar(
                'falsch',
                new RSNumber(
                    0,
                    context,
                )
            )
        }

        if (func_name in this) return (this as any)[func_name](node, context)
        else throw new Error(`No ${func_name} method defined`)
    }
}

//#endregion

//#region Runtime Result

export class RTResult {
    private _value!: RSNumber
    private _error!: RSRuntimeError

    constructor() {}

    get value() {
        return this._value
    }

    get error() {
        return this._error
    }

    register(res: RTResult) {
        if (res.error) this._error = res.error
        return res._value
    }

    success(value: RSNumber) {
        this._value = value
        return this
    }

    fail(error: RSRuntimeError) {
        this._error = error
        return this
    }
}

//#endregion

//#region Context

class Context {
    private _displayName: string
    private _parent: Context | null = null
    private _entry: any
    private _symboltable: SymbolTable | null = null

    constructor({
        displayName,
        entry,
        parent,
        symboltable,
    }: {
        displayName: string
        entry?: any
        parent?: Context
        symboltable?: SymbolTable
    }) {
        this._displayName = displayName
        if (entry) this._entry = entry
        if (parent) this._parent = parent
        if (symboltable) this._symboltable = symboltable
    }

    get displayName() {
        return this._displayName
    }

    get symboltable() {
        return this._symboltable
    }
}

//#endregion

//#region Syboltable

class SymbolTable {
    constructor(
        private _symbols: { [key: string]: any } = {},
        private _parent?: SymbolTable
    ) {}

    getVar(name: string): any {
        if (!(name in this._symbols) && this._parent)
            return this._parent.getVar(name)
        if (!(name in this._symbols)) return null
        return this._symbols[name]
    }

    setVar(name: string, val: any) {
        this._symbols[name] = val
    }

    rmVar(name: string) {
        delete this._symbols[name]
    }
}

//#endregion

//#region Values

interface ReturnRSNumber {
    number: RSNumber | undefined
    error?: RSRuntimeError
}

class RSNumber {
    private _posStart!: Position
    private _posEnd!: Position

    constructor(
        public value: number,
        private _context: Context,
        posStart?: Position,
        posEnd?: Position
    ) {
        if (posStart) this._posStart = posStart
        if (posEnd) this._posEnd = posEnd
    }

    toString() {
        return this.value
    }

    get posStart() {
        return this._posStart
    }

    get posEnd() {
        return this._posEnd
    }

    get copy() {
        const copy = new RSNumber(
            this.value,
            this._context,
            this.posStart,
            this.posEnd
        )
        return copy
    }

    public setPos(posStart: Position, posEnd: Position): RSNumber {
        this._posStart = posStart
        this._posEnd = posEnd
        return this
    }

    public add(other: RSNumber): ReturnRSNumber {
        return { number: new RSNumber(this.value + other.value, this._context) }
    }

    public sub(other: RSNumber): ReturnRSNumber {
        return { number: new RSNumber(this.value - other.value, this._context) }
    }

    public mul(other: RSNumber): ReturnRSNumber {
        return { number: new RSNumber(this.value * other.value, this._context) }
    }

    public div(other: RSNumber): ReturnRSNumber {
        if (other.value == 0)
            return {
                number: undefined,
                error: new RSRuntimeError(
                    `Teilen durch 0 nicht möglich`,
                    other.posStart,
                    other.posEnd,
                    this._context
                ),
            }
        return { number: new RSNumber(this.value / other.value, this._context) }
    }

    compareEE(other: RSNumber): ReturnRSNumber {
        return {
            number: new RSNumber(
                Number(Number(this.value) == Number(other.value)),
                this._context
            ),
        }
    }

    compareNE(other: RSNumber): ReturnRSNumber {
        return {
            number: new RSNumber(
                Number(Number(this.value) != Number(other.value)),
                this._context
            ),
        }
    }

    compareLT(other: RSNumber): ReturnRSNumber {
        return {
            number: new RSNumber(
                Number(Number(this.value) < Number(other.value)),
                this._context
            ),
        }
    }

    compareLTE(other: RSNumber): ReturnRSNumber {
        return {
            number: new RSNumber(
                Number(Number(this.value) <= Number(other.value)),
                this._context
            ),
        }
    }

    compareGT(other: RSNumber): ReturnRSNumber {
        return {
            number: new RSNumber(
                Number(Number(this.value) > Number(other.value)),
                this._context
            ),
        }
    }

    compareGTE(other: RSNumber): ReturnRSNumber {
        return {
            number: new RSNumber(
                Number(Number(this.value) >= Number(other.value)),
                this._context
            ),
        }
    }

    and(other: RSNumber): ReturnRSNumber {
        return {
            number: new RSNumber(
                Number(Number(this.value) && Number(other.value)),
                this._context
            ),
        }
    }

    or(other: RSNumber): ReturnRSNumber {
        return {
            number: new RSNumber(
                Number(Number(this.value) || Number(other.value)),
                this._context
            ),
        }
    }

    not(): ReturnRSNumber {
        return { number: new RSNumber(this.value == 0 ? 1 : 0, this._context) }
    }
}

//#endregion
