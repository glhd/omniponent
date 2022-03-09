import esbuild from 'esbuild';
import { stat } from 'fs/promises';
import { gzipSizeFromFile } from 'gzip-size';
import { file as brotliSizeFromFile } from 'brotli-size';
import columnify from 'columnify';
import loadConfig from './loadConfig.mjs';

export default async () => {
	const { configs, exports } = await loadConfig();
	
	console.log(`\nBuilding...\n`);
	
	const results = await Promise.all(configs.map(async (config) => {
		await esbuild.build(config);
		const size = bytesToSize((await stat(config.outfile)).size);
		const gzipped = bytesToSize(await gzipSizeFromFile(config.outfile));
		const brotli = bytesToSize(await brotliSizeFromFile(config.outfile));
		
		return { 
			File: `${config.outfile}`,
			Size: bytesToSize((await stat(config.outfile)).size),
			Gzipped: bytesToSize(await gzipSizeFromFile(config.outfile)),
			Brotli: bytesToSize(await brotliSizeFromFile(config.outfile)),
		};
	}));
	
	console.log(columnify(results, {
		headingTransform: heading => heading,
		columnSplitter: '   ',
	}));
	
	// results.forEach(({ config, size }) => {
	// 	console.log(`✅ ${ config.outfile.padEnd(length, ' ') } [ ${ size } ]`);
	// });
	
	console.log(`\nPlease update your package.json "exports" to:\n\n${ JSON.stringify(exports, null, 2) }\n`);
};

function bytesToSize(bytes) {
	const units = [`byte`, `kilobyte`, `megabyte`];
	const unit = Math.floor(Math.log(bytes) / Math.log(1024));
	return new Intl.NumberFormat("en", { style: "unit", unit: units[unit] }).format(bytes / 1024 ** unit);
}
