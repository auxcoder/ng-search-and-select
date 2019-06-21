module.exports = {
	root: true,
	extends: ['eslint:recommended', 'angular'],
	plugins: ['angular', 'prettier'],
	globals: {
		expect: true,
		angular: true,
		he: true,
		module: true,
		inject: true,
		moment: true,
		exports: true,
		jquery: false,
		console: true,
		toastr: true,
		google: false,
		Intercom: true,
		require: true
	},
	env: {
		browser: true,
		node: true,
		jquery: true,
		jasmine: true,
	},
	rules: {
		// "no-dupe-keys": 1,
		// "no-func-assign": 1,
		// "quotes": [1, "single"],
		// "no-space-before-semi": 0,
		// "semi-spacing": [2, { "before": false, "after": true }],
		// "keyword-spacing": 1,
		// "func-names": 0,
		"no-unused-vars": 0,
		'no-debugger': 0,
		'no-alert': 0,
		'no-await-in-loop': 0,
		'no-return-assign': ['error', 'except-parens'],
		'no-restricted-syntax': [2, 'ForInStatement', 'LabeledStatement', 'WithStatement'],
		'no-unused-vars': [
			2,
			{
				ignoreSiblings: true,
				argsIgnorePattern: 'res|next|^err'
			}
		],
		'prefer-const': [
			'error',
			{
				destructuring: 'all'
			}
		],
		'arrow-body-style': [2, 'as-needed'],
		'no-unused-expressions': [
			2,
			{
				allowTaggedTemplates: true
			}
		],
		'no-param-reassign': [
			2,
			{
				props: false
			}
		],
		'no-console': 0,
		'import/prefer-default-export': 0,
		import: 0,
		'func-names': 0,
		'space-before-function-paren': 0,
		'comma-dangle': 0,
		'max-len': 0,
		'import/extensions': 0,
		'no-underscore-dangle': 0,
		'consistent-return': 0,
		radix: 0,
		'no-shadow': [
			2,
			{
				hoist: 'all',
				allow: ['resolve', 'reject', 'done', 'next', 'err', 'error']
			}
		],
		quotes: [
			2,
			'single',
			{
				avoidEscape: true,
				allowTemplateLiterals: true
			}
		],
		'prettier/prettier': [
			'error',
			{
				trailingComma: 'es5',
				singleQuote: true,
				printWidth: 120
			}
		],
		"no-mixed-spaces-and-tabs": [2, "smart-tabs"],
		"angular/no-service-method": 0,
		"angular/definedundefined": 0,
		"angular/typecheck-array": 0,
		"angular/controller-as-vm": 0,
		"angular/json-functions": 0,
		"angular/typecheck-string": 0,
		"angular/module-getter": 0,
	}
};
