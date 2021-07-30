<template>
	<v-container fluid fill-height>
		<v-row>
			<v-col>
				<v-alert type="warning">
					An der Abbildung des Programmcodes mit einem Struktogramm
					wird noch gearbeitet.
				</v-alert>
			</v-col>
		</v-row>
		<v-row justify="center">
			<v-col cols="10"><Main /></v-col>
		</v-row>
	</v-container>
	<!-- <div
        class="d-flex flex-column align-center justify-center pa-5"
        style="height: 100%; width: 100%"
    >
        <v-alert type="warning">
            An der Abbildung des Programmcodes mit einem Struktogramm wird noch
            gearbeitet.
        </v-alert>
    </div> -->
</template>

<script lang="ts">
import Vue from 'vue'
import Main from '@/components/structograms/Main.vue'
import store from '@/store'
import {
	BinaryOperationNode,
	ListNode,
	Nodes,
	NumberNode,
} from '@/assets/robotscript'

export default Vue.extend({
	components: {
		Main,
	},
	computed: {
		parsed: () => store.state.parsed,
	},
	data: () => ({ parsedS: [] as ParsedStructogramPart[] }),
	methods: {
		parse() {
			if (!this.parsed) return
			console.log(this.parseRec(this.parsed))
		},
		parseRec(n: Nodes): ParsedStructogramPart | ParsedStructogramPart[] {
			console.log(n)

			if (n instanceof BinaryOperationNode)
				return { type: 'call', value: this.parseString(n) }
			if (!(n instanceof ListNode)) return {}
			const rl: ParsedStructogramPart[] = []
			for (const item of n.list) {
				rl.push(this.parseRec(item) as ParsedStructogramPart)
			}
			return rl
		},
		parseString(n: Nodes): string {
			console.log(n)

			if (n instanceof NumberNode) return n.token.value

			if (n instanceof BinaryOperationNode)
				return `(${this.parseString(n.leftNode)} ${
					n.operationToken.type == 'plus'
						? '+'
						: n.operationToken.type == 'minus'
						? '-'
						: n.operationToken.type == 'mul'
						? '*'
						: ':'
				} ${this.parseString(n.rightNode)})`
			return ''
		},
	},
	watch: {
		parsed() {
			this.parse()
		},
	},

	mounted() {
		this.parse()
	},
})

interface ParsedStructogramPart {
	type?: 'call' | 'if'
	value?: string
}
</script>
