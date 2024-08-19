module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		"@typescript-eslint"
	],
	extends: [
		"eslint:recommended",
		'plugin:@typescript-eslint/recommended'
	],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		"space-in-parens": [ "error", "never" ],
		"brace-style": [ "error", "1tbs", { "allowSingleLine": true } ],
		"quotes": [ "error", "double", {
			"avoidEscape": true,
			"allowTemplateLiterals": true
		}],
		"key-spacing": [ "error", {
			"beforeColon": false,
			"afterColon": true,
			"mode": "minimum",
			"align": "value"
		} ],
		"indent": [ "error", "tab", {
			"SwitchCase": 1
		}],
		"no-sequences": [ "error" ],
		"max-classes-per-file": ["off"],
		"no-bitwise": ["off"],
		"no-new-wrappers": ["error"],
		"sort-imports": ["error"],

		"@typescript-eslint/no-this-alias": [ "off" ],
		"@typescript-eslint/no-empty-function": [ "off" ],
		"no-restricted-syntax": [
            "error",
            {
                "selector": "CallExpression[callee.object.name='console'][callee.property.name=/^(log)$/]",
                "message": "console.log is forbidden in production code. You can do better than that."
            }
        ],

		"no-prototype-builtins": [ "off" ],
		"prefer-spread": [ "off" ],
		"prefer-rest-params": [ "off" ],
		"no-magic-numbers": [ "off" ],
		"@typescript-eslint/no-explicit-any": [ "off" ],
		"@typescript-eslint/no-inferrable-types": [ "off" ],
		"@typescript-eslint/explicit-module-boundary-types": [ "off" ],
		"@typescript-eslint/array-type": [ "error", {
			"default": "array-simple"
		}],
		"@typescript-eslint/one-variable-per-declaration": ["off"],

		"@typescript-eslint/typedef-whitespace": ["off"],
		"@typescript-eslint/interface-name": ["off"],
		"@typescript-eslint/no-empty": ["off"],

		"@typescript-eslint/member-ordering": ["off"],
		"@typescript-eslint/new-parens": ["off"],
		"@typescript-eslint/only-arrow-functions": ["off"],
		"@typescript-eslint/object-literal-sort-keys": ["off"],
		"@typescript-eslint/ordered-imports": ["off"]
	}
};
