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
    | 'eof'

export const keywords: string[] = ['var', 'variable']

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
        this._advance()
    }

    private _advance() {
        this._pos.advance()
        this._currentChar =
            this._text.length > this._pos.index
                ? this._text[this._pos.index]
                : null
    }

    public generateTokens(): { tokens: Token[]; error: RSError | null } {
        const tokens = []

        while (this._currentChar !== null) {
            if (/[ \t]/.test(this._currentChar)) this._advance()
            else if (/[0-9]/.test(this._currentChar)) {
                tokens.push(this._makeNumber())
            } else if (/(true|false|wahr|falsch)/.test(this._currentChar)) {
                tokens.push(new Token({ type: 'boolean', posStart: this._pos }))
                this._advance()
            } else if (/[A-Za-z_]/.test(this._currentChar)) {
                tokens.push(this._makeIdentifier())
            } else if (this._currentChar == '+') {
                tokens.push(new Token({ type: 'plus', posStart: this._pos }))
                this._advance()
            } else if (this._currentChar == '-') {
                tokens.push(new Token({ type: 'minus', posStart: this._pos }))
                this._advance()
            } else if (this._currentChar == '*') {
                tokens.push(new Token({ type: 'mul', posStart: this._pos }))
                this._advance()
            } else if (this._currentChar == '/') {
                tokens.push(new Token({ type: 'div', posStart: this._pos }))
                this._advance()
            } else if (this._currentChar == '=') {
                tokens.push(new Token({ type: 'eq', posStart: this._pos }))
                this._advance()
            } else if (this._currentChar == '(') {
                tokens.push(new Token({ type: 'lparen', posStart: this._pos }))
                this._advance()
            } else if (this._currentChar == ')') {
                tokens.push(new Token({ type: 'rparen', posStart: this._pos }))
                this._advance()
            } else {
                const posStart = this._pos.pos
                const char = this._currentChar
                this._advance()
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
            this._advance()
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
            this._advance()
        }

        return new Token({
            type: keywords.includes(str) ? 'keyword' : 'identifier',
            value: str,
            posStart: pos,
            posEnd: this._pos,
        })
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

//#endregion

//#region Parse result

class ParseResult {
    public error: RSError | null = null
    public node: Nodes | null = null
    public lastRegisteredAdvanceCount = 0
    public advanceCount = 0

    register_advancement() {
        this.advanceCount += 1
    }

    register(res: ParseResult | any) {
        this.advanceCount += res.advanceCount
        if (!(res instanceof ParseResult)) return res
        if (res.error) this.error = res.error
        return res.node
    }

    registerAdvancement() {
        this.lastRegisteredAdvanceCount = 1
        this.advanceCount++
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
    private _tokenIndex = -1
    private _ct!: Token

    constructor(private _tokens: Token[]) {
        this._advance()
    }

    private _advance() {
        this._tokenIndex++
        if (this._tokenIndex < this._tokens.length)
            this._ct = this._tokens[this._tokenIndex]
        return this._ct
    }

    private _atom(p: Parser) {
        const res = new ParseResult()
        const token = p._ct

        if (token.type === 'number') {
            res.register(p._advance())
            return res.success(new NumberNode(token))
        } else if (token.type === 'identifier') {
            res.register(this._advance())
            return res.success(new VarAccessNode(token))
        } else if (token.type === 'lparen') {
            res.register(p._advance())
            const expr = res.register(p._expression(p))
            if (res.error) return res
            if (p._ct.type === 'rparen') {
                res.register(p._advance())
                return res.success(expr)
            }
            return res.fail(
                new RSSyntaxError(`')' erwartet`, p._ct.posStart, p._ct.posEnd)
            )
        }

        return res.fail(
            new RSSyntaxError(
                `'+', '-', '*', '/' oder '(' erwartet`,
                p._ct.posStart,
                p._ct.posEnd
            )
        )
    }

    private _factor(p: Parser) {
        const res = new ParseResult()
        const token = p._ct

        if (token.type === 'plus' || token.type === 'minus') {
            res.register(p._advance())
            const factor = res.register(p._factor(p))
            if (res.error) return res
            return res.success(new UnaryOperationNode(token, factor))
        }

        return p._atom(p)
    }

    private _term(p: Parser) {
        return p._binaryOperation(p, p._factor, ['mul', 'div'])
    }

    private _expression(p: Parser) {
        const res = new ParseResult()

        if (
            p._ct.matches('keyword', 'var') ||
            p._ct.matches('keyword', 'variable')
        ) {
            res.registerAdvancement()
            p._advance()
            if (p._ct.type !== 'identifier')
                return res.fail(
                    new RSSyntaxError(
                        'Variablenname erwartet',
                        p._ct.posStart,
                        p._ct.posEnd
                    )
                )

            const varName = p._ct
            res.registerAdvancement()
            p._advance()

            // eslint-disable-next-line
            // @ts-ignore
            if (p._ct.type !== 'eq')
                return res.fail(
                    new RSSyntaxError(
                        "'=' erwartet",
                        p._ct.posStart,
                        p._ct.posEnd
                    )
                )

            res.registerAdvancement()
            p._advance()
            const expr = res.register(p._expression(p))

            if (res.error) return res

            return res.success(new VarAssignNode(varName, expr))
        }

        const node = res.register(
            p._binaryOperation(p, p._term, ['plus', 'minus'])
        )

        if (res.error)
            return res.fail(
                new RSSyntaxError(
                    "int, identifier, '+', '-' oder '(' erwartet",
                    p._ct.posStart,
                    p._ct.posEnd
                )
            )

        return res.success(node)
    }

    private _binaryOperation(
        p: Parser,
        fl: Function, // eslint-disable-line
        operation: Array<tokenType>,
        fr?: Function // eslint-disable-line
    ): ParseResult {
        if (!fr) fr = fl

        const res = new ParseResult()

        let left = res.register(fr(p))

        if (res.error) return res

        while (operation.includes(p._ct.type)) {
            const opt = p._ct
            res.register(p._advance())
            const right = res.register(fl(p))
            left = new BinaryOperationNode(left, opt, right)
        }

        return res.success(left)
    }

    public parse() {
        const res = this._expression(this)
        if (!res.error && this._ct.type !== 'eof')
            return res.fail(
                new RSSyntaxError(
                    `'+', '-', '*' oder '/' erwartet`,
                    this._ct.posStart,
                    this._ct.posEnd
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
