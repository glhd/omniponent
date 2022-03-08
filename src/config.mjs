import { dirname, resolve } from 'path';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';

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
	
	async applyPackage(pkg) {
		if ('main' in pkg) {
			await this.setFilename(resolve(process.cwd(), pkg.main));
		}
		
		if ('config' in pkg) {
			if ('componentName' in pkg.config) {
				this.setName(pkg.config.componentName);
			}
			
			if ('propNames' in pkg.config) {
				this.setPropNames(pkg.config.propNames);
			}
		}
		
		return this;
	},
	
	build() {
		return Object.values(this.builds).map(({ recipes, ...build }) => {
			for (let recipe of recipes) {
				build = { ...config.recipes[recipe], ...build };
			}
			
			return build;
		});
	},
	
	recipes: {
		defaults: {
			bundle: true,
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
		},
		react: {
			jsxFactory: 'React.createElement',
			jsxFragment: 'React.Fragment',
		}
	},
	builds: {
		'preact/cjs': {
			recipes: ['defaults', 'preact', 'cjs'],
			inject: [],
			entryPoints: [`${ __dirname }/entrypoints/component.mjs`],
			outfile: 'dist/cjs/preact.js',
		},
		'preact/esm': {
			recipes: ['defaults', 'preact', 'esm'],
			inject: [],
			entryPoints: [`${ __dirname }/entrypoints/component.mjs`],
			outfile: 'dist/esm/preact.js',
		},
		'react/cjs': {
			recipes: ['defaults', 'react', 'cjs'],
			inject: [],
			entryPoints: [`${ __dirname }/entrypoints/component.mjs`],
			outfile: 'dist/esm/react.js',
		},
		'react/esm': {
			recipes: ['defaults', 'react', 'esm'],
			inject: [],
			entryPoints: [`${ __dirname }/entrypoints/component.mjs`],
			outfile: 'dist/esm/react.js',
		},
		'web-component': {
			recipes: ['defaults', 'preact'],
			inject: [`${ __dirname }/shims/preact.mjs`],
			entryPoints: [`${ __dirname }/entrypoints/web-component.mjs`],
			outfile: 'dist/web-component/index.js',
			minify: true,
			define: {
				PROP_NAMES: [],
			},
		},
		'browser': {
			recipes: ['defaults', 'preact'],
			inject: [`${ __dirname }/shims/preact.mjs`],
			entryPoints: [`${ __dirname }/entrypoints/browser.js`],
			outfile: 'dist/browser/index.js',
			globalName: '',
			minify: true,
		},
	},
};

export default async function(callback = () => null) {
	await callback(config);
}
