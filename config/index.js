const defaults = {
	recipes: {
		defaults: {
			bundle: true,
			minify: false,
			platform: 'browser',
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
			entryPoints: ['src/builds/preact.jsx'],
			outfile: 'dist/cjs/preact.js',
		},
		'preact/esm': {
			recipes: ['defaults', 'preact', 'esm'],
			entryPoints: ['src/builds/preact.jsx'],
			outfile: 'dist/esm/preact.js',
		},
		'react/cjs': {
			recipes: ['defaults', 'react', 'cjs'],
			entryPoints: ['src/builds/react.jsx'],
			outfile: 'dist/esm/react.js',
		},
		'react/esm': {
			recipes: ['defaults', 'react', 'esm'],
			entryPoints: ['src/builds/react.jsx'],
			outfile: 'dist/esm/react.js',
		},
		'web-component': {
			recipes: ['defaults', 'preact'],
			inject: ['src/shims/preact.js'],
			entryPoints: ['src/builds/web-component.jsx'],
			outfile: 'dist/web-component/index.js',
			minify: true,
			define: {
				PROP_NAMES: [],
			},
		},
		'browser': {
			recipes: ['defaults', 'preact'],
			inject: ['src/shims/preact.js'],
			entryPoints: ['src/builds/vanilla.jsx'],
			outfile: 'dist/browser/index.js',
			globalName: '',
			minify: true,
		},
	},
};

export default function config() {
	const config = { ...defaults };
	
	config.setName = (name) => {
		config.builds['browser'].globalName = name;
		
		return config;
	};
	
	config.setPropNames = (names) => {
		config.builds['web-component'].define.PROP_NAMES = names;
		
		return config;
	};
	
	config.addRecipe = (build, recipe) => {
		config.builds[build].recipes.push(recipe);
		
		return config;
	};
	
	config.build = () => {
		return Object.values(config.builds).map(({ recipes, ...build }) => {
			for (let recipe of recipes) {
				build = { ...config.recipes[recipe], ...build };
			}
			
			return build;
		});
	};
	
	return config;
}
