import { dirname, resolve, parse } from 'path';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import preactCompatPlugin from './plugins/preact-compat.mjs';

let __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
	async setFilename(filename) {
		Object.keys(this.builds).forEach(key => {
			this.builds[key].inject.push(filename);
		});
		
		const componentFile = resolve(__dirname, '..', '__component__.mjs');
		await writeFile(componentFile, `import Component from ${ JSON.stringify(filename) };\nexport default Component;`);
		
		return this;
	},
	
	setName(name) {
		this.builds['browser'].globalName = name;
		
		return this;
	},
	
	setPropNames(names) {
		this.builds['web-component'].define.PROP_NAMES = JSON.stringify(names);
		
		return this;
	},
	
	setWebComponentTag(name) {
		this.builds['web-component'].define.TAG_NAME = JSON.stringify(name);
		
		return this;
	},
	
	async applyPackage(pkg) {
		if ('main' in pkg) {
			await this.setFilename(resolve(process.cwd(), pkg.main));
		}
		
		if ('config' in pkg) {
			if ('componentName' in pkg.config) {
				this.setName(pkg.config.componentName);
			}
			
			if ('componentTag' in pkg.config) {
				this.setWebComponentTag(pkg.config.componentTag);
			}
			
			if ('propNames' in pkg.config) {
				this.setPropNames(pkg.config.propNames);
			}
		}
		
		return this;
	},
	
	build() {
		return Object.values(this.builds).reduce((carry, buildConfig) => {
			let { recipes, exports, ...build } = buildConfig;
			
			for (let recipe of recipes) {
				build = { ...this.recipes[recipe], ...build };
			}
			
			if (build.minify) {
				carry.configs.push({ ...build, minify: false, keepNames: true });
				
				const outfile = parse(build.outfile);
				build.outfile = `${outfile.dir}/${outfile.name}.min${outfile.ext}`;
				build.keepNames = false;
			}
			
			carry.configs.push(build);
			
			for (let path of exports) {
				const key = 'cjs' === build.format
					? 'require'
					: 'default';
				
				carry.exports[path] ??= {};
				carry.exports[path][key] = build.outfile;
			}
			
			return carry;
		}, { exports: {}, configs: [] });
	},
	
	recipes: {
		defaults: {
			bundle: true,
			// keepNames: true,
			minify: false,
			platform: 'browser',
			loader: {
				'.js': 'jsx',
				'.mjs': 'jsx'
			},
		},
		esm: {
			minify: false,
			format: 'esm',
		},
		cjs: {
			minify: false,
			format: 'cjs',
		},
		preact: {
			jsxFactory: 'h',
			jsxFragment: 'Fragment',
			plugins: [preactCompatPlugin],
		},
		react: {
			jsxFactory: 'React.createElement',
			jsxFragment: 'React.Fragment',
		}
	},
	builds: {
		'preact/cjs': {
			exports: ['./preact'],
			recipes: ['defaults', 'preact', 'cjs'],
			inject: [],
			entryPoints: [`${ __dirname }/entrypoints/component.mjs`],
			outfile: 'dist/preact.cjs.js',
		},
		'preact/esm': {
			exports: ['./preact'],
			recipes: ['defaults', 'preact', 'esm'],
			inject: [],
			entryPoints: [`${ __dirname }/entrypoints/component.mjs`],
			outfile: 'dist/preact.mjs',
		},
		'react/cjs': {
			exports: ['./react'],
			recipes: ['defaults', 'react', 'cjs'],
			inject: [],
			entryPoints: [`${ __dirname }/entrypoints/component.mjs`],
			outfile: 'dist/react.cjs.js',
		},
		'react/esm': {
			exports: ['./', './react'],
			recipes: ['defaults', 'react', 'esm'],
			inject: [],
			entryPoints: [`${ __dirname }/entrypoints/component.mjs`],
			outfile: 'dist/react.mjs',
		},
		'web-component': {
			exports: ['./web-component'],
			recipes: ['defaults', 'preact'],
			inject: [`${ __dirname }/shims/preact.mjs`],
			entryPoints: [`${ __dirname }/entrypoints/web-component.mjs`],
			outfile: 'dist/web-component.js',
			minify: true,
			define: {
				TAG_NAME: 'omniponent-web-component',
				PROP_NAMES: [],
			},
		},
		'browser': {
			exports: ['./browser'],
			recipes: ['defaults', 'preact'],
			inject: [`${ __dirname }/shims/preact.mjs`],
			entryPoints: [`${ __dirname }/entrypoints/browser.js`],
			outfile: 'dist/browser.js',
			globalName: '',
			minify: true,
		},
	},
};

export default async function(callback = () => null) {
	await callback(config);
}
