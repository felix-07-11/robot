//#region RS error

export class RSError {
    constructor(
        public error: string,
        public details: string,
        public posStart: Position,
        public posEnd: Position
    ) {}

    toString() {
        return `${this.error}: ${this.details} in Zeile ${
            this.posStart.line + 1
        }`
    }
}

export class RSIllegalCharError extends RSError {
    constructor(details: string, posStart: Position, posEnd: Position) {
        super('Falsches Zeichen/Buchstabe', details, posStart, posEnd)
    }
}

export class RSExspectedCharError extends RSError {
    constructor(details: string, posStart: Position, posEnd: Position) {
        super('Erwartet', details, posStart, posEnd)
    }
}

export class RSSyntaxError extends RSError {
    constructor(details: string, posStart: Position, posEnd: Position) {
        super('Syntax Fehler', details, posStart, posEnd)
    }
}

//#endregion

//#region Token & keywords

export type tokenType =
    | 'number'
    | 'boolean'
    | 'identifier'
    | 'keyword'
    | 'plus'
    | 'minus'
    | 'mul'
    | 'div'
    | 'eq'
    | 'lparen'
    | 'rparen'
    | 'ee' // ==
    | 'ne' // !=
    | 'lt' // <
    | 'gt' // >
    | 'lte' // <=
    | 'gte' // >=
    | 'co' // :
    | 'as' // *
    | 'eof' // end

export const keywords: string[] = [
    'var',
    'variable',
    'und',
    'oder',
    'nicht',
    'wenn',
    'sonst',
]

class Token {
    private _type: tokenType
    private _value: any = null
    private _posStart: Position
    private _posEnd: Position

    constructor({
        type,
        value = null,
        posStart,
        posEnd,
    }: {
        type: tokenType
        value?: any
        posStart: Position
        posEnd?: Position
    }) {
        this._type = type
        if (value) this._value = value

        this._posStart = posStart.pos
        this._posEnd = posStart.pos
        this._posEnd.advance()

        if (posEnd) this._posEnd = posEnd.pos
    }

    get type() {
        return this._type
    }

    get value() {
        return this._value
    }

    get posStart() {
        return this._posStart
    }

    get posEnd() {
        return this._posEnd
    }

    toString() {
        if (this._value) return `${this._type}:${this._value}`
        return `${this._type}`
    }

    matches(type: tokenType, value: string) {
        return this._type === type && this._value === value
    }
}

//#endregion

//#region Position

export class Position {
    constructor(
        private _index: number,
        private _line: number,
        private _col: number
    ) {}

    get pos() {
        return new Position(this._index, this._line, this._col)
    }

    get index() {
        return this._index
    }

    get line() {
        return this._line
    }

    get col() {
        return this._col
    }

    public advance(cc?: string) {
        this._index++
        this._col++

        if (cc == '\n') {
            this._col = 0
            this._line += 1
        }
    }
}

//#endregion

//#region Lexer

class Lexer {
    private _pos = new Position(-1, 0, -1)
    private _currentChar: string | null = null

    constructor(private _text: string) {
        this.advance()
    }

    private advance() {
        this._pos.advance()
        this._currentChar =
            this._text.length > this._pos.index
                ? this._text[this._pos.index]
                : null
    }

    public generateTokens(): { tokens: Token[]; error: RSError | null } {
        const tokens = []

        while (this._currentChar !== null) {
            if (/[ \t]/.test(this._currentChar)) this.advance()
            else if (/[0-9]/.test(this._currentChar)) {
                tokens.push(this._makeNumber())
            } else if (/[A-Za-z_]/.test(this._currentChar)) {
                tokens.push(this._makeIdentifier())
            } else if (this._currentChar == '+') {
                tokens.push(new Token({ type: 'plus', posStart: this._pos }))
                this.advance()
            } else if (this._currentChar == '-') {
                tokens.push(new Token({ type: 'minus', posStart: this._pos }))
                this.advance()
            } else if (this._currentChar == '*') {
                tokens.push(this._makeAsterik())
            } else if (this._currentChar == '/') {
                tokens.push(new Token({ type: 'div', posStart: this._pos }))
                this.advance()
            } else if (this._currentChar == '(') {
                tokens.push(new Token({ type: 'lparen', posStart: this._pos }))
                this.advance()
            } else if (this._currentChar == ')') {
                tokens.push(new Token({ type: 'rparen', posStart: this._pos }))
                this.advance()
            } else if (this._currentChar == ':') {
                tokens.push(new Token({ type: 'co', posStart: this._pos }))
                this.advance()
            } else if (this._currentChar == '!') {
                const r = this._makeNotEquals()
                if (r instanceof RSError) return { tokens: [], error: r }
                tokens.push(r)
            } else if (this._currentChar == '=') {
                tokens.push(this._makeEquals())
            } else if (this._currentChar == '<') {
                tokens.push(this._makeLessThan())
            } else if (this._currentChar == '>') {
                tokens.push(this._makeGreaterThan())
            } else {
                const posStart = this._pos.pos
                const char = this._currentChar
                this.advance()
                return {
                    tokens: [],
                    error: new RSIllegalCharError(
                        `'${char}'`,
                        posStart,
                        this._pos
                    ),
                }
            }
        }
        tokens.push(new Token({ type: 'eof', posStart: this._pos }))
        return { tokens, error: null }
    }

