##script_loader.js

The simplest module for asynchronous loading of scripts.

###Methods

####loadScripts
```javascript
loadScripts(urls, callback, context)
```

Loads scripts, which have their addresses conveyed in the array **urls**, in the context **context**. Performs the callback function **callback** upon the end of loading.