const { render, h } = require('preact');
const Component = require('./component.mjs').default;

module.exports = function(parent, props) {
	
	if ("[object String]" === Object.prototype.toString.call(parent)) {
		parent = document.querySelector(parent);
	}
	
	render(h(Component, props), parent);
};
