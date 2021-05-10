/* eslint-disable */

//#region import

import { Character } from '../3d/character'
import { World } from '../3d/world'
import {
    BinaryOperationNode,
    ForNode,
    FunctionCallNode,
    FunctionDefineNode,
    IfNode,
    Nodes,
    NumberNode,
    Position,
    RSError,
    Token,
    UnaryOperationNode,
    VarAccessNode,
    VarAssignNode,
    WhileNode,
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
    constructor(private _character: Character, private _world: World) {}

    private _run_VarAccessNode(node: Nodes, context: Context) {
        const res = new RTResult()
        const n = node as VarAccessNode
        let value = context.symboltable?.getVar(n.varName.value) as RSNumber

        if (!value)
            return res.fail(
                new RSRuntimeError(
                    `${n.varName.value} ist nicht definiert.`,
                    n.posStart,
                    n.posEnd,
                    context
                )
            )

        value = value.copy.setPos(n.posStart, n.posEnd) as RSNumber
        value.context = context
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

    private _run_FunctionDefineNode(node: Nodes, context: Context) {
        const res = new RTResult()

        const n = node as FunctionDefineNode

        const fName = n.varName.value
        const bodyNode = n.body
        const args = n.args.map<Token>((arg) => arg.value) as any[]
        const f = new RSFunction(
            fName,
            bodyNode,
            args,
            context,
            node.posStart,
            node.posEnd
        )

        context.symboltable?.setVar(fName, f)

        return res.success(f)
    }

    private _run_FunctionCallNode(node: Nodes, context: Context) {
        const res = new RTResult()

        const n = node as FunctionCallNode

        const args = []
        let toCall = res.register(this.run(n.callName, context))
        if (res.error) return res

        toCall = toCall.copy.setPos(node.posStart, node.posEnd)

        for (const arg of n.args) {
            args.push(res.register(this.run(arg, context)))
            if (res.error) return res
        }

        let rv = res.register(toCall.execute(args))
        if (res.error) return res

        rv = rv.copy.setPos(n.posStart, n.posEnd)
        rv.context = context
        return res.success(rv)
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
        ) as RSNumber
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
                (number as RSNumber).setPos(
                    node.posStart,
                    node.posEnd
                ) as RSNumber
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
                    .number as RSNumber).setPos(
                    node.posStart,
                    node.posEnd
                ) as RSNumber
            )
        return res.success(
            (number.mul(new RSNumber(1, context)).number as RSNumber).setPos(
                node.posStart,
                node.posEnd
            ) as RSNumber
        )
    }

    // -----------------------------------------------------

    private _run_IfNode(node: Nodes, context: Context) {
        const res = new RTResult()

        const n = node as IfNode

        const con = res.register(this.run(n.caseIf.condition, context))

        if (res.error) return res

        if (con.isTrue()) {
            const ex = res.register(this.run(n.caseIf.expression, context))
            if (res.error) return res

            return res.success(ex)
        }

        if (n.caseElse) {
            const el = res.register(this.run(n.caseElse))
            if (res.error) return res
            return res.success(el)
        }
    }

    private _run_ForNode(node: Nodes, context: Context) {
        const res = new RTResult()

        const n = node as ForNode

        const start = res.register(this.run(n.start, context)) as RSNumber
        if (res.error) return res

        const end = res.register(this.run(n.end, context)) as RSNumber
        if (res.error) return res

        const step = res.register(this.run(n.step, context)) as RSNumber
        if (res.error) return res

        let i = start.value

        while (i < end.value) {
            res.register(this.run(n.body, context))
            if (res.error) return res

            i += step.value
        }
    }

    private _run_WhileNode(node: Nodes, context: Context) {
        const res = new RTResult()

        const n = node as WhileNode

        while (true) {
            const con = res.register(this.run(n.condition, context))
            if (res.error) return res

            if (!con.isTrue()) break

            res.register(this.run(n.body, context))
            if (res.error) return res
        }
    }

    // -----------------------------------------------------

    public run(node: Nodes): RTResult
    public run(node: Nodes, context: Context): RTResult
    public run(node: Nodes, context?: Context): RTResult {
        const func_name = `_run_${node.constructor.name}`

        if (!context) {
            context = new Context({
                world: this._world,
                character: this._character,
                displayName: '<programm>',
                symboltable: new SymbolTable(),
            })
            context.symboltable?.setVar('null', new RSNumber(0, context))
            context.symboltable?.setVar('wahr', new RSNumber(1, context))
            context.symboltable?.setVar('falsch', new RSNumber(0, context))
            context.symboltable?.setVar(
                'schritt',
                new RSBuildInFunction('step', context)
            )
            context.symboltable?.setVar(
                'step',
                new RSBuildInFunction('step', context)
            )
            context.symboltable?.setVar(
                'linksdrehen',
                new RSBuildInFunction('turnleft', context)
            )
            context.symboltable?.setVar(
                'turnleft',
                new RSBuildInFunction('turnleft', context)
            )
            context.symboltable?.setVar(
                'rechtsdrehen',
                new RSBuildInFunction('turnright', context)
            )
            context.symboltable?.setVar(
                'turnright',
                new RSBuildInFunction('turnright', context)
            )
            context.symboltable?.setVar(
                'hinlegen',
                new RSBuildInFunction('put', context)
            )
            context.symboltable?.setVar(
                'put',
                new RSBuildInFunction('put', context)
            )
            context.symboltable?.setVar(
                'aufheben',
                new RSBuildInFunction('pick', context)
            )
            context.symboltable?.setVar(
                'pick',
                new RSBuildInFunction('pick', context)
            )
            context.symboltable?.setVar(
                'markieren',
                new RSBuildInFunction('mark', context)
            )
            context.symboltable?.setVar(
                'mark',
                new RSBuildInFunction('mark', context)
            )
            context.symboltable?.setVar(
                'markierungLöschen',
                new RSBuildInFunction('removeMark', context)
            )
            context.symboltable?.setVar(
                'removeMark',
                new RSBuildInFunction('removeMark', context)
            )
        }

        if (func_name in this) return (this as any)[func_name](node, context)
        else throw new Error(`No ${func_name} method defined`)
    }
}