    private _makeNumber() {
        let str = ''
        const pos = this._pos.pos

        while (this._currentChar !== null && /[0-9]/.test(this._currentChar)) {
            str += this._currentChar
            this.advance()
        }

        return new Token({
            type: 'number',
            value: new Number(str),
            posStart: pos,
            posEnd: this._pos,
        })
    }

    private _makeIdentifier() {
        let str = ''
        const pos = this._pos.pos

        while (
            this._currentChar !== null &&
            /[A-Za-z0-9_]/.test(this._currentChar)
        ) {
            str += this._currentChar
            this.advance()
        }

        return new Token({
            type: keywords.includes(str) ? 'keyword' : 'identifier',
            value: str,
            posStart: pos,
            posEnd: this._pos,
        })
    }

    private _makeNotEquals() {
        const pos = this._pos.pos
        this.advance()

        if (this._currentChar == '=') {
            this.advance()
            return new Token({
                type: 'ne',
                posStart: pos,
                posEnd: this._pos,
            })
        }
        this.advance()
        return new RSExspectedCharError(`'=' nach '!'`, pos, this._pos)
    }

    private _makeEquals() {
        const pos = this._pos.pos
        this.advance()

        if (this._currentChar == '=') {
            this.advance()
            return new Token({ type: 'ee', posStart: pos, posEnd: this._pos })
        }

        return new Token({ type: 'eq', posStart: pos, posEnd: this._pos })
    }

    private _makeLessThan() {
        const pos = this._pos.pos
        this.advance()

        if (this._currentChar == '=') {
            this.advance()
            return new Token({ type: 'lte', posStart: pos, posEnd: this._pos })
        }

        return new Token({ type: 'lt', posStart: pos, posEnd: this._pos })
    }

    private _makeGreaterThan() {
        const pos = this._pos.pos
        this.advance()

        if (this._currentChar == '=') {
            this.advance()
            return new Token({ type: 'gte', posStart: pos, posEnd: this._pos })
        }

        return new Token({ type: 'gt', posStart: pos, posEnd: this._pos })
    }

    private _makeAsterik() {
        const pos = this._pos.pos
        this.advance()

        if (this._currentChar && /[A-Za-z_]/.test(this._currentChar)) {
            return new Token({ type: 'as', posStart: pos, posEnd: this._pos })
        }

        return new Token({ type: 'mul', posStart: pos, posEnd: this._pos })
    }
}

//#endregion

//#region Nodes

export type Nodes =
    | NumberNode
    | BinaryOperationNode
    | UnaryOperationNode
    | VarAssignNode
    | VarAccessNode
    | IfNode

export class NumberNode {
    constructor(private _token: Token) {}

    toString() {
        return this._token.toString()
    }

    get token() {
        return this._token
    }

    get posStart() {
        return this._token.posStart
    }

    get posEnd() {
        return this._token.posEnd
    }
}

export class VarAssignNode {
    constructor(private _varName: Token, private _node: Nodes) {}

    toString() {
        return `( ${this._varName}, ${this._node} )`
    }

    get varName() {
        return this._varName
    }

    get node() {
        return this._node
    }

    get posStart(): Position {
        return this._node.posStart as Position
    }

    get posEnd(): Position {
        return this._node.posEnd as Position
    }
}

export class VarAccessNode {
    constructor(private _varName: Token) {}

    toString() {
        return `( ${this._varName} )`
    }

    get varName() {
        return this._varName
    }

    get posStart() {
        return this._varName.posStart
    }

    get posEnd() {
        return this._varName.posEnd
    }
}

export class BinaryOperationNode {
    constructor(
        private _leftNode: NumberNode,
        private _operationToken: Token,
        private _rightNode: NumberNode
    ) {}

    toString() {
        return `( ${this._leftNode}, ${this._operationToken}, ${this._rightNode} )`
    }

