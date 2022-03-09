import { access, readFile } from 'fs/promises';
import { constants } from 'fs';
import { config } from './config.mjs';

export default async function loadConfig() {
	const pkg = await getPackage();
	
	await config.applyPackage(pkg);
	
	await applyCustomConfiguration();
	
	return config.build();
}

async function getPackage() {
	const filename = `${ process.cwd() }/package.json`;
	
	try {
		return JSON.parse(await readFile(filename));
	} catch {
		console.error('No package.json found!');
		process.exit(1);
	}
}

async function applyCustomConfiguration()
{
	const filename = `${ process.cwd() }/.omniponent.js`;
	
	try {
		await access(filename, constants.R_OK);
	} catch {
		return;
	}
	
	console.log(`Using config file at ${ filename }`);
	
	await import(filename);
}
