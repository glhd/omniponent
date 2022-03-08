import { readFile } from 'fs/promises';
import esbuild from 'esbuild';
// import NpmConfig from '@npmcli/config';
// import npm from '../node_modules/npm/lib/utils/config/index.js';
import { gzipSizeFromFile } from 'gzip-size';
import loadConfig from './loadConfig.mjs';

// const { definitions, shorthands, flatten } = npm;

export default async () => {
	const config = await loadConfig(await getPackage());
	
	// const npmconfig = new NpmConfig({ 
	// 	npmPath: process.cwd(),
	// 	definitions,
	// 	flatten,
	// 	shorthands,
	// });
	
	console.log(`\nBuilding...\n`);
	
	for (let buildConfig of config) {
		await esbuild.build(buildConfig);
		
		const size = await gzipSizeFromFile(buildConfig.outfile);
		console.log(`✅ ${ buildConfig.outfile } (${ bytesToSize(size) })`);
	}
	
	const exports = {
		".": "./dist/cjs/react.js",
		"./cjs": "./dist/cjs/react.js",
		"./cjs/react": "./dist/cjs/react.js",
		"./cjs/preact": "./dist/cjs/preact.js",
		"./esm": "./dist/esm/react.js",
		"./esm/react": "./dist/esm/react.js",
		"./esm/preact": "./dist/esm/preact.js",
		"./browser": "./dist/browser/index.js",
		"./web-component": "./dist/web-component/index.js"
	};
	
	console.log(``);
	
	console.log(`Please update your package.json "exports" to:\n\n${ JSON.stringify(exports, null, 2) }`);
	
	console.log(``);
};

async function getPackage() {
	const filename = `${ process.cwd() }/package.json`;
	
	try {
		return JSON.parse(await readFile(filename));
	} catch {
		console.error('No package.json found!');
		process.exit(1);
	}
}

function bytesToSize(bytes) {
	const units = [`byte`, `kilobyte`, `megabyte`];
	const unit = Math.floor(Math.log(bytes) / Math.log(1024));
	return new Intl.NumberFormat("en", { style: "unit", unit: units[unit] }).format(bytes / 1024 ** unit);
}
