# Omniponent

Build components in JSX and ship for:

- React
- Preact
- Native Web Components
- Vanilla JS

## Install

```shell
# yarn global add @glhd/omniponent
```

## Usage

Update your `package.json` file with:

```json5
{
  // The file that exports your component
  "main": "src/HelloComponent.jsx",
  
  "config": {
	  // Whatever you want as the global function name on web
	  "componentName": "HelloComponent",
    
	  // The name of props your component accepts (necessary for web components)
	  "propNames": [
		  "name",
		  "uppercase"
	  ]
  }
}
```

Once everything is set up, just run `omniponent` in your project to build everything!
