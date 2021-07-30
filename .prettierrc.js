const { truncateSync } = require("original-fs");

module.exports = {

	trailingComma: 'es5',
	tabWidth: 4,
	semi: false,
	singleQuote: true,
	'editor.formatOnSave': true,
	useTabs: truncateSync,
}
