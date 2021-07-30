<template>
	<div
		class="d-flex flex-column align-center justify-center pa-5"
		style="height: 100%; width: 100%"
	>
		<v-expansion-panels style="max-width: 800px">
			<v-expansion-panel>
				<v-expansion-panel-header>
					Neue Welt erstellen
				</v-expansion-panel-header>
				<v-expansion-panel-content>
					<v-form>
						<v-container>
							<v-row>
								<v-col cols="4">
									<v-text-field
										v-model="sizeX"
										label="Breite"
										clearable
										:rules="[
											(val) =>
												!!val ||
												'Das Feld muss ausgefüllt sein!',
											(val) =>
												!/\D/.test(val) ||
												'Die Größe muss eine ganze Zahl sein!',
											(val) =>
												Number(val) >= 1 ||
												'Die Welt muss mindestens 1 × 1 × 1 groß sein!',
											() =>
												Number(sizeX) *
													Number(sizeY) *
													Number(sizeZ) <
													10001 ||
												'Die Welt darf maximal ein Volumen von 10000 haben!',
										]"
									></v-text-field>
								</v-col>
								<v-col cols="4">
									<v-text-field
										v-model="sizeY"
										label="Höhe"
										clearable
										:rules="[
											(val) =>
												!!val ||
												'Das Feld muss ausgefüllt sein!',
											(val) =>
												!/\D/.test(val) ||
												'Die Größe muss eine ganze Zahl sein!',
											(val) =>
												Number(val) >= 1 ||
												'Die Welt muss mindestens 1 × 1 × 1 groß sein!',
											() =>
												Number(sizeX) *
													Number(sizeY) *
													Number(sizeZ) <
													10001 ||
												'Die Welt darf maximal ein Volumen von 10000 haben!',
										]"
									></v-text-field>
								</v-col>
								<v-col cols="4">
									<v-text-field
										v-model="sizeZ"
										label="Tiefe"
										clearable
										:rules="[
											(val) =>
												!!val ||
												'Das Feld muss ausgefüllt sein!',
											(val) =>
												!/\D/.test(val) ||
												'Die Größe muss eine ganze Zahl sein!',
											(val) =>
												Number(val) >= 1 ||
												'Die Welt muss mindestens 1 × 1 × 1 groß sein!',
											() =>
												Number(sizeX) *
													Number(sizeY) *
													Number(sizeZ) <
													10001 ||
												'Die Welt darf maximal ein Volumen von 10000 haben!',
										]"
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-btn block @click="createWorld">
										Erstellen
									</v-btn>
								</v-col>
							</v-row>
						</v-container>
					</v-form>
				</v-expansion-panel-content>
			</v-expansion-panel>
			<v-expansion-panel>
				<v-expansion-panel-header>
					Aktuelle Welt speichern
				</v-expansion-panel-header>
				<v-expansion-panel-content>
					<v-form ref="saveWorld">
						<div
							class="d-flex flex-row align-center justify-center"
							style="width: 100%"
						>
							<v-text-field
								v-model="filename"
								label="Dateiname"
								clearable
							></v-text-field>
							<v-btn
								class="ml-4"
								@click="
									if ($refs.saveWorld.validate()) {
										saveWorld()
										$refs.saveWorld.reset()
									}
								"
								>Speichern</v-btn
							>
						</div>
					</v-form>
				</v-expansion-panel-content>
			</v-expansion-panel>
		</v-expansion-panels>
	</div>
</template>

<script lang="ts">
import { World } from '@/assets/3d/world'
import store from '@/store'
import Vue from 'vue'
export default Vue.extend({
	data: () => ({
		newFile: '',
		sizeX: '1',
		sizeY: '1',
		sizeZ: '1',
		filename: '',
	}),

	methods: {
		createWorld() {
			store.state.newWorld = true
			store.commit(
				'SET_WORLD',
				World.createNewWorld({
					w: Number(this.sizeX),
					h: Number(this.sizeY),
					d: Number(this.sizeZ),
				})
			)
		},
		saveWorld() {
			let filename = this.filename
			if (!/\.rw/.test(filename)) filename = `${filename}.rw`
			store.dispatch('createFile', {
				name: filename,
				dir: 'storage',
				val: store.state.world,
			})
		},
	},
})
</script>