//#endregion

//#region Runtime Result

export class RTResult {
    private _value!: Value
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

    success(value?: Value) {
        if (value) this._value = value
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
    private _parent?: Context
    private _entry: any
    private _symboltable?: SymbolTable
    public world?: World
    public character?: Character

    constructor({
        displayName,
        entry,
        parent,
        symboltable,
        world,
        character,
    }: {
        displayName: string
        entry?: any
        parent?: Context
        symboltable?: SymbolTable
        world?: World
        character?: Character
    }) {
        this._displayName = displayName
        this.world = world
        this.character = character
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
        private _symbols: { [key: string]: Value } = {},
        private _parent?: SymbolTable
    ) {}

    get symbols() {
        return this._symbols
    }

    getVar(name: string): Value | undefined {
        if (!(name in this._symbols) && this._parent)
            return this._parent.getVar(name)
        if (!(name in this._symbols)) return
        return this._symbols[name]
    }

    setVar(name: string, val: Value) {
        this._symbols[name] = val
    }

    rmVar(name: string) {
        delete this._symbols[name]
    }
}

//#endregion

//#region Values

interface RetrunValue {
    number?: RSNumber
    error?: RSRuntimeError
}

class Value {
    protected _posStart!: Position
    protected _posEnd!: Position

    constructor(
        public context: Context,
        posStart?: Position,
        posEnd?: Position
    ) {
        if (posStart) this._posStart = posStart
        if (posEnd) this._posEnd = posEnd
    }

    toString() {
        throw 'No toString function defined'
    }

    get posStart() {
        return this._posStart
    }

    get posEnd() {
        return this._posEnd
    }

    get copy(): Value {
        console.log(this.constructor.name)

        throw 'No copy function defined'
    }

    public setPos(posStart: Position, posEnd: Position): Value {
        this._posStart = posStart
        this._posEnd = posEnd
        return this
    }

