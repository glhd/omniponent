import { config } from './config.mjs';
import { access } from 'fs/promises';
import { constants } from 'fs';

export default async function loadConfig(pkg) {
	await config.applyPackage(pkg);
	
	await applyCustomConfiguration();
	
	return config.build();
}

export async function applyCustomConfiguration()
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
