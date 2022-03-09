import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

let __dirname = dirname(fileURLToPath(import.meta.url));

const preactCompatPlugin = {
	name: `preact-compat`,
	setup({ onResolve }) {
		const root = resolve(__dirname, '..', '..', `node_modules/preact/compat/dist/`);
		onResolve({ filter: /^(react-dom|react)$/ }, (args) => {
			const filename = ('require-call' === args.kind || 'require-resolve' === args.kind)
				? 'compat.js'
				: 'compat.mjs';
			
			return { path: `${root}/${filename}` };
		});
	}
};

export default preactCompatPlugin;
