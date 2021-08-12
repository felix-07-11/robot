module.exports = {
<<<<<<< HEAD
    root: true,
    env: {
        node: true,
    },
    extends: [
        'plugin:vue/essential',
        'eslint:recommended',
        '@vue/typescript/recommended',
        // 'prettier',
        '@vue/prettier',
        '@vue/prettier/@typescript-eslint',
    ],
    plugins: ['prettier'],
    parserOptions: {
        ecmaVersion: 2020,
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
=======

	root: true,
	env: {
		node: true,
	},
	extends: [
		'plugin:vue/essential',
		'eslint:recommended',
		'@vue/typescript/recommended',
		'prettier',
		// '@vue/prettier',
		// '@vue/prettier/@typescript-eslint',
	],
	plugins: ['prettier'],
	parserOptions: {
		ecmaVersion: 2020,
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'prettier/prettier': [
			'error',
			{
				endOfLine: 'auto',
			},
		],
>>>>>>> 0369535d8e24f38cd4bfe72352f41f78f5568264

        allowIndentationTabs: 0,
    },
};
