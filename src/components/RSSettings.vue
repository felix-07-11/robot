<template>
	<div
		class="d-flex flex-column align-center justify-center pa-5"
		style="height: 100%; width: 100%"
	>
		<v-expansion-panels style="max-width: 800px">
			<v-expansion-panel>
				<v-expansion-panel-header>
					Neue RobotScript Datei erstellen
				</v-expansion-panel-header>
				<v-expansion-panel-content>
					<v-form ref="createRsFile">
						<div
							class="d-flex flex-row align-center justify-center"
							style="width: 100%"
						>
							<v-text-field
								v-model="filename"
								label="Dateiname"
								clearable
								:rules="[
									(val) =>
										!!val ||
										'Der Dateiname muss angegeben werden!',
								]"
							></v-text-field>
							<v-btn
								class="ml-4"
								@click="
									if ($refs.createRsFile.validate()) {
										createFile()
										$refs.createRsFile.reset()
									}
								"
							>
								Erstellen
							</v-btn>
						</div>
					</v-form>
				</v-expansion-panel-content>
			</v-expansion-panel>
			<v-expansion-panel>
				<v-expansion-panel-header>
					Neues RobotScript Modul erstellen
				</v-expansion-panel-header>
				<v-expansion-panel-content>
					<v-form>
						<v-container>
							<v-row>
								<v-col cols="12">
									<v-alert type="warning">
										Robot-Script-Module befinden sich noch
										in der Entwicklung.
									</v-alert>
								</v-col>
								<v-col cols="6">
									<v-text-field
										v-model="filename"
										label="Dateiname"
										clearable
									></v-text-field>
								</v-col>
								<v-col cols="6">
									<v-text-field
										v-model="modulename"
										label="Modulname"
										clearable
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-btn block>Erstellen</v-btn>
								</v-col>
							</v-row>
						</v-container>
					</v-form>
				</v-expansion-panel-content>
			</v-expansion-panel>
			<v-expansion-panel>
				<v-expansion-panel-header>
					RobotScript Module verwalten
				</v-expansion-panel-header>
				<v-expansion-panel-content>
					<v-alert type="warning">
						Robot-Script-Module befinden sich noch in der
						Entwicklung.<br />
						Das folgende ist nur ein Designkonzept.
					</v-alert>
					<v-simple-table>
						<template v-slot:default>
							<thead>
								<tr>
									<th class="text-left">Name</th>
									<th class="text-left">Pfad</th>
									<th class="text-center">Status</th>
									<th class="text-center">Aktionen</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Build In</td>
									<td></td>
									<td class="text-center">
										<v-chip
											small
											class="green accent-4 white--text"
											>Fehlerfrei</v-chip
										>
									</td>
									<td></td>
								</tr>
								<tr v-for="(m, i) in modules" :key="i">
									<td>{{ m.name }}</td>
									<td>{{ m.path }}</td>
									<td class="text-center">
										<v-chip
											small
											v-if="m.state === 'ok'"
											class="green accent-4 white--text"
											>Fehlerfrei</v-chip
										>
										<v-chip
											small
											v-else-if="m.state === 'error'"
											class="error"
											>Fehler</v-chip
										>
										<v-chip
											small
											v-else
											class="grey white--text"
											>Deaktiviert</v-chip
										>
									</td>
									<td class="text-center">
										<v-btn
											v-if="m.state === 'ok'"
											icon
											color="error"
										>
											<v-icon>mdi-stop</v-icon>
										</v-btn>
										<v-btn
											v-else
											icon
											dark
											color="green accent-4"
										>
											<v-icon>mdi-play</v-icon>
										</v-btn>
									</td>
								</tr>
							</tbody>
						</template>
					</v-simple-table>
				</v-expansion-panel-content>
			</v-expansion-panel>
		</v-expansion-panels>
	</div>
</template>

<script lang="ts">
import store from '@/store'
import Vue from 'vue'
export default Vue.extend({
	data: () => ({
		filename: '',
		modulename: '',
	}),

	computed: {
		modules: () => [
			{
				name: 'Basic Module',
				path: '@modules/basic1.rmodule',
				state: 'ok',
			},
			{
				name: 'Basic Module mit Fehler',
				path: '@modules/basic2.rmodule',
				state: 'error',
			},
			{
				name: 'Basic Module (Deaktiviert)',
				path: '@modules/basic3.rmodule',
				state: 'disabled',
			},
		],
	},

	methods: {
		createFile() {
			let filename = this.filename
			if (!/\.rs/.test(filename)) filename = `${filename}.rs`
			store.dispatch('createFile', {
				name: filename,
				dir: 'storage',
				val: '',
			})
		},
	},
})
</script>
