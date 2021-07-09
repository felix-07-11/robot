/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */

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
	| 'identifier'
	| 'keyword'
	| 'plus' // +
	| 'minus' // -
	| 'mul' // *
	| 'div' // /
	| 'eq' // =
	| 'lparen' // (
	| 'rparen' // )
	| 'ee' // ==
	| 'ne' // !=
	| 'lt' // <
	| 'gt' // >
	| 'lte' // <=
	| 'gte' // >=
	| 'co' // :
	| 'as' // *
	| 'comma' // ,
	| 'newline' // \n ;
	| 'eof' // end

export const keywords = [
	'var',
	'variable',
	'und',
	'oder',
	'nicht',
	'wenn',
	'sonst',
	'wiederhole',
	'wiederhole_solange',
	'funktion',
]

export class Token {
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

	public advance(cc?: string | null) {
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
		this._pos.advance(this._currentChar)
		this._currentChar =
			this._text.length > this._pos.index
				? this._text[this._pos.index]
				: null
	}

	public generateTokens(): { tokens: Token[]; error: RSError | null } {
		const tokens = []

		while (this._currentChar !== null) {
			if (/[ \t]/.test(this._currentChar)) this.advance()
			else if (/[;\n]/.test(this._currentChar)) {
				tokens.push(new Token({ type: 'newline', posStart: this._pos }))
				this.advance()
			} else if (/[0-9]/.test(this._currentChar)) {
				tokens.push(this._makeNumber())
			} else if (/[A-Za-z_ÄäÖöÜüß]/.test(this._currentChar)) {
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
				const t = this._makeComments()
				if (t != undefined) {
					tokens.push(t)
				}
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
			} else if (this._currentChar == ',') {
				tokens.push(new Token({ type: 'comma', posStart: this._pos }))
				this.advance()
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
			/[A-Za-z0-9_ÄäÖöÜüß]/.test(this._currentChar)
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

	private _makeComments() {
		const pos = this._pos.pos
		this.advance()

		if (this._currentChar && /[*]/.test(this._currentChar)) {
			let inComment = true
			while (this._currentChar !== null && inComment) {
				this.advance()

				if (this._currentChar != '*') continue
				this.advance()
				// @ts-ignore
				if (this._currentChar == '/') inComment = false
				this.advance()
			}
			return
		}

		if (this._currentChar && /[/]/.test(this._currentChar)) {
			while (this._currentChar !== null && this._currentChar != '\n')
				this.advance()
			this.advance()
			return
		}

		return new Token({ type: 'div', posStart: pos })
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
	| FunctionDefineNode
	| FunctionCallNode
	| IfNode
	| ForNode
	| WhileNode
	| ListNode

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
		return this._node.posStart
	}

	get posEnd(): Position {
		return this._node.posEnd
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

export class FunctionDefineNode {
	constructor(
		private _varName: Token,
		private _args: Token[],
		private _body: Nodes
	) {}

	toString() {
		return `<function def ${this.varName}>`
	}

	get varName() {
		return this._varName
	}

	get args() {
		return this._args
	}

	get body() {
		return this._body
	}

	get posStart(): Position {
		return this._varName.posStart
	}

	get posEnd(): Position {
		return this._body.posEnd
	}
}

export class FunctionCallNode {
	constructor(private _callName: Nodes, private _args: Nodes[]) {}

	toString() {
		return `<function ${this._callName}>`
	}

	get callName() {
		return this._callName
	}

	get args() {
		return this._args
	}

	get posStart(): Position {
		return this._callName.posStart
	}

	get posEnd(): Position {
		return this._args.length === 0
			? this._callName.posEnd
			: this._args[this._args.length - 1].posEnd
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
		private _caseIf: { condition: Nodes; statements: Nodes },
		private _caseElse?: Nodes | null
	) {}

	get caseIf() {
		return this._caseIf
	}

	get caseElse() {
		return this._caseElse
	}

	get posStart(): Position {
		return this._caseIf.condition.posStart
	}

	get posEnd(): Position {
		return this._caseElse
			? this._caseElse.posEnd
			: this._caseIf.statements.posEnd
	}
}

export class ForNode {
	private _varName?: Nodes
	private _start: Nodes
	private _end: Nodes
	private _step: Nodes
	private _body: Nodes

	constructor({
		varName,
		start,
		end,
		step,
		body,
	}: {
		varName?: Nodes
		start?: Nodes
		end: Nodes
		step?: Nodes
		body: Nodes
	}) {
		this._varName = varName
		this._start =
			start ||
			new NumberNode(
				new Token({
					type: 'number',
					value: new Number('0'),
					posStart: end.posStart,
					posEnd: end.posEnd,
				})
			)
		this._end = end
		this._step =
			step ||
			new NumberNode(
				new Token({
					type: 'number',
					value: new Number('1'),
					posStart: end.posStart,
					posEnd: end.posEnd,
				})
			)
		this._body = body
	}

	get start() {
		return this._start
	}

	get end() {
		return this._end
	}

	get step() {
		return this._step
	}

	get body() {
		return this._body
	}

	get posStart(): Position {
		return this._varName ? this._varName.posStart : this._start.posStart
	}

	get posEnd(): Position {
		return this._body.posEnd
	}
}

export class WhileNode {
	constructor(private _condition: Nodes, private _body: Nodes) {}

	get condition() {
		return this._condition
	}

	get body() {
		return this._body
	}

	get posStart(): Position {
		return this._condition.posStart
	}

	get posEnd(): Position {
		return this._body.posEnd
	}
}

export class ListNode {
	constructor(
		public readonly list: Nodes[],
		public readonly posStart: Position,
		public readonly posEnd: Position
	) {}
}

//#endregion

//#region Parse result

class ParseResult {
	public error: RSError | null = null
	public node: Nodes | null = null
	public lastRegisteredAdvanceCount = 0
	public advanceCount = 0
	public toReverseCount = 0

	tryRegister(res: ParseResult) {
		if (res.error) {
			this.toReverseCount = res.advanceCount
			return null
		}
		return this.register(res)
	}

	register(res: ParseResult | any) {
		this.lastRegisteredAdvanceCount = this.advanceCount
		this.advanceCount += res.advanceCount
		if (!(res instanceof ParseResult)) return res
		if (res.error) this.error = res.error
		return res.node
	}

	registerAdvancement() {
		this.lastRegisteredAdvanceCount = 1
		this.advanceCount += 1
	}

	success(node: Nodes) {
		this.node = node
		return this
	}

	fail(error: RSError) {
		if (!this.error || this.lastRegisteredAdvanceCount === 0)
			this.error = error
		return this
	}
}

//#endregion

//#region Parser

class Parser {
	public tokenIndex = -1
	public ct!: Token

	constructor(public readonly _tokens: Token[]) {
		this.advance()
	}

	advance() {
		this.tokenIndex++
		this.update_ct()
		return this.ct
	}

	reverse(v = 1) {
		this.tokenIndex -= v
		this.update_ct()
		return this.ct
	}

	update_ct() {
		if (this.tokenIndex >= 0 && this.tokenIndex < this._tokens.length)
			this.ct = this._tokens[this.tokenIndex]
	}

	atom(p: Parser) {
		const res = new ParseResult()
		const token = p.ct

		if (token.type === 'number') {
			res.register(p.advance())
			return res.success(new NumberNode(token))

			// -----------------------------------------------------------------------
			// var
		} else if (token.type === 'identifier') {
			res.register(this.advance())
			return res.success(new VarAccessNode(token))

			// -----------------------------------------------------------------------
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

			// -----------------------------------------------------------------------
			// if
		} else if (token.matches('keyword', 'wenn')) {
			const ifExpr = res.register(p.ifExpr(p))
			if (res.error) return res
			return res.success(ifExpr)

			// -----------------------------------------------------------------------
			// for
		} else if (token.matches('keyword', 'wiederhole')) {
			const forExpr = res.register(p.forExpr(p))
			if (res.error) return res
			return res.success(forExpr)

			// -----------------------------------------------------------------------
			// for
		} else if (token.matches('keyword', 'wiederhole_solange')) {
			const whileExpr = res.register(p.whileExpr(p))
			if (res.error) return res
			return res.success(whileExpr)

			// -----------------------------------------------------------------------
			// function def
		} else if (token.matches('keyword', 'funktion')) {
			const functionDefExpr = res.register(p.functionDefineExpr(p))
			if (res.error) return res
			return res.success(functionDefExpr)
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

		return p.call(p)
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

	statements(p: Parser) {
		const res = new ParseResult()

		const statements: any[] = []

		const posStart = p.ct.posStart.pos

		while (p.ct.type === 'newline') {
			res.registerAdvancement()
			p.advance()
		}

		const s = res.register(p.expression(p))
		if (res.error) return res

		statements.push(s)

		let moreStatements = true
		// eslint-disable-next-line
		while (moreStatements) {
			let nc = 0
			// @ts-ignore
			while (p.ct.type === 'newline') {
				res.registerAdvancement()
				p.advance()
				moreStatements = true

				nc++
			}

			if (nc == 0) moreStatements = false

			if (!moreStatements) break
			const s = res.tryRegister(p.expression(p))
			if (!s) {
				p.reverse(res.toReverseCount)
				moreStatements = false
				continue
			}
			// if (s.error) return s
			// if (res.error) return res

			statements.push(s)
		}

		return res.success(
			new ListNode(statements as Nodes[], posStart, p.ct.posEnd.pos)
		)
	}

	ifExpr(p: Parser) {
		const res = new ParseResult()
		let caseIf: { condition: Nodes; statements: Nodes }
		let caseElse: Nodes | null = null

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

		const statements = res.register(p.statements(p))
		if (res.error) return res

		caseIf = { condition, statements } // eslint-disable-line

		if (p.ct.matches('keyword', 'sonst')) {
			res.registerAdvancement()
			p.advance()

			const statements = res.register(p.statements(p))
			if (res.error) return res

			caseElse = statements
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

	forExpr(p: Parser) {
		const res = new ParseResult()

		if (!p.ct.matches('keyword', 'wiederhole'))
			return res.fail(
				new RSSyntaxError(
					`'wiederhole' erwartet`,
					p.ct.posStart,
					p.ct.posEnd
				)
			)

		res.registerAdvancement()
		p.advance()

		const end = res.register(p.expression(p))
		if (res.error) return res

		if (p.ct.type !== 'co')
			return res.fail(
				new RSSyntaxError(`':' erwartet`, p.ct.posStart, p.ct.posStart)
			)

		res.registerAdvancement()
		p.advance()

		const body = res.register(p.statements(p))
		if (res.error) return res

		// eslint-disable-next-line
		// @ts-ignore
		if (p.ct.type !== 'as')
			return res.fail(
				new RSSyntaxError(
					`'*wiederhole' erwartet`,
					p.ct.posStart,
					p.ct.posEnd
				)
			)

		p.advance()

		if (!p.ct.matches('keyword', 'wiederhole'))
			return res.fail(
				new RSSyntaxError(`'wenn' erwartet`, p.ct.posStart, p.ct.posEnd)
			)

		res.registerAdvancement()
		p.advance()

		return res.success(new ForNode({ end, body }))
	}

	whileExpr(p: Parser) {
		const res = new ParseResult()

		if (!p.ct.matches('keyword', 'wiederhole_solange'))
			return res.fail(
				new RSSyntaxError(
					`'wiederhole_solange' erwartet`,
					p.ct.posStart,
					p.ct.posEnd
				)
			)

		res.registerAdvancement()
		p.advance()

		const con = res.register(p.expression(p))
		if (res.error) return res

		if (p.ct.type !== 'co')
			return res.fail(
				new RSSyntaxError(`':' erwartet`, p.ct.posStart, p.ct.posStart)
			)

		res.registerAdvancement()
		p.advance()

		const body = res.register(p.statements(p))
		if (res.error) return res

		// @ts-ignore
		if (p.ct.type !== 'as')
			return res.fail(
				new RSSyntaxError(
					`'*wiederhole' erwartet`,
					p.ct.posStart,
					p.ct.posEnd
				)
			)

		res.registerAdvancement()
		p.advance()

		if (!p.ct.matches('keyword', 'wiederhole'))
			return res.fail(
				new RSSyntaxError(
					`'wiederhole' erwartet`,
					p.ct.posStart,
					p.ct.posEnd
				)
			)

		res.registerAdvancement()
		p.advance()

		return res.success(new WhileNode(con, body))
	}

	functionDefineExpr(p: Parser) {
		const res = new ParseResult()

		if (!p.ct.matches('keyword', 'funktion'))
			return res.fail(
				new RSSyntaxError(
					`'funktion' erwartet`,
					p.ct.posStart,
					p.ct.posEnd
				)
			)

		res.registerAdvancement()
		p.advance()

		if (p.ct.type !== 'identifier')
			return res.fail(
				new RSSyntaxError(
					`Funktionsname erwartet`,
					p.ct.posStart,
					p.ct.posStart
				)
			)

		const varName = p.ct

		res.registerAdvancement()
		p.advance()

		const args: Token[] = []

		// @ts-ignore
		if (p.ct.type === 'lparen') {
			res.registerAdvancement()
			p.advance()

			// @ts-ignore
			if (p.ct.type === 'identifier') {
				args.push(p.ct)
				res.registerAdvancement()
				p.advance()

				while (p.ct.type === 'comma') {
					res.registerAdvancement()
					p.advance()

					if (p.ct.type !== 'identifier')
						return res.fail(
							new RSSyntaxError(
								`Variablenname erwartet`,
								p.ct.posStart,
								p.ct.posStart
							)
						)

					args.push(p.ct)
					res.registerAdvancement()
					p.advance()
				}

				// @ts-ignore
				if (p.ct.type !== 'rparen')
					return res.fail(
						new RSSyntaxError(
							`',' oder ')' erwartet`,
							p.ct.posStart,
							p.ct.posStart
						)
					)
			}

			// @ts-ignore
			if (p.ct.type !== 'rparen')
				return res.fail(
					new RSSyntaxError(
						`Variablenname oder ')' erwartet`,
						p.ct.posStart,
						p.ct.posStart
					)
				)

			p.advance()

			// @ts-ignore
			if (p.ct.type !== 'co')
				return res.fail(
					new RSSyntaxError(
						`':' erwartet`,
						p.ct.posStart,
						p.ct.posStart
					)
				)
		} else {
			// @ts-ignore
			if (p.ct.type !== 'co')
				return res.fail(
					new RSSyntaxError(
						`'(' oder ':' erwartet`,
						p.ct.posStart,
						p.ct.posStart
					)
				)
		}

		res.registerAdvancement()
		p.advance()

		const body = res.register(p.statements(p))
		if (res.error) return res

		// @ts-ignore
		if (p.ct.type !== 'as')
			return res.fail(
				new RSSyntaxError(
					`'*funktion' erwartet`,
					p.ct.posStart,
					p.ct.posEnd
				)
			)

		p.advance()

		if (!p.ct.matches('keyword', 'funktion'))
			return res.fail(
				new RSSyntaxError(
					`'funktion' erwartet`,
					p.ct.posStart,
					p.ct.posEnd
				)
			)

		res.registerAdvancement()
		p.advance()

		return res.success(new FunctionDefineNode(varName, args, body))
	}

	call(p: Parser) {
		const res = new ParseResult()

		const atom = res.register(p.atom(p))
		if (res.error) return res

		if (p.ct.type === 'lparen') {
			res.registerAdvancement()
			p.advance()
			const args: Nodes[] = []
			// @ts-ignore
			if (p.ct.type === 'rparen') {
				res.registerAdvancement()
				p.advance()
			} else {
				args.push(res.register(p.expression(p)))
				if (res.error)
					return res.fail(
						new RSSyntaxError(
							`')', 'wenn', int oder Identifier erwartet`,
							p.ct.posStart,
							p.ct.posEnd
						)
					)

				// @ts-ignore
				while (p.ct.type === 'comma') {
					res.registerAdvancement()
					p.advance()

					args.push(res.register(p.expression(p)))
					if (res.error) return res
				}

				// @ts-ignore
				if (p.ct.type !== 'rparen')
					return res.fail(
						new RSSyntaxError(
							`',' oder ')' erwartet`,
							p.ct.posStart,
							p.ct.posEnd
						)
					)

				res.registerAdvancement()
				p.advance()
			}

			return res.success(new FunctionCallNode(atom, args))
		}

		return res.success(atom)
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
					(
						item as {
							tokenType: tokenType
							value: string
						}
					).tokenType == p.ct.type &&
					(
						item as {
							tokenType: tokenType
							value: string
						}
					).value == p.ct.value
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
		const res = this.statements(this)

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