    get leftNode() {
        return this._leftNode
    }

    get operationToken() {
        return this._operationToken
    }

    get rightNode() {
        return this._rightNode
    }

    get posStart() {
        return this._leftNode.posStart
    }

    get posEnd() {
        return this._rightNode.posEnd
    }
}

export class UnaryOperationNode {
    constructor(private _operationToken: Token, private _node: NumberNode) {}

    toString() {
        return `( ${this._operationToken} ${this._node} )`
    }

    get node() {
        return this._node
    }

    get operationToken() {
        return this._operationToken
    }

    get posStart() {
        return this._operationToken.posStart
    }

    get posEnd() {
        return this._node.posEnd
    }
}

export class IfNode {
    constructor(
        private _caseIf: { condition: ParseResult; expression: ParseResult },
        private _caseElse?: ParseResult | null
    ) {}

    get posStart(): Position {
        return this._caseIf.condition.node?.posStart as Position
    }

    get posEnd(): Position {
        return this._caseElse
            ? (this._caseElse.node?.posEnd as Position)
            : (this._caseIf.condition.node?.posEnd as Position)
    }
}

//#endregion

//#region Parse result

class ParseResult {
    public error: RSError | null = null
    public node: Nodes | null = null
    public lastRegisteredAdvanceCount = 0
    public advanceCount = 0

    register(res: ParseResult | any) {
        this.advanceCount += res.advanceCount
        if (!(res instanceof ParseResult)) return res
        if (res.error) this.error = res.error
        return res.node
    }

    registerAdvancement() {
        this.advanceCount += 1
    }

    success(node: Nodes) {
        this.node = node
        return this
    }

    fail(error: RSError) {
        if (!this.error || this.advanceCount === 0) this.error = error
        return this
    }
}

//#endregion

//#region Parser

class Parser {
    public tokenIndex = -1
    public ct!: Token

    constructor(private _tokens: Token[]) {
        this.advance()
    }

    advance() {
        this.tokenIndex++
        if (this.tokenIndex < this._tokens.length)
            this.ct = this._tokens[this.tokenIndex]
        return this.ct
    }

    atom(p: Parser) {
        const res = new ParseResult()
        const token = p.ct

        if (token.type === 'number') {
            res.register(p.advance())
            return res.success(new NumberNode(token))
        } else if (token.type === 'identifier') {
            res.register(this.advance())
            return res.success(new VarAccessNode(token))
        } else if (token.type === 'lparen') {
            res.register(p.advance())
            const expr = res.register(p.expression(p))
            if (res.error) return res
            if (p.ct.type === 'rparen') {
                res.register(p.advance())
                return res.success(expr)
            }
            return res.fail(
                new RSSyntaxError(`')' erwartet`, p.ct.posStart, p.ct.posEnd)
            )
        } else if (token.matches('keyword', 'wenn')) {
            const ifExpr = res.register(p.ifExpr(p))
            if (res.error) return res
            return res.success(ifExpr)
        }

        return res.fail(
            new RSSyntaxError(
                `'+', '-', '*', '/' oder '(' erwartet`,
                p.ct.posStart,
                p.ct.posEnd
            )
        )
    }

    factor(p: Parser) {
        const res = new ParseResult()
        const token = p.ct

        if (token.type === 'plus' || token.type === 'minus') {
            res.register(p.advance())
            const factor = res.register(p.factor(p))
            if (res.error) return res
            return res.success(new UnaryOperationNode(token, factor))
        }

        return p.atom(p)
    }

    term(p: Parser) {
        return p.binaryOperation(p, p.factor, ['mul', 'div'])
    }

    compExpr(p: Parser) {
        const res = new ParseResult()

        if (p.ct.matches('keyword', 'nicht' /* not */)) {
            const ot = p.ct
            res.registerAdvancement()
            p.advance()

            const node = res.register(p.compExpr(p))
            if (res.error) return res

            return res.success(new UnaryOperationNode(ot, node))
        }

        const node = res.register(
            p.binaryOperation(p, p.arithExpr, [
                'ee',
                'ne',
                'gt',
                'gte',
                'lt',
                'lte',
            ])
        )

        if (res.error)
            return res.fail(
                new RSSyntaxError(
                    `'+', '-', '*', '/', '(' oder 'nicht' erwartet`,
                    p.ct.posStart,
                    p.ct.posEnd
                )
            )

        return res.success(node)
    }

    arithExpr(p: Parser) {
        return p.binaryOperation(p, p.term, ['plus', 'minus'])
    }

