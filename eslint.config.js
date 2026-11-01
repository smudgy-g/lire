import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

// svelte-eslint-parser nests <script> statements under SvelteScriptElement, which the
// stylistic padding rule ignores (it only checks Program/block children). Present that
// parent as Program so the rule also covers top-level statements in .svelte files.
const asProgram = (node) =>
	node?.parent?.type === 'SvelteScriptElement'
		? new Proxy(node, {
				get: (t, k) => (k === 'parent' ? { ...t.parent, type: 'Program' } : t[k])
			})
		: node;

const basePadding = stylistic.rules['padding-line-between-statements'];

const padding = {
	...basePadding,
	create(context) {
		const listeners = basePadding.create(context);

		return Object.fromEntries(
			Object.entries(listeners).map(([sel, fn]) => [
				sel,
				(node, ...rest) => fn(asProgram(node), ...rest)
			])
		);
	}
};

export default defineConfig([
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		// typescript-eslint recommends turning this off: TypeScript already reports undefined names
		rules: { 'no-undef': 'off' }
	},

	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: { projectService: true, extraFileExtensions: ['.svelte'], parser: ts.parser }
		}
	},

	{
		plugins: { local: { rules: { padding } } },
		rules: {
			// Blank lines for readability: after the import block, around declaration groups,
			// and around blocks (if/for/try/functions), before return/throw/break.
			'local/padding': [
				'error',
				{ blankLine: 'always', prev: 'import', next: '*' },
				{ blankLine: 'any', prev: 'import', next: 'import' },
				{ blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
				{
					blankLine: 'any',
					prev: ['singleline-const', 'singleline-let'],
					next: ['singleline-const', 'singleline-let']
				},
				{
					blankLine: 'always',
					prev: '*',
					next: ['block-like', 'multiline-expression', 'multiline-const', 'multiline-let', 'export']
				},
				{
					blankLine: 'always',
					prev: [
						'block-like',
						'multiline-expression',
						'multiline-const',
						'multiline-let',
						'export'
					],
					next: '*'
				},
				{ blankLine: 'any', prev: 'singleline-export', next: 'singleline-export' },
				{ blankLine: 'always', prev: '*', next: ['return', 'throw', 'break', 'continue'] }
			]
		}
	}
]);