    public add(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    public sub(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    public mul(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    public div(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    compareEE(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    compareNE(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    compareLT(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    compareLTE(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    compareGT(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    compareGTE(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    and(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    or(other: RSNumber): RetrunValue {
        return { error: this.illegalOperation(other as Value) }
    }

    not(): RetrunValue {
        return { error: this.illegalOperation() }
    }

    execute(args: any) {
        return new RTResult().fail(this.illegalOperation())
    }

    isTrue(): boolean {
        return false
    }

    illegalOperation(other?: Value) {
        if (!other) other = this

        return new RSRuntimeError(
            'Illegal operation',
            this._posStart,
            this._posEnd,
            this.context
        )
    }
}

class RSNumber extends Value {
    constructor(
        public value: number,
        context: Context,
        posStart?: Position,
        posEnd?: Position
    ) {
        super(context, posStart, posEnd)
    }

    toString() {
        return this.value.toString()
    }

    static get null() {
        return new RSNumber(0, new Context({ displayName: '<number null>' }))
    }

    get copy(): Value {
        const copy = new RSNumber(
            this.value,
            this.context,
            this.posStart,
            this.posEnd
        )
        return copy
    }

    add(other: RSNumber): RetrunValue {
        return { number: new RSNumber(this.value + other.value, this.context) }
    }

    sub(other: RSNumber): RetrunValue {
        return { number: new RSNumber(this.value - other.value, this.context) }
    }

    mul(other: RSNumber): RetrunValue {
        return { number: new RSNumber(this.value * other.value, this.context) }
    }

    div(other: RSNumber): RetrunValue {
        if (other.value == 0)
            return {
                number: undefined,
                error: new RSRuntimeError(
                    `Teilen durch 0 nicht möglich`,
                    other.posStart,
                    other.posEnd,
                    this.context
                ),
            }
        return { number: new RSNumber(this.value / other.value, this.context) }
    }

    compareEE(other: RSNumber): RetrunValue {
        return {
            number: new RSNumber(
                Number(Number(this.value) == Number(other.value)),
                this.context
            ),
        }
    }

    compareNE(other: RSNumber): RetrunValue {
        return {
            number: new RSNumber(
                Number(Number(this.value) != Number(other.value)),
                this.context
            ),
        }
    }

    compareLT(other: RSNumber): RetrunValue {
        return {
            number: new RSNumber(
                Number(Number(this.value) < Number(other.value)),
                this.context
            ),
        }
    }

    compareLTE(other: RSNumber): RetrunValue {
        return {
            number: new RSNumber(
                Number(Number(this.value) <= Number(other.value)),
                this.context
            ),
        }
    }

    compareGT(other: RSNumber): RetrunValue {
        return {
            number: new RSNumber(
                Number(Number(this.value) > Number(other.value)),
                this.context
            ),
        }
    }

    compareGTE(other: RSNumber): RetrunValue {
        return {
            number: new RSNumber(
                Number(Number(this.value) >= Number(other.value)),
                this.context
            ),
        }
    }

    and(other: RSNumber): RetrunValue {
        return {
            number: new RSNumber(
                Number(Number(this.value) && Number(other.value)),
                this.context
            ),
        }
    }

    or(other: RSNumber): RetrunValue {
        return {
            number: new RSNumber(
                Number(Number(this.value) || Number(other.value)),
                this.context
            ),
        }
    }

    not(): RetrunValue {
        return { number: new RSNumber(this.value == 0 ? 1 : 0, this.context) }
    }

    isTrue() {
        if (this.value > 0) return true
        return false
    }
}

class RSBaseFunction extends Value {
    constructor(protected _name: string, context: Context) {
        super(context)
    }

    toString() {
        return `<function ${this._name}>`
    }

    genNewContext() {
        this.context = new Context({
            world: this.context.world,
            character: this.context.character,
            displayName: this._name,
            symboltable: this.context.symboltable,
            parent: this.context,
        })
        return this.context
    }

    checkArgs(argsNames: string[], args: any[]) {
        const res = new RTResult()

        if (args.length < argsNames.length)
            return res.fail(
                new RSRuntimeError(
                    `Zu wenige Argumente an Funktion übergeben. Erwartet: ${argsNames.length}; Übergeben: ${args.length}`,
                    this._posStart,
                    this._posEnd,
                    this.context
                )
            )

        return res.success()
    }

    populateArgs(argsNames: string[], args: any[], executeContext: Context) {
        for (let i = 0; i < args.length; i++) {
            if (argsNames[i] === undefined || args[i] === undefined) break
            args[i].context = executeContext
            executeContext.symboltable?.setVar(argsNames[i], args[i])
        }
    }

    checkPopulateArgs(
        argsNames: string[],
        args: any[],
        executeContext: Context
    ) {
        const res = new RTResult()

        res.register(this.checkArgs(argsNames, args))
        if (res.error) return res

        this.populateArgs(argsNames, args, executeContext)

        return res.success()
    }
}

class RSFunction extends RSBaseFunction {
    constructor(
        name: string,
        private _bodyNode: Nodes,
        private _args: string[],
        context: Context,
        posStart?: Position,
        posEnd?: Position
    ) {
        super(name, context)
        if (posStart && posEnd) this.setPos(posStart, posEnd)
    }

    get name() {
        return this._name
    }

    get bodyNode() {
        return this._bodyNode
    }

    get args() {
        return this._args
    }

    get copy(): Value {
        const copy = new RSFunction(
            this._name,
            this._bodyNode,
            this._args,
            this.context,
            this.posStart,
            this.posEnd
        )
        return copy
    }

    execute(args: Value[]) {
        const res = new RTResult()

        if (!this.context.character || !this.context.world) return res.success()
        const interpreter = new Interpreter(
            this.context.character,
            this.context.world
        )

        const context = new Context({
            world: this.context.world,
            character: this.context.character,
            displayName: this._name,
            parent: this.context,
            symboltable: this.context.symboltable,
        })

        if (args.length < this._args.length)
            return res.fail(
                new RSRuntimeError(
                    `Zu wenige Argumente an Funktion übergeben. Erwartet: ${this._args.length}; Übergeben: ${args.length}`,
                    this._posStart,
                    this._posEnd,
                    this.context
                )
            )

        for (let i = 0; i < args.length; i++) {
            if (this._args[i] === undefined) break
            args[i].context = context
            context.symboltable?.setVar(this._args[i], args[i])
        }

        const body = res.register(interpreter.run(this._bodyNode, context))
        if (res.error) return res
        return res.success(body)
    }
}

class RSBuildInFunction extends RSBaseFunction {
    private _argNames: { [key: string]: string[] } = {
        function_step: [],
        function_turnleft: [],
        function_turnright: [],
        function_put: [],
        function_pick: [],
        function_mark: [],
        function_remove: [],
    }

    constructor(name: string, context: Context) {
        super(name, context)
    }

    toString() {
        return `<build-in-function ${this._name}>`
    }

    get copy(): Value {
        const copy = new RSBuildInFunction(this._name, this.context)
        return copy
    }

    execute(args: Value[]) {
        const res = new RTResult()

        const executeConetext = this.genNewContext()

        const fname = `function_${this._name}`
        const f = (this as any)[`_${fname}`]
            ? (this as any)[`_${fname}`]
            : this._noDefinedFunction

        res.register(
            this.checkPopulateArgs(this._argNames[fname], args, executeConetext)
        )
        if (res.error) return res

        const rv = res.register(f(executeConetext))
        if (res.error) return res

        return res.success(rv)
    }

    private _noDefinedFunction(...args: any[]) {
        throw `No function '${this._name}' definded!`
    }

    private _function_step(executeConetext: Context) {
        try {
            executeConetext.character?.step(1)
            return new RTResult().success(RSNumber.null)
        } catch (e) {
            return new RTResult().fail(
                new RSRuntimeError(
                    e,
                    this._posStart,
                    this._posEnd,
                    executeConetext
                )
            )
        }
    }

    private _function_turnleft(executeConetext: Context) {
        try {
            executeConetext.character?.turn_left()
            return new RTResult().success(RSNumber.null)
        } catch (e) {
            return new RTResult().fail(
                new RSRuntimeError(
                    e,
                    this._posStart,
                    this._posEnd,
                    executeConetext
                )
            )
        }
    }

    private _function_turnright(executeConetext: Context) {
        try {
            executeConetext.character?.turn_right()
            return new RTResult().success(RSNumber.null)
        } catch (e) {
            return new RTResult().fail(
                new RSRuntimeError(
                    e,
                    this._posStart,
                    this._posEnd,
                    executeConetext
                )
            )
        }
    }

    private _function_put(executeConetext: Context) {
        try {
            executeConetext.character?.put()
            return new RTResult().success(RSNumber.null)
        } catch (e) {
            return new RTResult().fail(
                new RSRuntimeError(
                    e,
                    this._posStart,
                    this._posEnd,
                    executeConetext
                )
            )
        }
    }

    private _function_pick(executeConetext: Context) {
        try {
            executeConetext.character?.pick()
            return new RTResult().success(RSNumber.null)
        } catch (e) {
            return new RTResult().fail(
                new RSRuntimeError(
                    e,
                    this._posStart,
                    this._posEnd,
                    executeConetext
                )
            )
        }
    }

    private _function_mark(executeConetext: Context) {
        try {
            executeConetext.character?.mark()
            return new RTResult().success(RSNumber.null)
        } catch (e) {
            return new RTResult().fail(
                new RSRuntimeError(
                    e,
                    this._posStart,
                    this._posEnd,
                    executeConetext
                )
            )
        }
    }

    private _function_removeMark(executeConetext: Context) {
        try {
            executeConetext.character?.removeMark()
            return new RTResult().success(RSNumber.null)
        } catch (e) {
            return new RTResult().fail(
                new RSRuntimeError(
                    e,
                    this._posStart,
                    this._posEnd,
                    executeConetext
                )
            )
        }
    }
}

//#endregion