    expression(p: Parser) {
        const res = new ParseResult()

        if (
            p.ct.matches('keyword', 'var') ||
            p.ct.matches('keyword', 'variable')
        ) {
            res.registerAdvancement()
            p.advance()
            if (p.ct.type !== 'identifier')
                return res.fail(
                    new RSSyntaxError(
                        'Variablenname erwartet',
                        p.ct.posStart,
                        p.ct.posEnd
                    )
                )

            const varName = p.ct
            res.registerAdvancement()
            p.advance()

            // eslint-disable-next-line
            // @ts-ignore
            if (p.ct.type !== 'eq')
                return res.fail(
                    new RSSyntaxError(
                        "'=' erwartet",
                        p.ct.posStart,
                        p.ct.posEnd
                    )
                )

            res.registerAdvancement()
            p.advance()
            const expr = res.register(p.expression(p))

            if (res.error) return res

            return res.success(new VarAssignNode(varName, expr))
        }

        const node = res.register(
            p.binaryOperation(p, p.compExpr, [
                { tokenType: 'keyword', value: 'und' }, // and
                { tokenType: 'keyword', value: 'oder' }, // or
            ])
        )

        if (res.error)
            return res.fail(
                new RSSyntaxError(
                    "int, identifier, '+', '-' oder '(' erwartet",
                    p.ct.posStart,
                    p.ct.posEnd
                )
            )

        return res.success(node)
    }

    ifExpr(p: Parser) {
        const res = new ParseResult()
        let caseIf: { condition: ParseResult; expression: ParseResult }
        let caseElse: ParseResult | null = null

        if (!p.ct.matches('keyword', 'wenn'))
            return res.fail(
                new RSSyntaxError(`'wenn' erwartet`, p.ct.posStart, p.ct.posEnd)
            )

        res.registerAdvancement()
        p.advance()

        const condition = res.register(p.expression(p))
        if (res.error) return res

        if (p.ct.type !== 'co')
            return res.fail(
                new RSSyntaxError(`':' erwartet`, p.ct.posStart, p.ct.posStart)
            )

        res.registerAdvancement()
        p.advance()

        const expression = res.register(p.expression(p))
        if (res.error) return res

        caseIf = { condition, expression } // eslint-disable-line

        if (p.ct.matches('keyword', 'sonst')) {
            res.registerAdvancement()
            p.advance()

            const expression = res.register(p.expression(p))
            if (res.error) return res

            caseElse = expression
        }

        // eslint-disable-next-line
        // @ts-ignore
        if (p.ct.type !== 'as')
            return res.fail(
                new RSSyntaxError(
                    `'*wenn' erwartet`,
                    p.ct.posStart,
                    p.ct.posEnd
                )
            )

        p.advance()

        if (!p.ct.matches('keyword', 'wenn'))
            return res.fail(
                new RSSyntaxError(`'wenn' erwartet`, p.ct.posStart, p.ct.posEnd)
            )

        res.registerAdvancement()
        p.advance()

        return res.success(new IfNode(caseIf, caseElse))
    }

    binaryOperation(
        p: Parser,
        fl: Function, // eslint-disable-line
        operation: Array<tokenType | { tokenType: tokenType; value: string }>,
        fr?: Function // eslint-disable-line
    ): ParseResult {
        if (!fr) fr = fl

        const res = new ParseResult()

        let left = res.register(fl(p))

        if (res.error) return res

        while (
            operation.includes(p.ct.type) ||
            operation.some(
                (item) =>
                    (item as {
                        tokenType: tokenType
                        value: string
                    }).tokenType == p.ct.type &&
                    (item as {
                        tokenType: tokenType
                        value: string
                    }).value == p.ct.value
            )
        ) {
            const opt = p.ct
            res.register(p.advance())
            const right = res.register(fr(p))
            left = new BinaryOperationNode(left, opt, right)
        }

        return res.success(left)
    }

    public parse() {
        const res = this.expression(this)

        if (!res.error && this.ct.type !== 'eof')
            return res.fail(
                new RSSyntaxError(
                    `'+', '-', '*' oder '/' erwartet`,
                    this.ct.posStart,
                    this.ct.posEnd
                )
            )
        return res
    }
}

//#endregion

// --------------------------------------------------------------------------------------------
// parse
// --------------------------------------------------------------------------------------------

export function parse(text: string) {
    const lexer = new Lexer(text)
    const { tokens, error } = lexer.generateTokens()

    if (error !== null) return error

    const parser = new Parser(tokens)
    const ast = parser.parse()

    if (ast.error) return ast.error

    return ast.node
}
