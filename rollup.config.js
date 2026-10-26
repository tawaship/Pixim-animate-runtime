import typescript from '@rollup/plugin-typescript';
import buble from '@rollup/plugin-buble';
import { deleteAsync } from 'del';

const conf = require('./package.json');
const version = conf.version;

const banner = [
	'/*!',
	` * @tawaship/pixim-animate-runtime - v${version}`,
	' * ',
	` * @require pixi.js ${conf.peerDependencies['pixi.js']}`,
	` * @require @tawaship/pixim.js ${conf.peerDependencies['@tawaship/pixim.js']}`,
	' * @author tawaship (makazu.mori@gmail.com)',
	' * @license MIT',
	' */',
	''
].join('\n');

// The browser build includes the player (@tawaship/pixi-animate-runtime, its ES module build)
function bundlePlayer() {
	const file = require.resolve('@tawaship/pixi-animate-runtime').replace(/\.cjs\.js$/, '.esm.js');
	return {
		name: 'bundle-player',
		resolveId(id) {
			return id === '@tawaship/pixi-animate-runtime' ? file : null;
		}
	};
}

export default (async () => {
	if (process.env.PROD) {
		await deleteAsync(['./dist/', './types/']);
	}

	return [
		// The browser build: pixi.js and Pixim.js are the application's own
		{
			input: 'src/index.ts',
			output: [
				{ banner, file: 'dist/pixim-animate-runtime.js', format: 'iife', name: 'Pixim.animateRuntime', extend: true, globals: { 'pixi.js': 'PIXI', '@tawaship/pixim.js': 'Pixim' }, sourcemap: true }
			],
			external: ['pixi.js', '@tawaship/pixim.js'],
			// ES5 for the browser (async / for-of are not used, as buble cannot lower them)
			plugins: [bundlePlayer(), typescript({ tsconfig: './tsconfig.json', declaration: false }), buble()]
		},
		// For bundlers: the player is a dependency
		{
			input: 'src/index.ts',
			output: [
				{ banner, file: 'dist/pixim-animate-runtime.cjs.js', format: 'cjs', sourcemap: true },
				{ banner, file: 'dist/pixim-animate-runtime.esm.js', format: 'esm', sourcemap: true }
			],
			external: ['pixi.js', '@tawaship/pixim.js', '@tawaship/pixi-animate-runtime'],
			plugins: [typescript({ tsconfig: './tsconfig.json', declaration: false }), buble()]
		}
	];
})();
