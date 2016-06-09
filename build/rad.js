(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("underscore"), require("backbone"));
	else if(typeof define === 'function' && define.amd)
		define(["underscore", "backbone"], factory);
	else if(typeof exports === 'object')
		exports["RAD"] = factory(require("underscore"), require("backbone"));
	else
		root["RAD"] = factory(root["_"], root["Backbone"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var _ = __webpack_require__(1);
	
	// Init plugins
	__webpack_require__(2);
	
	/**
	 *
	 * RAD namespace.
	 * @namespace
	 */
	
	var RAD = {};
	
	RAD.core = __webpack_require__(13);
	RAD.utils = __webpack_require__(26);
	RAD.template = __webpack_require__(10);
	RAD.View = __webpack_require__(14);
	RAD.Module = __webpack_require__(24);
	
	// Extend with Dispatcher API: publish, subscribe, unsubscribe
	_.extend(RAD, __webpack_require__(6));
	
	module.exports = RAD;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	__webpack_require__(23);
	__webpack_require__(25);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(1);
	var IncrementalDOM = __webpack_require__(4);
	var template = __webpack_require__(10);
	var utils = __webpack_require__(15);
	var contentHandler = __webpack_require__(16);
	var iTemplate = __webpack_require__(11);
	var RunnerQuery = __webpack_require__(22);
	
	var reservedAttrs = [
	    'name', // deprecated
	    'tagName',
	    'key',
	
	    'initialAnimation',
	    'animationName',
	    'animationEnter',
	    'animationLeave',
	    'enterTimeout',
	    'leaveTimeout',
	
	    'enterClass',
	    'leaveClass',
	    'activeClass',
	    'delay',
	    'groupName'
	];
	
	function rootElementOpen(options) {
	    IncrementalDOM.elementOpenStart(options.tagName || 'div', options.key);
	
	    _.each(_.omit(options, reservedAttrs), function (value, name) {
	        IncrementalDOM.attr(name, value);
	    });
	
	    var el = IncrementalDOM.elementOpenEnd();
	
	    if (el.__firstRender === undefined) {
	        el.__firstRender = true;
	    }
	
	    return el;
	}
	
	function rootElementClose(attrs) {
	    var el = IncrementalDOM.elementClose(attrs.tagName);
	    el.__firstRender = false;
	    return el;
	}
	
	function initRenderData(rootEl, attrs) {
	    return {
	        rootEl: rootEl,
	        attrs: attrs,
	        children: utils.toArray(rootEl.children),
	        keyMap: _.clone(utils.getNodeData(rootEl).keyMap) || {},
	        keysRendered: {},
	        keysToShow: {},
	        position: 0,
	        firstRender: rootEl.__firstRender,
	        applyAnimation: !rootEl.__firstRender || attrs.initialAnimation !== 'none'
	    };
	}
	
	iTemplate.registerHelper('i-transition', function(options, renderContent) {
	    if (options.name) {
	        console.warn('Warning: `name` is deprecated attribute for transitionGroup, use `animationName` instead');
	    }
	
	    var rootEl = rootElementOpen(options);
	    var renderData = initRenderData(rootEl, options);
	
	    contentHandler.start(renderData);
	    renderContent();
	    contentHandler.stop(renderData);
	    rootElementClose(options);
	
	    var runner = RunnerQuery.create(options);
	    contentHandler.doTransition(renderData, runner);
	    RunnerQuery.run(runner.name);
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _ = __webpack_require__(1);
	var Backbone = __webpack_require__(5);
	var publish = __webpack_require__(6).publish;
	var incrementalDOM = __webpack_require__(7);
	var attributeSetters = incrementalDOM.attributes;
	var UtilsDOM = __webpack_require__(8);
	var Events = __webpack_require__(9).Events;
	
	// Sett HTMlInput [checked], [disabled] and [readonly] attributes as properties
	function setBooleanAttr(el, attr, value) {
	    el[attr] = !!value;
	}
	
	attributeSetters.checked  = setBooleanAttr;
	attributeSetters.disabled = setBooleanAttr;
	attributeSetters.readOnly = setBooleanAttr;
	
	// Class names muttator handle classes added only via template.
	// Any classes added via DOM manipulation will stay untouched and must be handled by user
	attributeSetters.className = attributeSetters['class'] = function(el, attr, value) {
	    value = value || '';
	
	    UtilsDOM.removeClass(el, el.__className);
	    UtilsDOM.addClass(el, value);
	    el.__className = value;
	};
	
	incrementalDOM.events = _.clone(Backbone.Events);
	
	function eventWrapper(event, args) {
	    var method = args[0];
	    var params = Array.prototype.slice.call(args, 1);
	    incrementalDOM.events.trigger.apply(incrementalDOM.events, [event + ':before'].concat(params));
	    var result = method.apply(null, params);
	    incrementalDOM.events.trigger.apply(incrementalDOM.events, [event + ':after'].concat(params));
	    return result;
	}
	
	incrementalDOM.elementOpen = _.wrap(incrementalDOM.elementOpen, function() {
	    return eventWrapper('elementOpen', arguments);
	});
	incrementalDOM.elementClose = _.wrap(incrementalDOM.elementClose, function() {
	    return eventWrapper('elementClose', arguments);
	});
	incrementalDOM.elementOpenStart = _.wrap(incrementalDOM.elementOpenStart, function() {
	    return eventWrapper('elementOpenStart', arguments);
	});
	incrementalDOM.elementOpenEnd = _.wrap(incrementalDOM.elementOpenEnd, function() {
	    return eventWrapper('elementOpenEnd', arguments);
	});
	incrementalDOM.elementVoid = function(tag) {
	    incrementalDOM.elementOpen.apply(null, arguments);
	    return incrementalDOM.elementClose(tag);
	};
	
	
	function patchWrapper(patch, node, renderFn, data) {
	    publish(Events.PATCH_START, node);
	    patch.call(null, node, renderFn, data);
	    publish(Events.PATCH_END, node);
	}
	
	incrementalDOM.patch = incrementalDOM.patchInner = _.wrap(incrementalDOM.patchInner, patchWrapper);
	incrementalDOM.patchOuter = _.wrap(incrementalDOM.patchOuter, patchWrapper);
	
	module.exports = incrementalDOM;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _ = __webpack_require__(1);
	var Backbone = __webpack_require__(5);
	var Dispatcher = _.clone(Backbone.Events);
	
	
	module.exports = {
	    publish: function() {
	        Dispatcher.trigger.apply(Dispatcher, arguments);
	    },
	    subscribe: function(channel, callback, context) {
	        Dispatcher.on(channel, callback, context);
	    },
	    unsubscribe: function(channel, callback, context) {
	        Dispatcher.off(channel, callback, context);
	    }
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * @license
	 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS-IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	'use strict';
	
	/**
	 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS-IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	/**
	 * A cached reference to the hasOwnProperty function.
	 */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	
	/**
	 * A cached reference to the create function.
	 */
	var create = Object.create;
	
	/**
	 * Used to prevent property collisions between our "map" and its prototype.
	 * @param {!Object<string, *>} map The map to check.
	 * @param {string} property The property to check.
	 * @return {boolean} Whether map has property.
	 */
	var has = function (map, property) {
	  return hasOwnProperty.call(map, property);
	};
	
	/**
	 * Creates an map object without a prototype.
	 * @return {!Object}
	 */
	var createMap = function () {
	  return create(null);
	};
	
	/**
	 * Keeps track of information needed to perform diffs for a given DOM node.
	 * @param {!string} nodeName
	 * @param {?string=} key
	 * @constructor
	 */
	function NodeData(nodeName, key) {
	  /**
	   * The attributes and their values.
	   * @const {!Object<string, *>}
	   */
	  this.attrs = createMap();
	
	  /**
	   * An array of attribute name/value pairs, used for quickly diffing the
	   * incomming attributes to see if the DOM node's attributes need to be
	   * updated.
	   * @const {Array<*>}
	   */
	  this.attrsArr = [];
	
	  /**
	   * The incoming attributes for this Node, before they are updated.
	   * @const {!Object<string, *>}
	   */
	  this.newAttrs = createMap();
	
	  /**
	   * The key used to identify this node, used to preserve DOM nodes when they
	   * move within their parent.
	   * @const
	   */
	  this.key = key;
	
	  /**
	   * Keeps track of children within this node by their key.
	   * {?Object<string, !Element>}
	   */
	  this.keyMap = null;
	
	  /**
	   * Whether or not the keyMap is currently valid.
	   * {boolean}
	   */
	  this.keyMapValid = true;
	
	  /**
	   * The node name for this node.
	   * @const {string}
	   */
	  this.nodeName = nodeName;
	
	  /**
	   * @type {?string}
	   */
	  this.text = null;
	}
	
	/**
	 * Initializes a NodeData object for a Node.
	 *
	 * @param {Node} node The node to initialize data for.
	 * @param {string} nodeName The node name of node.
	 * @param {?string=} key The key that identifies the node.
	 * @return {!NodeData} The newly initialized data object
	 */
	var initData = function (node, nodeName, key) {
	  var data = new NodeData(nodeName, key);
	  node['__incrementalDOMData'] = data;
	  return data;
	};
	
	/**
	 * Retrieves the NodeData object for a Node, creating it if necessary.
	 *
	 * @param {Node} node The node to retrieve the data for.
	 * @return {!NodeData} The NodeData for this Node.
	 */
	var getData = function (node) {
	  var data = node['__incrementalDOMData'];
	
	  if (!data) {
	    var nodeName = node.nodeName.toLowerCase();
	    var key = null;
	
	    if (node instanceof Element) {
	      key = node.getAttribute('key');
	    }
	
	    data = initData(node, nodeName, key);
	  }
	
	  return data;
	};
	
	/**
	 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS-IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	/** @const */
	var symbols = {
	  default: '__default',
	
	  placeholder: '__placeholder'
	};
	
	/**
	 * @param {string} name
	 * @return {string|undefined} The namespace to use for the attribute.
	 */
	var getNamespace = function (name) {
	  if (name.lastIndexOf('xml:', 0) === 0) {
	    return 'http://www.w3.org/XML/1998/namespace';
	  }
	
	  if (name.lastIndexOf('xlink:', 0) === 0) {
	    return 'http://www.w3.org/1999/xlink';
	  }
	};
	
	/**
	 * Applies an attribute or property to a given Element. If the value is null
	 * or undefined, it is removed from the Element. Otherwise, the value is set
	 * as an attribute.
	 * @param {!Element} el
	 * @param {string} name The attribute's name.
	 * @param {?(boolean|number|string)=} value The attribute's value.
	 */
	var applyAttr = function (el, name, value) {
	  if (value == null) {
	    el.removeAttribute(name);
	  } else {
	    var attrNS = getNamespace(name);
	    if (attrNS) {
	      el.setAttributeNS(attrNS, name, value);
	    } else {
	      el.setAttribute(name, value);
	    }
	  }
	};
	
	/**
	 * Applies a property to a given Element.
	 * @param {!Element} el
	 * @param {string} name The property's name.
	 * @param {*} value The property's value.
	 */
	var applyProp = function (el, name, value) {
	  el[name] = value;
	};
	
	/**
	 * Applies a style to an Element. No vendor prefix expansion is done for
	 * property names/values.
	 * @param {!Element} el
	 * @param {string} name The attribute's name.
	 * @param {*} style The style to set. Either a string of css or an object
	 *     containing property-value pairs.
	 */
	var applyStyle = function (el, name, style) {
	  if (typeof style === 'string') {
	    el.style.cssText = style;
	  } else {
	    el.style.cssText = '';
	    var elStyle = el.style;
	    var obj = /** @type {!Object<string,string>} */style;
	
	    for (var prop in obj) {
	      if (has(obj, prop)) {
	        elStyle[prop] = obj[prop];
	      }
	    }
	  }
	};
	
	/**
	 * Updates a single attribute on an Element.
	 * @param {!Element} el
	 * @param {string} name The attribute's name.
	 * @param {*} value The attribute's value. If the value is an object or
	 *     function it is set on the Element, otherwise, it is set as an HTML
	 *     attribute.
	 */
	var applyAttributeTyped = function (el, name, value) {
	  var type = typeof value;
	
	  if (type === 'object' || type === 'function') {
	    applyProp(el, name, value);
	  } else {
	    applyAttr(el, name, /** @type {?(boolean|number|string)} */value);
	  }
	};
	
	/**
	 * Calls the appropriate attribute mutator for this attribute.
	 * @param {!Element} el
	 * @param {string} name The attribute's name.
	 * @param {*} value The attribute's value.
	 */
	var updateAttribute = function (el, name, value) {
	  var data = getData(el);
	  var attrs = data.attrs;
	
	  if (attrs[name] === value) {
	    return;
	  }
	
	  var mutator = attributes[name] || attributes[symbols.default];
	  mutator(el, name, value);
	
	  attrs[name] = value;
	};
	
	/**
	 * A publicly mutable object to provide custom mutators for attributes.
	 * @const {!Object<string, function(!Element, string, *)>}
	 */
	var attributes = createMap();
	
	// Special generic mutator that's called for any attribute that does not
	// have a specific mutator.
	attributes[symbols.default] = applyAttributeTyped;
	
	attributes[symbols.placeholder] = function () {};
	
	attributes['style'] = applyStyle;
	
	/**
	 * Gets the namespace to create an element (of a given tag) in.
	 * @param {string} tag The tag to get the namespace for.
	 * @param {?Node} parent
	 * @return {?string} The namespace to create the tag in.
	 */
	var getNamespaceForTag = function (tag, parent) {
	  if (tag === 'svg') {
	    return 'http://www.w3.org/2000/svg';
	  }
	
	  if (getData(parent).nodeName === 'foreignObject') {
	    return null;
	  }
	
	  return parent.namespaceURI;
	};
	
	/**
	 * Creates an Element.
	 * @param {Document} doc The document with which to create the Element.
	 * @param {?Node} parent
	 * @param {string} tag The tag for the Element.
	 * @param {?string=} key A key to identify the Element.
	 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
	 *     static attributes for the Element.
	 * @return {!Element}
	 */
	var createElement = function (doc, parent, tag, key, statics) {
	  var namespace = getNamespaceForTag(tag, parent);
	  var el = undefined;
	
	  if (namespace) {
	    el = doc.createElementNS(namespace, tag);
	  } else {
	    el = doc.createElement(tag);
	  }
	
	  initData(el, tag, key);
	
	  if (statics) {
	    for (var i = 0; i < statics.length; i += 2) {
	      updateAttribute(el, /** @type {!string}*/statics[i], statics[i + 1]);
	    }
	  }
	
	  return el;
	};
	
	/**
	 * Creates a Text Node.
	 * @param {Document} doc The document with which to create the Element.
	 * @return {!Text}
	 */
	var createText = function (doc) {
	  var node = doc.createTextNode('');
	  initData(node, '#text', null);
	  return node;
	};
	
	/**
	 * Creates a mapping that can be used to look up children using a key.
	 * @param {?Node} el
	 * @return {!Object<string, !Element>} A mapping of keys to the children of the
	 *     Element.
	 */
	var createKeyMap = function (el) {
	  var map = createMap();
	  var child = el.firstElementChild;
	
	  while (child) {
	    var key = getData(child).key;
	
	    if (key) {
	      map[key] = child;
	    }
	
	    child = child.nextElementSibling;
	  }
	
	  return map;
	};
	
	/**
	 * Retrieves the mapping of key to child node for a given Element, creating it
	 * if necessary.
	 * @param {?Node} el
	 * @return {!Object<string, !Node>} A mapping of keys to child Elements
	 */
	var getKeyMap = function (el) {
	  var data = getData(el);
	
	  if (!data.keyMap) {
	    data.keyMap = createKeyMap(el);
	  }
	
	  return data.keyMap;
	};
	
	/**
	 * Retrieves a child from the parent with the given key.
	 * @param {?Node} parent
	 * @param {?string=} key
	 * @return {?Node} The child corresponding to the key.
	 */
	var getChild = function (parent, key) {
	  return key ? getKeyMap(parent)[key] : null;
	};
	
	/**
	 * Registers an element as being a child. The parent will keep track of the
	 * child using the key. The child can be retrieved using the same key using
	 * getKeyMap. The provided key should be unique within the parent Element.
	 * @param {?Node} parent The parent of child.
	 * @param {string} key A key to identify the child with.
	 * @param {!Node} child The child to register.
	 */
	var registerChild = function (parent, key, child) {
	  getKeyMap(parent)[key] = child;
	};
	
	/**
	 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS-IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	/** @const */
	var notifications = {
	  /**
	   * Called after patch has compleated with any Nodes that have been created
	   * and added to the DOM.
	   * @type {?function(Array<!Node>)}
	   */
	  nodesCreated: null,
	
	  /**
	   * Called after patch has compleated with any Nodes that have been removed
	   * from the DOM.
	   * Note it's an applications responsibility to handle any childNodes.
	   * @type {?function(Array<!Node>)}
	   */
	  nodesDeleted: null
	};
	
	/**
	 * Keeps track of the state of a patch.
	 * @constructor
	 */
	function Context() {
	  /**
	   * @type {(Array<!Node>|undefined)}
	   */
	  this.created = notifications.nodesCreated && [];
	
	  /**
	   * @type {(Array<!Node>|undefined)}
	   */
	  this.deleted = notifications.nodesDeleted && [];
	}
	
	/**
	 * @param {!Node} node
	 */
	Context.prototype.markCreated = function (node) {
	  if (this.created) {
	    this.created.push(node);
	  }
	};
	
	/**
	 * @param {!Node} node
	 */
	Context.prototype.markDeleted = function (node) {
	  if (this.deleted) {
	    this.deleted.push(node);
	  }
	};
	
	/**
	 * Notifies about nodes that were created during the patch opearation.
	 */
	Context.prototype.notifyChanges = function () {
	  if (this.created && this.created.length > 0) {
	    notifications.nodesCreated(this.created);
	  }
	
	  if (this.deleted && this.deleted.length > 0) {
	    notifications.nodesDeleted(this.deleted);
	  }
	};
	
	/**
	* Makes sure that keyed Element matches the tag name provided.
	* @param {!string} nodeName The nodeName of the node that is being matched.
	* @param {string=} tag The tag name of the Element.
	* @param {?string=} key The key of the Element.
	*/
	var assertKeyedTagMatches = function (nodeName, tag, key) {
	  if (nodeName !== tag) {
	    throw new Error('Was expecting node with key "' + key + '" to be a ' + tag + ', not a ' + nodeName + '.');
	  }
	};
	
	/** @type {?Context} */
	var context = null;
	
	/** @type {?Node} */
	var currentNode = null;
	
	/** @type {?Node} */
	var currentParent = null;
	
	/** @type {?Element|?DocumentFragment} */
	var root = null;
	
	/** @type {?Document} */
	var doc = null;
	
	/**
	 * Returns a patcher function that sets up and restores a patch context,
	 * running the run function with the provided data.
	 * @param {function((!Element|!DocumentFragment),!function(T),T=)} run
	 * @return {function((!Element|!DocumentFragment),!function(T),T=)}
	 * @template T
	 */
	var patchFactory = function (run) {
	  /**
	   * TODO(moz): These annotations won't be necessary once we switch to Closure
	   * Compiler's new type inference. Remove these once the switch is done.
	   *
	   * @param {(!Element|!DocumentFragment)} node
	   * @param {!function(T)} fn
	   * @param {T=} data
	   * @template T
	   */
	  var f = function (node, fn, data) {
	    var prevContext = context;
	    var prevRoot = root;
	    var prevDoc = doc;
	    var prevCurrentNode = currentNode;
	    var prevCurrentParent = currentParent;
	    var previousInAttributes = false;
	    var previousInSkip = false;
	
	    context = new Context();
	    root = node;
	    doc = node.ownerDocument;
	    currentParent = node.parentNode;
	
	    if (false) {}
	
	    run(node, fn, data);
	
	    if (false) {}
	
	    context.notifyChanges();
	
	    context = prevContext;
	    root = prevRoot;
	    doc = prevDoc;
	    currentNode = prevCurrentNode;
	    currentParent = prevCurrentParent;
	  };
	  return f;
	};
	
	/**
	 * Patches the document starting at node with the provided function. This
	 * function may be called during an existing patch operation.
	 * @param {!Element|!DocumentFragment} node The Element or Document
	 *     to patch.
	 * @param {!function(T)} fn A function containing elementOpen/elementClose/etc.
	 *     calls that describe the DOM.
	 * @param {T=} data An argument passed to fn to represent DOM state.
	 * @template T
	 */
	var patchInner = patchFactory(function (node, fn, data) {
	  currentNode = node;
	
	  enterNode();
	  fn(data);
	  exitNode();
	
	  if (false) {}
	});
	
	/**
	 * Patches an Element with the the provided function. Exactly one top level
	 * element call should be made corresponding to `node`.
	 * @param {!Element} node The Element where the patch should start.
	 * @param {!function(T)} fn A function containing elementOpen/elementClose/etc.
	 *     calls that describe the DOM. This should have at most one top level
	 *     element call.
	 * @param {T=} data An argument passed to fn to represent DOM state.
	 * @template T
	 */
	var patchOuter = patchFactory(function (node, fn, data) {
	  currentNode = /** @type {!Element} */{ nextSibling: node };
	
	  fn(data);
	
	  if (false) {}
	});
	
	/**
	 * Checks whether or not the current node matches the specified nodeName and
	 * key.
	 *
	 * @param {?string} nodeName The nodeName for this node.
	 * @param {?string=} key An optional key that identifies a node.
	 * @return {boolean} True if the node matches, false otherwise.
	 */
	var matches = function (nodeName, key) {
	  var data = getData(currentNode);
	
	  // Key check is done using double equals as we want to treat a null key the
	  // same as undefined. This should be okay as the only values allowed are
	  // strings, null and undefined so the == semantics are not too weird.
	  return nodeName === data.nodeName && key == data.key;
	};
	
	/**
	 * Aligns the virtual Element definition with the actual DOM, moving the
	 * corresponding DOM node to the correct location or creating it if necessary.
	 * @param {string} nodeName For an Element, this should be a valid tag string.
	 *     For a Text, this should be #text.
	 * @param {?string=} key The key used to identify this element.
	 * @param {?Array<*>=} statics For an Element, this should be an array of
	 *     name-value pairs.
	 */
	var alignWithDOM = function (nodeName, key, statics) {
	  if (currentNode && matches(nodeName, key)) {
	    return;
	  }
	
	  var node = undefined;
	
	  // Check to see if the node has moved within the parent.
	  if (key) {
	    node = getChild(currentParent, key);
	    if (node && 'production' !== 'production') {
	      assertKeyedTagMatches(getData(node).nodeName, nodeName, key);
	    }
	  }
	
	  // Create the node if it doesn't exist.
	  if (!node) {
	    if (nodeName === '#text') {
	      node = createText(doc);
	    } else {
	      node = createElement(doc, currentParent, nodeName, key, statics);
	    }
	
	    if (key) {
	      registerChild(currentParent, key, node);
	    }
	
	    context.markCreated(node);
	  }
	
	  // If the node has a key, remove it from the DOM to prevent a large number
	  // of re-orders in the case that it moved far or was completely removed.
	  // Since we hold on to a reference through the keyMap, we can always add it
	  // back.
	  if (currentNode && getData(currentNode).key) {
	    currentParent.replaceChild(node, currentNode);
	    getData(currentParent).keyMapValid = false;
	  } else {
	    currentParent.insertBefore(node, currentNode);
	  }
	
	  currentNode = node;
	};
	
	/**
	 * Clears out any unvisited Nodes, as the corresponding virtual element
	 * functions were never called for them.
	 */
	var clearUnvisitedDOM = function () {
	  var node = currentParent;
	  var data = getData(node);
	  var keyMap = data.keyMap;
	  var keyMapValid = data.keyMapValid;
	  var child = node.lastChild;
	  var key = undefined;
	
	  if (child === currentNode && keyMapValid) {
	    return;
	  }
	
	  if (data.attrs[symbols.placeholder] && node !== root) {
	    if (false) {}
	    return;
	  }
	
	  while (child !== currentNode) {
	    node.removeChild(child);
	    context.markDeleted( /** @type {!Node}*/child);
	
	    key = getData(child).key;
	    if (key) {
	      delete keyMap[key];
	    }
	    child = node.lastChild;
	  }
	
	  // Clean the keyMap, removing any unusued keys.
	  if (!keyMapValid) {
	    for (key in keyMap) {
	      child = keyMap[key];
	      if (child.parentNode !== node) {
	        context.markDeleted(child);
	        delete keyMap[key];
	      }
	    }
	
	    data.keyMapValid = true;
	  }
	};
	
	/**
	 * Changes to the first child of the current node.
	 */
	var enterNode = function () {
	  currentParent = currentNode;
	  currentNode = null;
	};
	
	/**
	 * Changes to the next sibling of the current node.
	 */
	var nextNode = function () {
	  if (currentNode) {
	    currentNode = currentNode.nextSibling;
	  } else {
	    currentNode = currentParent.firstChild;
	  }
	};
	
	/**
	 * Changes to the parent of the current node, removing any unvisited children.
	 */
	var exitNode = function () {
	  clearUnvisitedDOM();
	
	  currentNode = currentParent;
	  currentParent = currentParent.parentNode;
	};
	
	/**
	 * Makes sure that the current node is an Element with a matching tagName and
	 * key.
	 *
	 * @param {string} tag The element's tag.
	 * @param {?string=} key The key used to identify this element. This can be an
	 *     empty string, but performance may be better if a unique value is used
	 *     when iterating over an array of items.
	 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
	 *     static attributes for the Element. These will only be set once when the
	 *     Element is created.
	 * @return {!Element} The corresponding Element.
	 */
	var coreElementOpen = function (tag, key, statics) {
	  nextNode();
	  alignWithDOM(tag, key, statics);
	  enterNode();
	  return (/** @type {!Element} */currentParent
	  );
	};
	
	/**
	 * Closes the currently open Element, removing any unvisited children if
	 * necessary.
	 *
	 * @return {!Element} The corresponding Element.
	 */
	var coreElementClose = function () {
	  if (false) {}
	
	  exitNode();
	  return (/** @type {!Element} */currentNode
	  );
	};
	
	/**
	 * Makes sure the current node is a Text node and creates a Text node if it is
	 * not.
	 *
	 * @return {!Text} The corresponding Text Node.
	 */
	var coreText = function () {
	  nextNode();
	  alignWithDOM('#text', null, null);
	  return (/** @type {!Text} */currentNode
	  );
	};
	
	/**
	 * Gets the current Element being patched.
	 * @return {!Element}
	 */
	var currentElement = function () {
	  if (false) {}
	  return (/** @type {!Element} */currentParent
	  );
	};
	
	/**
	 * Skips the children in a subtree, allowing an Element to be closed without
	 * clearing out the children.
	 */
	var skip = function () {
	  if (false) {}
	  currentNode = currentParent.lastChild;
	};
	
	/**
	 * The offset in the virtual element declaration where the attributes are
	 * specified.
	 * @const
	 */
	var ATTRIBUTES_OFFSET = 3;
	
	/**
	 * Builds an array of arguments for use with elementOpenStart, attr and
	 * elementOpenEnd.
	 * @const {Array<*>}
	 */
	var argsBuilder = [];
	
	/**
	 * @param {string} tag The element's tag.
	 * @param {?string=} key The key used to identify this element. This can be an
	 *     empty string, but performance may be better if a unique value is used
	 *     when iterating over an array of items.
	 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
	 *     static attributes for the Element. These will only be set once when the
	 *     Element is created.
	 * @param {...*} const_args Attribute name/value pairs of the dynamic attributes
	 *     for the Element.
	 * @return {!Element} The corresponding Element.
	 */
	var elementOpen = function (tag, key, statics, const_args) {
	  if (false) {}
	
	  var node = coreElementOpen(tag, key, statics);
	  var data = getData(node);
	
	  /*
	   * Checks to see if one or more attributes have changed for a given Element.
	   * When no attributes have changed, this is much faster than checking each
	   * individual argument. When attributes have changed, the overhead of this is
	   * minimal.
	   */
	  var attrsArr = data.attrsArr;
	  var newAttrs = data.newAttrs;
	  var attrsChanged = false;
	  var i = ATTRIBUTES_OFFSET;
	  var j = 0;
	
	  for (; i < arguments.length; i += 1, j += 1) {
	    if (attrsArr[j] !== arguments[i]) {
	      attrsChanged = true;
	      break;
	    }
	  }
	
	  for (; i < arguments.length; i += 1, j += 1) {
	    attrsArr[j] = arguments[i];
	  }
	
	  if (j < attrsArr.length) {
	    attrsChanged = true;
	    attrsArr.length = j;
	  }
	
	  /*
	   * Actually perform the attribute update.
	   */
	  if (attrsChanged) {
	    for (i = ATTRIBUTES_OFFSET; i < arguments.length; i += 2) {
	      newAttrs[arguments[i]] = arguments[i + 1];
	    }
	
	    for (var _attr in newAttrs) {
	      updateAttribute(node, _attr, newAttrs[_attr]);
	      newAttrs[_attr] = undefined;
	    }
	  }
	
	  return node;
	};
	
	/**
	 * Declares a virtual Element at the current location in the document. This
	 * corresponds to an opening tag and a elementClose tag is required. This is
	 * like elementOpen, but the attributes are defined using the attr function
	 * rather than being passed as arguments. Must be folllowed by 0 or more calls
	 * to attr, then a call to elementOpenEnd.
	 * @param {string} tag The element's tag.
	 * @param {?string=} key The key used to identify this element. This can be an
	 *     empty string, but performance may be better if a unique value is used
	 *     when iterating over an array of items.
	 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
	 *     static attributes for the Element. These will only be set once when the
	 *     Element is created.
	 */
	var elementOpenStart = function (tag, key, statics) {
	  if (false) {}
	
	  argsBuilder[0] = tag;
	  argsBuilder[1] = key;
	  argsBuilder[2] = statics;
	};
	
	/***
	 * Defines a virtual attribute at this point of the DOM. This is only valid
	 * when called between elementOpenStart and elementOpenEnd.
	 *
	 * @param {string} name
	 * @param {*} value
	 */
	var attr = function (name, value) {
	  if (false) {}
	
	  argsBuilder.push(name, value);
	};
	
	/**
	 * Closes an open tag started with elementOpenStart.
	 * @return {!Element} The corresponding Element.
	 */
	var elementOpenEnd = function () {
	  if (false) {}
	
	  var node = elementOpen.apply(null, argsBuilder);
	  argsBuilder.length = 0;
	  return node;
	};
	
	/**
	 * Closes an open virtual Element.
	 *
	 * @param {string} tag The element's tag.
	 * @return {!Element} The corresponding Element.
	 */
	var elementClose = function (tag) {
	  if (false) {}
	
	  var node = coreElementClose();
	
	  if (false) {}
	
	  return node;
	};
	
	/**
	 * Declares a virtual Element at the current location in the document that has
	 * no children.
	 * @param {string} tag The element's tag.
	 * @param {?string=} key The key used to identify this element. This can be an
	 *     empty string, but performance may be better if a unique value is used
	 *     when iterating over an array of items.
	 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
	 *     static attributes for the Element. These will only be set once when the
	 *     Element is created.
	 * @param {...*} const_args Attribute name/value pairs of the dynamic attributes
	 *     for the Element.
	 * @return {!Element} The corresponding Element.
	 */
	var elementVoid = function (tag, key, statics, const_args) {
	  elementOpen.apply(null, arguments);
	  return elementClose(tag);
	};
	
	/**
	 * Declares a virtual Element at the current location in the document that is a
	 * placeholder element. Children of this Element can be manually managed and
	 * will not be cleared by the library.
	 *
	 * A key must be specified to make sure that this node is correctly preserved
	 * across all conditionals.
	 *
	 * @param {string} tag The element's tag.
	 * @param {string} key The key used to identify this element.
	 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
	 *     static attributes for the Element. These will only be set once when the
	 *     Element is created.
	 * @param {...*} const_args Attribute name/value pairs of the dynamic attributes
	 *     for the Element.
	 * @return {!Element} The corresponding Element.
	 */
	var elementPlaceholder = function (tag, key, statics, const_args) {
	  if (false) {}
	
	  elementOpen.apply(null, arguments);
	  skip();
	  return elementClose(tag);
	};
	
	/**
	 * Declares a virtual Text at this point in the document.
	 *
	 * @param {string|number|boolean} value The value of the Text.
	 * @param {...(function((string|number|boolean)):string)} const_args
	 *     Functions to format the value which are called only when the value has
	 *     changed.
	 * @return {!Text} The corresponding text node.
	 */
	var text = function (value, const_args) {
	  if (false) {}
	
	  var node = coreText();
	  var data = getData(node);
	
	  if (data.text !== value) {
	    data.text = /** @type {string} */value;
	
	    var formatted = value;
	    for (var i = 1; i < arguments.length; i += 1) {
	      /*
	       * Call the formatter function directly to prevent leaking arguments.
	       * https://github.com/google/incremental-dom/pull/204#issuecomment-178223574
	       */
	      var fn = arguments[i];
	      formatted = fn(formatted);
	    }
	
	    node.data = formatted;
	  }
	
	  return node;
	};
	
	exports.patch = patchInner;
	exports.patchInner = patchInner;
	exports.patchOuter = patchOuter;
	exports.currentElement = currentElement;
	exports.skip = skip;
	exports.elementVoid = elementVoid;
	exports.elementOpenStart = elementOpenStart;
	exports.elementOpenEnd = elementOpenEnd;
	exports.elementOpen = elementOpen;
	exports.elementClose = elementClose;
	exports.elementPlaceholder = elementPlaceholder;
	exports.text = text;
	exports.attr = attr;
	exports.symbols = symbols;
	exports.attributes = attributes;
	exports.applyAttr = applyAttr;
	exports.applyProp = applyProp;
	exports.notifications = notifications;
	
	//# sourceMappingURL=incremental-dom-cjs.js.map

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	function hasClass(el, cname) {
	    return el.className ? el.className.match(new RegExp('(\\s|^)'+cname+'(\\s|$)')) : false;
	}
	
	function addClass(el, cnames) {
	    var classNames = cnames ? cnames.split(' ') : [];
	
	    classNames.forEach(function(cname){
	        if (!hasClass(el, cname)) {
	            el.className = el.className ? el.className + " " + cname : cname;
	        }
	    }, this);
	}
	
	function removeClass(el, cnames) {
	    var classNames = cnames ? cnames.split(' ') : [];
	
	    classNames.forEach(function(cname){
	        if (hasClass(el, cname)) {
	            el.className = el.className.replace(new RegExp('(\\s|^)'+cname+'(?=\\s|$)'),'');
	        }
	    }, this);
	}
	
	module.exports.hasClass = hasClass;
	module.exports.addClass = addClass;
	module.exports.removeClass = removeClass;

/***/ },
/* 9 */
/***/ function(module, exports) {

	var Config = {
	    // Specific RAD.js attributes to connect HTMLElement with its View
	    Attributes: {
	        ID: 'view-id',
	        ROLE: 'data-role'
	    },
	
	    // List of BaseView parameters which can be applied by passing as an options.
	    ViewOptions: ['key', 'propsModel', 'model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'],
	
	    // Internal Events used to communicate with modules
	    Events: {
	        REGISTER: 'register',
	        UNREGISTER: 'unregister',
	
	        ATTACH: 'attach',
	        DETACH: 'detach',
	
	        NODE_ATTACHED: 'nodeAdded',
	        NODE_REMOVED: 'nodeRemoved',
	
	        PATCH_START: 'patchStart',
	        PATCH_END:'patchEnd'
	    }
	};
	
	module.exports = Config;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var IncrementalDOM = __webpack_require__(7);
	var _ = __webpack_require__(1);
	var iTemplate = __webpack_require__(11);
	var binder = __webpack_require__(12);
	
	/**
	 *
	 * Compile ejs string into IncrementalDOM annotation. iTemplate used for compiling.
	 * @param {string} str - input EJS template string
	 *
	 * */
	
	function template(str) {
	    var templateFn = iTemplate.compile(str, null);
	
	    return function (data, content) {
	        return templateFn.call(this, data, IncrementalDOM, iTemplate.helpers, content, binder);
	    };
	}
	
	module.exports = template;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["itemplate"] = factory();
		else
			root["itemplate"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;
	
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};
	
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	
	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;
	
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	
	
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {
	
		var _options = __webpack_require__(1);
		var prepare = __webpack_require__(2);
		var Parser = __webpack_require__(3);
		var Builder = __webpack_require__(5);
	
		var wrapper = __webpack_require__(6).createWrapper();
		var builder = new Builder(wrapper);
		var parser = new Parser(builder);
	
		var helpers = {};
	
		var itemplate = {
		    compile: function (string, library, scopedHelpers, rootKeys) {
		        builder.reset();
		        builder.set(
		            Object.keys(helpers),
		            scopedHelpers ? Object.keys(scopedHelpers) : [],
		            rootKeys
		        );
		        wrapper.set(library, helpers, null, string);
		        return parser.parseComplete(prepare(string));
		    },
		    options: function (options) {
		        // mix options
		        for (var key in options) {
		            if (options.hasOwnProperty(key))
		                _options[key] = options[key];
		        }
		    },
		    registerHelper: function (name, fn) {
		        helpers[name] = fn;
		    },
		    unregisterHelper: function (name) {
		        delete helpers[name];
		    }
		};
	
		Object.defineProperty(itemplate, 'helpers', {
		    get: function () {
		        return helpers;
		    },
		    set: function () {
		    }
		});
	
		module.exports = itemplate;
	
	/***/ },
	/* 1 */
	/***/ function(module, exports) {
	
		var _options = {
		    BREAK_LINE: /(\r\n|\n|\r)\s{0,}/gm,
		    // prepare options
		    template: {
		        evaluate: /<%([\s\S]+?)%>/g,
		        interpolate: /<%=([\s\S]+?)%>/g,
		        escape: /<%-([\s\S]+?)%>/g
		    },
		    order: ['interpolate', 'escape', 'evaluate'],
		    evaluate: {
		        name: 'script',
		        open: '<script>',
		        close: '</script>'
		    },
		    accessory: {
		        open: '{%',
		        close: '%}'
		    },
		    escape: /(&amp;|&lt;|&gt;|&quot;)/g,
		    MAP: {
		        '&amp;': '&',
		        '&lt;': '<',
		        '&gt;': '>',
		        '&quot;': '"'
		    },
		    // build options
		    emptyString: true,
		    skipAttr: 'skip',
		    staticKey: 'key',
		    staticArray: 'static-array',
		    nonStaticAttributes: ['id', 'name', 'ref'],
		    binderPre: '::',
		    helperPre: 'i-',
		    parameterName: 'data',
		    parentParameterName: 'parent',
		    renderContentFnName: 'content',
		    // tags parse rules
		    textSaveTags: ['pre', 'code'],
		    voidRequireTags: ['input', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'keygen', 'link', 'meta',
		        'param', 'source', 'track', 'wbr'],
		    debug: false
		};
	
		module.exports = _options;
	
	/***/ },
	/* 2 */
	/***/ function(module, exports, __webpack_require__) {
	
		var _options = __webpack_require__(1);
	
		function replacer(match, p1) {
		    return _options.accessory.open + p1 + _options.accessory.close;
		}
	
		var methods = {
		    evaluate: function (string) {
		        return string.replace(_options.template.evaluate, function (match, p1) {
		            return _options.evaluate.open + p1.replace(_options.BREAK_LINE, ' ').trim() + _options.evaluate.close;
		        });
		    },
		    interpolate: function (string) {
		        return string.replace(_options.template.interpolate, replacer);
		    },
		    escape: function (string) {
		        return string.replace(_options.template.escape, replacer);
		    }
		};
	
		function prepare(string) {
		    var result = string;
		    for (var i = 0; i < _options.order.length; i++) {
		        result = methods[_options.order[i]](result);
		    }
		    return result;
		}
	
		module.exports = prepare;
	
	/***/ },
	/* 3 */
	/***/ function(module, exports, __webpack_require__) {
	
		var Mode = __webpack_require__(4);
	
		function Parser(builder) {
		    this._builder = builder;
		    this.reset();
		}
	
		//**Public**//
		Parser.prototype.reset = function () {
		    this._state = {
		        mode: Mode.Text,
		        pos: 0,
		        data: null,
		        pendingText: null,
		        pendingWrite: null,
		        lastTag: null,
		        isScript: false,
		        needData: false,
		        output: [],
		        done: false
		    };
		    this._builder.reset();
		};
	
		Parser.prototype.parseChunk = function (chunk) {
		    this._state.needData = false;
		    this._state.data = (this._state.data !== null) ? this._state.data.substr(this.pos) + chunk : chunk;
		    while (this._state.pos < this._state.data.length && !this._state.needData) {
		        this._parse(this._state);
		    }
		};
	
		Parser.prototype.parseComplete = function (data) {
		    this.reset();
		    this.parseChunk(data);
		    return this.done();
		};
	
		Parser.prototype.done = function () {
		    this._state.done = true;
		    this._parse(this._state);
		    this._flushWrite();
		    return this._builder.done();
		};
	
		//**Private**//
		Parser.prototype._parse = function () {
		    switch (this._state.mode) {
		        case Mode.Text:
		            return this._parseText(this._state);
		        case Mode.Tag:
		            return this._parseTag(this._state);
		        case Mode.Attr:
		            return this._parseAttr(this._state);
		        case Mode.CData:
		            return this._parseCData(this._state);
		        case Mode.Doctype:
		            return this._parseDoctype(this._state);
		        case Mode.Comment:
		            return this._parseComment(this._state);
		    }
		};
	
		Parser.prototype._writePending = function (node) {
		    if (!this._state.pendingWrite) {
		        this._state.pendingWrite = [];
		    }
		    this._state.pendingWrite.push(node);
		};
	
		Parser.prototype._flushWrite = function () {
		    if (this._state.pendingWrite) {
		        for (var i = 0, len = this._state.pendingWrite.length; i < len; i++) {
		            var node = this._state.pendingWrite[i];
		            this._builder.write(node);
		        }
		        this._state.pendingWrite = null;
		    }
		};
	
		Parser.prototype._write = function (node) {
		    this._flushWrite();
		    this._builder.write(node);
		};
	
		Parser._re_parseText_scriptClose = /<\s*\/\s*script/ig;
		Parser.prototype._parseText = function () {
		    var state = this._state;
		    var foundPos;
		    if (state.isScript) {
		        Parser._re_parseText_scriptClose.lastIndex = state.pos;
		        foundPos = Parser._re_parseText_scriptClose.exec(state.data);
		        foundPos = (foundPos) ? foundPos.index : -1;
		    } else {
		        foundPos = state.data.indexOf('<', state.pos);
		    }
		    var text = (foundPos === -1) ? state.data.substring(state.pos, state.data.length) : state.data.substring(state.pos, foundPos);
		    if (foundPos < 0 && state.done) {
		        foundPos = state.data.length;
		    }
		    if (foundPos < 0) {
		        if (state.isScript) {
		            state.needData = true;
		            return;
		        }
		        if (!state.pendingText) {
		            state.pendingText = [];
		        }
		        state.pendingText.push(state.data.substring(state.pos, state.data.length));
		        state.pos = state.data.length;
		    } else {
		        if (state.pendingText) {
		            state.pendingText.push(state.data.substring(state.pos, foundPos));
		            text = state.pendingText.join('');
		            state.pendingText = null;
		        } else {
		            text = state.data.substring(state.pos, foundPos);
		        }
		        if (text !== '') {
		            this._write({type: Mode.Text, data: text});
		        }
		        state.pos = foundPos + 1;
		        state.mode = Mode.Tag;
		    }
		};
	
		Parser.re_parseTag = /\s*(\/?)\s*([^\s>\/]+)(\s*)\??(>?)/g;
		Parser.prototype._parseTag = function () {
		    var state = this._state;
		    Parser.re_parseTag.lastIndex = state.pos;
		    var match = Parser.re_parseTag.exec(state.data);
	
		    if (match) {
		        if (!match[1] && match[2].substr(0, 3) === '!--') {
		            state.mode = Mode.Comment;
		            state.pos += 3;
		            return;
		        }
		        if (!match[1] && match[2].substr(0, 8) === '![CDATA[') {
		            state.mode = Mode.CData;
		            state.pos += 8;
		            return;
		        }
		        if (!match[1] && match[2].substr(0, 8) === '!DOCTYPE') {
		            state.mode = Mode.Doctype;
		            state.pos += 8;
		            return;
		        }
		        if (!state.done && (state.pos + match[0].length) === state.data.length) {
		            //We're at the and of the data, might be incomplete
		            state.needData = true;
		            return;
		        }
		        var raw;
		        if (match[4] === '>') {
		            state.mode = Mode.Text;
		            raw = match[0].substr(0, match[0].length - 1);
		        } else {
		            state.mode = Mode.Attr;
		            raw = match[0];
		        }
		        state.pos += match[0].length;
		        var tag = {type: Mode.Tag, name: match[1] + match[2], raw: raw, position: Parser.re_parseTag.lastIndex };
		        if (state.mode === Mode.Attr) {
		            state.lastTag = tag;
		        }
		        if (tag.name.toLowerCase() === 'script') {
		            state.isScript = true;
		        } else if (tag.name.toLowerCase() === '/script') {
		            state.isScript = false;
		        }
		        if (state.mode === Mode.Attr) {
		            this._writePending(tag);
		        } else {
		            this._write(tag);
		        }
		    } else {
		        state.needData = true;
		    }
		};
	
		Parser.re_parseAttr_findName = /\s*([^=<>\s'"\/]+)\s*/g;
		Parser.prototype._parseAttr_findName = function () {
		    // todo: parse {{ checked ? 'checked' : '' }} in input
		    Parser.re_parseAttr_findName.lastIndex = this._state.pos;
		    var match = Parser.re_parseAttr_findName.exec(this._state.data);
		    if (!match) {
		        return null;
		    }
		    if (this._state.pos + match[0].length !== Parser.re_parseAttr_findName.lastIndex) {
		        return null;
		    }
		    return {
		        match: match[0],
		        name: match[1]
		    };
		};
		Parser.re_parseAttr_findValue = /\s*=\s*(?:'([^']*)'|"([^"]*)"|([^'"\s\/>]+))\s*/g;
		Parser.re_parseAttr_findValue_last = /\s*=\s*['"]?(.*)$/g;
		Parser.prototype._parseAttr_findValue = function () {
		    var state = this._state;
		    Parser.re_parseAttr_findValue.lastIndex = state.pos;
		    var match = Parser.re_parseAttr_findValue.exec(state.data);
		    if (!match) {
		        if (!state.done) {
		            return null;
		        }
		        Parser.re_parseAttr_findValue_last.lastIndex = state.pos;
		        match = Parser.re_parseAttr_findValue_last.exec(state.data);
		        if (!match) {
		            return null;
		        }
		        return {
		            match: match[0],
		            value: (match[1] !== '') ? match[1] : null
		        };
		    }
		    if (state.pos + match[0].length !== Parser.re_parseAttr_findValue.lastIndex) {
		        return null;
		    }
		    return {
		        match: match[0],
		        value: match[1] || match[2] || match[3]
		    };
		};
		Parser.re_parseAttr_splitValue = /\s*=\s*['"]?/g;
		Parser.re_parseAttr_selfClose = /(\s*\/\s*)(>?)/g;
		Parser.prototype._parseAttr = function () {
		    var state = this._state;
		    var name_data = this._parseAttr_findName(state);
		    if (!name_data || name_data.name === '?') {
		        Parser.re_parseAttr_selfClose.lastIndex = state.pos;
		        var matchTrailingSlash = Parser.re_parseAttr_selfClose.exec(state.data);
		        if (matchTrailingSlash && matchTrailingSlash.index === state.pos) {
		            if (!state.done && !matchTrailingSlash[2] && state.pos + matchTrailingSlash[0].length === state.data.length) {
		                state.needData = true;
		                return;
		            }
		            state.lastTag.raw += matchTrailingSlash[1];
		            this._write({type: Mode.Tag, name: '/' + state.lastTag.name, raw: null});
		            state.pos += matchTrailingSlash[1].length;
		        }
		        var foundPos = state.data.indexOf('>', state.pos);
		        if (foundPos < 0) {
		            if (state.done) {
		                state.lastTag.raw += state.data.substr(state.pos);
		                state.pos = state.data.length;
		                return;
		            }
		            state.needData = true;
		        } else {
		            // state.lastTag = null;
		            state.pos = foundPos + 1;
		            state.mode = Mode.Text;
		        }
		        return;
		    }
		    if (!state.done && state.pos + name_data.match.length === state.data.length) {
		        state.needData = true;
		        return null;
		    }
		    state.pos += name_data.match.length;
		    var value_data = this._parseAttr_findValue(state);
		    if (value_data) {
		        if (!state.done && state.pos + value_data.match.length === state.data.length) {
		            state.needData = true;
		            state.pos -= name_data.match.length;
		            return;
		        }
		        state.pos += value_data.match.length;
		    } else {
		        if (state.data.indexOf(' ', state.pos - 1)) {
		            value_data = {
		                match: '',
		                value: null
		            };
	
		        } else {
		            Parser.re_parseAttr_splitValue.lastIndex = state.pos;
		            if (Parser.re_parseAttr_splitValue.exec(state.data)) {
		                state.needData = true;
		                state.pos -= name_data.match.length;
		                return;
		            }
		            value_data = {
		                match: '',
		                value: null
		            };
		        }
		    }
		    state.lastTag.raw += name_data.match + value_data.match;
	
		    this._writePending({type: Mode.Attr, name: name_data.name, data: value_data.value});
		};
	
		Parser.re_parseCData_findEnding = /\]{1,2}$/;
		Parser.prototype._parseCData = function () {
		    var state = this._state;
		    var foundPos = state.data.indexOf(']]>', state.pos);
		    if (foundPos < 0 && state.done) {
		        foundPos = state.data.length;
		    }
		    if (foundPos < 0) {
		        Parser.re_parseCData_findEnding.lastIndex = state.pos;
		        var matchPartialCDataEnd = Parser.re_parseCData_findEnding.exec(state.data);
		        if (matchPartialCDataEnd) {
		            state.needData = true;
		            return;
		        }
		        if (!state.pendingText) {
		            state.pendingText = [];
		        }
		        state.pendingText.push(state.data.substr(state.pos, state.data.length));
		        state.pos = state.data.length;
		        state.needData = true;
		    } else {
		        var text;
		        if (state.pendingText) {
		            state.pendingText.push(state.data.substring(state.pos, foundPos));
		            text = state.pendingText.join('');
		            state.pendingText = null;
		        } else {
		            text = state.data.substring(state.pos, foundPos);
		        }
		        this._write({type: Mode.CData, data: text});
		        state.mode = Mode.Text;
		        state.pos = foundPos + 3;
		    }
		};
	
		Parser.prototype._parseDoctype = function () {
		    var state = this._state;
		    var foundPos = state.data.indexOf('>', state.pos);
		    if (foundPos < 0 && state.done) {
		        foundPos = state.data.length;
		    }
		    if (foundPos < 0) {
		        Parser.re_parseCData_findEnding.lastIndex = state.pos;
		        if (!state.pendingText) {
		            state.pendingText = [];
		        }
		        state.pendingText.push(state.data.substr(state.pos, state.data.length));
		        state.pos = state.data.length;
		        state.needData = true;
		    } else {
		        var text;
		        if (state.pendingText) {
		            state.pendingText.push(state.data.substring(state.pos, foundPos));
		            text = state.pendingText.join('');
		            state.pendingText = null;
		        } else {
		            text = state.data.substring(state.pos, foundPos);
		        }
		        this._write({type: Mode.Doctype, data: text});
		        state.mode = Mode.Text;
		        state.pos = foundPos + 1;
		    }
		};
	
		Parser.re_parseComment_findEnding = /\-{1,2}$/;
		Parser.prototype._parseComment = function () {
		    var state = this._state;
		    var foundPos = state.data.indexOf('-->', state.pos);
		    if (foundPos < 0 && state.done) {
		        foundPos = state.data.length;
		    }
		    if (foundPos < 0) {
		        Parser.re_parseComment_findEnding.lastIndex = state.pos;
		        var matchPartialCommentEnd = Parser.re_parseComment_findEnding.exec(state.data);
		        if (matchPartialCommentEnd) {
		            state.needData = true;
		            return;
		        }
		        if (!state.pendingText) {
		            state.pendingText = [];
		        }
		        state.pendingText.push(state.data.substr(state.pos, state.data.length));
		        state.pos = state.data.length;
		        state.needData = true;
		    } else {
		        var text;
		        if (state.pendingText) {
		            state.pendingText.push(state.data.substring(state.pos, foundPos));
		            text = state.pendingText.join('');
		            state.pendingText = null;
		        } else {
		            text = state.data.substring(state.pos, foundPos);
		        }
	
		        this._write({type: Mode.Comment, data: text});
		        state.mode = Mode.Text;
		        state.pos = foundPos + 3;
		    }
		};
	
		module.exports = Parser;
	
	/***/ },
	/* 4 */
	/***/ function(module, exports) {
	
		var Mode = {
		    Text: 'text',
		    Tag: 'tag',
		    Attr: 'attr',
		    CData: 'cdata',
		    Doctype: 'doctype',
		    Comment: 'comment'
		};
	
		module.exports = Mode;
	
	/***/ },
	/* 5 */
	/***/ function(module, exports, __webpack_require__) {
	
		/* private */
		var _options = __webpack_require__(1);
		var Mode = __webpack_require__(4);
		var Command = __webpack_require__(6).Command;
	
		var state; // current builder state
		var stack; // result builder
		var staticArraysHolder = {}; // holder for static arrays
		var wrapper; // external wrapper functionality
		var helpers; // keys for helpers
		var localComponentNames = []; // keys for local helpers
	
		var empty = '', quote = '"', comma = ', "', removable = '-%%&&##__II-'; // auxiliary
	
		var nestingLevelInfo = {level: 0, skip: []};
	
		function isRootNode() {
		    return nestingLevelInfo.level === 0;
		}
	
		function makeKey() {
		    var text = new Array(12), possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgijklmnopqrstuvwxyz';
		    for (var i = 0; i < 12; i++)
		        text.push(possible.charAt(Math.floor(Math.random() * possible.length)));
	
		    return text.join(empty);
		}
	
		function decodeAccessory(string, force) {
		    var regex = new RegExp(_options.accessory.open + '|' + _options.accessory.close, 'g');
		    var code;
		    var isStatic = true, openStub, closeStub;
	
		    if (string !== undefined)
		        code = string.split(regex).map(function (piece, i) {
		            openStub = '';
		            closeStub = '';
	
		            if (i % 2) {
		                isStatic = false;
		                piece = piece.trim();
		                if (_options.emptyString && !force) { // undefined as empty string
		                    if (piece.indexOf(' ') !== -1) {
		                        openStub = '(';
		                        closeStub = ')';
		                    }
		                    return ' + (' + openStub + piece + closeStub + ' === undefined ? "" : '
		                        + openStub + piece + closeStub + ') + ';
		                } else
		                    return ' + ' + piece + ' + ';
		            } else {
		                return JSON.stringify(piece);
		            }
		        }).join('');
		    else
		        code = '""';
	
		    // micro-optimizations (remove appending empty strings)
		    code = code.replace(/^"" \+ | \+ ""$/g, '').replace(/ \+ "" \+ /g, ' + ');
	
		    return {value: code, isStatic: isStatic};
		}
	
		function formatText(text) {
		    return text.trim()
		        .replace(/&#(\d+);/g, function (match, dec) {
		            return String.fromCharCode(dec);
		        })
		        .replace(_options.escape, function (m) {
		            return _options.MAP[m];
		        });
		}
	
		function prepareKey(command, attributes, useKeyCommand) {
		    var result = empty, decode, stub;
		    if ((command === Command.elementOpen || command === Command.elementVoid)) {
	
		        if (attributes && attributes.hasOwnProperty(_options.staticKey)) {
		            decode = decodeAccessory(attributes[_options.staticKey] || makeKey());
		            delete attributes[_options.staticKey];
		        } else if (useKeyCommand) {
		            decode = {value: Command.getKey};
		        } else {
		            decode = {value: 'null'};
		        }
		        stub = (Object.keys(attributes).length > 0) ? ', ' : empty;
		        result = ', ' + decode.value + stub;
		    }
		    return result;
		}
	
		function prepareAttr(command, attributes) {
		    var result = empty, attr, decode, arrayStaticKey = false, isSkipped = false, skipCommand;
		    if ((command === Command.elementOpen || command === Command.elementVoid) && Object.keys(attributes).length > 0) {
		        if (attributes && attributes.hasOwnProperty(_options.staticArray)) {
		            arrayStaticKey = attributes[_options.staticArray] || makeKey();
		            staticArraysHolder[arrayStaticKey] = staticArraysHolder[arrayStaticKey] || {};
		            delete attributes[_options.staticArray];
		        }
	
		        if (attributes && attributes.hasOwnProperty(_options.skipAttr)) {
		            isSkipped = true;
		            skipCommand = Command.startSkipContent(decodeAccessory(attributes[_options.skipAttr], true).value);
		            delete attributes[_options.skipAttr];
		        }
	
		        result = arrayStaticKey || null;
		        for (var key in attributes) {
		            attr = attributes[key];
		            attr = (attr === null) ? key : ((attr === undefined) ? '' : attr);
		            decode = decodeAccessory(attr);
		            if (decode.isStatic && (_options.nonStaticAttributes.indexOf(key) === -1)) {
		                if (arrayStaticKey) {
		                    var value = formatText(attr);
		                    if (!staticArraysHolder[arrayStaticKey].hasOwnProperty(key)) {
		                        staticArraysHolder[arrayStaticKey][key] = value;
		                    } else if (staticArraysHolder[arrayStaticKey][key] !== value) {
		                        staticArraysHolder[arrayStaticKey][key] = removable;
		                        result += comma + key + '", "' + value + quote;
		                    }
		                } else
		                    result += comma + key + '", "' + formatText(attr) + quote;
		            } else {
		                result += comma + key + '", ' + formatText(decode.value);
		            }
		        }
		    }
		    return {value: result, isSkipped: isSkipped, skip: skipCommand};
		}
	
		function unwrapStaticArrays(holder) {
		    var result = {}, obj, key;
		    for (var arrayName in holder) {
		        obj = holder[arrayName];
		        result[arrayName] = [];
	
		        for (key in obj)
		            if (obj[key] !== removable)
		                result[arrayName].push(quote + key + quote, quote + obj[key] + quote);
		    }
	
		    return result;
		}
	
		function decodeAttrs(obj) {
		    var result = ['{'];
		    for (var key in obj)
		        result.push(((result.length > 1) ? ',' : empty) + '\'' + key + '\'' + ':' + decodeAccessory(obj[key], true).value);
		    result.push('}');
	
		    return result.join(empty);
		}
	
		function camelCase(input) {
		    return input.replace(/\s/g, '').replace(/-(.)/g, function (match, group1) {
		        return group1.toUpperCase();
		    });
		}
	
		function writeCommand(command, tag, attributes) {
		    if (attributes && attributes.ref) {
		        var refName = attributes.ref;
		        delete attributes.ref;
		    }
	
		    var strKey = prepareKey(command, attributes);
		    var strAttrs = prepareAttr(command, attributes);
	
		    if (refName) {
		        // i.e. ref[refName] = elementOpen(...)
		        command = Command.saveRef(camelCase(decodeAccessory(refName, true).value), command);
		    }
	
		    stack.push(command + tag + quote + strKey + strAttrs.value + Command.close);
	
		    // save skipped
		    if (strAttrs.isSkipped) {
		        stack.push(strAttrs.skip);
		        nestingLevelInfo.skip.push(nestingLevelInfo.level);
		    }
		}
	
		function writeText(text) {
		    text = formatText(text);
		    if (text.length > 0) {
		        var decode = decodeAccessory(text);
		        stack.push(Command.text + decode.value + Command.close);
		    }
		}
	
		function helperOpen(helperName, attrs) {
		    stack.push(Command.helpers + '["' + helperName + '"](' + decodeAttrs(attrs) + ', function (' 
		        + _options.parentParameterName + '){');
		}
	
		function helperClose() {
		    stack.push('}.bind(this));');
		}
	
		function isHelperTag(tagName) {
		    return localComponentNames.indexOf(tagName) !== -1 
		        || helpers.indexOf(tagName) !== -1
		        || tagName.indexOf(_options.helperPre) === 0;
		}
	
		function binderOpen(helperName, attrs) {
		    var fnName = helperName.replace(_options.binderPre, '');
		    stack.push(Command.binder + '(' + fnName + ',' + decodeAttrs(attrs) + ', function (' 
		        + _options.parentParameterName + '){');
		}
	
		function binderClose() {
		    stack.push('}.bind(this));');
		}
	
		function isTagBinded(tagName) {
		    return tagName.indexOf(_options.binderPre) === 0;
		}
	
		// TODO: Clarify logic.
		// Seems like this method only opens state but named as 'CloseOpenState'
		// also seems like `isClosed` flags used only to detect elementVoid and it's a bit confusing
		// because sounds like it can be used to detect tags open or close state.
		function writeAndCloseOpenState(isClosed) {
		    var isShouldClose = true;
	
		    if (state.tag) {
		        var isRoot = isRootNode();
	
		        if (isHelperTag(state.tag)) { // helper case
		            helperOpen(state.tag, state.attributes);
		            isShouldClose = isClosed;
		        } else if (isTagBinded(state.tag)) {
		            binderOpen(state.tag, state.attributes);
		            isShouldClose = isClosed;
		        } else if (isClosed || _options.voidRequireTags.indexOf(state.tag) !== -1) { // void mode
		            writeCommand(Command.elementVoid, state.tag, state.attributes, isRoot);
		            nestingLevelInfo.level--;
		            isShouldClose = false;
		        } else if (state.tag !== _options.evaluate.name) { // standard mode
		            writeCommand(Command.elementOpen, state.tag, state.attributes, isRoot);
		        } // if we write code, do nothing
	
		        nestingLevelInfo.level++;
		    }
	
		    // clear builder state for next tag
		    state.tag = null;
		    state.attributes = {};
	
		    return isShouldClose; // should we close this tag: no if we have void element
		}
	
		/* public */
		function Builder(functionWrapper) {
		    wrapper = functionWrapper;
		    this.reset();
		}
	
		Builder.prototype.reset = function () {
		    stack = [];
		    state = {
		        tag: null,
		        attributes: {}
		    };
		    staticArraysHolder = {};
		    nestingLevelInfo = {level: 0, skip: []};
		};
	
		Builder.prototype.set = function (helpersKeys, localNames) {
		    helpers = helpersKeys;
		    localComponentNames = localNames || [];
		};
	
		Builder.prototype.write = function (command) {
		    var tag;
		    switch (command.type) {
		        case Mode.Tag:
		            tag = command.name.replace('/', empty);
	
		            if (command.name.indexOf('/') === 0) {
	
		                // close tag case
		                if (writeAndCloseOpenState(true) && tag !== _options.evaluate.name) {
		                    nestingLevelInfo.level--;
	
		                    // write end skip functionality
		                    if (nestingLevelInfo.level === nestingLevelInfo.skip[nestingLevelInfo.skip.length - 1]) {
		                        stack.push(Command.endSkipContent);
		                        nestingLevelInfo.skip.pop();
		                    }
	
		                    if (isHelperTag(tag))
		                        helperClose();
		                    else if (isTagBinded(tag))
		                        binderClose();
		                    else
		                        writeCommand(Command.elementClose, tag);
		                }
		            } else {
		                // open tag case
		                writeAndCloseOpenState();
		                state.tag = tag;
		                state.attributes = {};
		            }
		            break;
		        case Mode.Attr: // push attribute in state
		            state.attributes[command.name] = command.data;
		            break;
		        case Mode.Text: // write text
		            tag = state.tag;
		            writeAndCloseOpenState();
		            if (tag === _options.evaluate.name) { // write code
		                stack.push(formatText(command.data));
		            } else {
		                writeText(command.data);
		            }
		            break;
		        case Mode.Comment: // write comments only in debug mode
		            if (_options.debug)
		                stack.push('\n// ' + command.data.replace(_options.BREAK_LINE, ' ') + '\n');
		            break;
		    }
		};
	
		Builder.prototype.done = function () {
		    return wrapper(stack, unwrapStaticArrays(staticArraysHolder));
		};
	
		module.exports = Builder;
	
	/***/ },
	/* 6 */
	/***/ function(module, exports, __webpack_require__) {
	
		var _options = __webpack_require__(1);
	
		var Command = { // incremental DOM commands
		    helpers: '_h',
		    binder: '_b',
		    elementOpen: '_o("',
		    elementClose: '_c("',
		    elementVoid: '_v("',
		    saveRef: function (name, command) {
		        return '_r[' + name + '] = ' + command;
		    },
		    text: '_t(',
		    close: ');\n',
		    startSkipContent: function (flag) {
		        // compile static values
		        flag = (flag === '"false"') ? false : flag;
		        flag = (flag === '"true"') ? true : flag;
	
		        return 'if(' + flag + '){_l.skip();}else{';
		    },
		    endSkipContent: '}'
		};
	
		function createWrapper() {
		    var _library, _helpers, _fnName, _template;
		    var glue = '';
		    var eol = '\n';
	
		    function wrapFn(body) {
		        var returnValue = eol + ' return _r;';
	
		        var prepareError = 'var TE=function(m,n,o){this.original=o;this.name=n;(o)?this.stack=this.original.stack:' +
		            'this.stack=null;this.message=o.message+m;};var CE=function(){};CE.prototype=Error.prototype;' +
		            'TE.prototype=new CE();TE.prototype.constructor=TE;';
	
		        if (_options.debug) {
		            return 'try {'
		                + body +
		                '} catch (err) {'
		                + prepareError +
		                'throw new TE(' + JSON.stringify(_template) + ', err.name, err);' +
		                '}'
		                + returnValue;
		        }
		        return body + returnValue;
		    }
	
		    function wrapper(stack, holder) {
		        var resultFn;
		        var variables = [
		                'var _o = _l.elementOpen;',
		                'var _c = _l.elementClose;',
		                'var _v = _l.elementVoid;',
		                'var _t = _l.text;',
		                'var _r = {};',
		                '_b = _b || function(fn, data, content){ return fn(data, content); };'
		            ].join(eol) + eol;
	
		        for (var key in holder) { // collect static arrays for function
		            if (holder.hasOwnProperty(key))
		                variables += 'var ' + key + '=[' + holder[key] + '];';
		        }
		        var body = variables + wrapFn(stack.join(glue));
	
		        if (_library) {
		            body = 'return function(' + _options.parameterName + ', ' + _options.renderContentFnName + ', _b){' + body + '};';
		            resultFn = (new Function('_l', '_h', body))(_library, _helpers);
		        } else {
		            resultFn = new Function(_options.parameterName, '_l', '_h', _options.renderContentFnName, '_b', body);
		        }
		        return resultFn;
		    }
	
		    wrapper.set = function (library, helpers, fnName, template) {
		        _library = library;
		        _helpers = helpers;
		        _fnName = fnName;
		        _template = template;
		    };
	
		    return wrapper;
		}
	
		module.exports = {
		    createWrapper: createWrapper,
		    Command: Command
		};
	
	/***/ }
	/******/ ])
	});
	;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _ = __webpack_require__(1);
	var core = __webpack_require__(13);
	var Config = __webpack_require__(9);
	
	function binder(component, props, content) {
	
	    var BaseView = __webpack_require__(14);
	    
	    props = props || {};
	    props.key = props.key || props.id;
	
	    // If BaseView instance was passed
	    if (component instanceof BaseView) {
	        component.props.set(_.omit(props, Config.ViewOptions), {silent:true});
	        return component.render();
	    }
	
	    // If component with passed key already registered
	    var registrationId = 'view-key-' + props.key;
	    var registeredComponent = core.get( registrationId );
	
	    if (registeredComponent) {
	        registeredComponent.props.set(_.omit(props, Config.ViewOptions), {silent:true});
	        return registeredComponent.render();
	    }
	
	    // If new component was passed
	    var newComponent = _.isFunction(component) ? new component(props, content) : component;
	    if (newComponent instanceof BaseView) {
	        return newComponent.render();
	    }
	
	    return newComponent;
	}
	
	module.exports = binder;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var _ = __webpack_require__(1);
	var Dispatcher = __webpack_require__(6);
	var InternalEvents = __webpack_require__(9).Events;
	
	var modules = {};
	
	var defaults = {
	    debug: false,
	    parameterName: 'data',
	    viewAttributes: {
	        'data-role': 'view'
	    }
	};
	
	function Core(Dispatcher) {
	    this.options = defaults;
	
	    Dispatcher.subscribe(InternalEvents.REGISTER, this.register, this);
	    Dispatcher.subscribe(InternalEvents.UNREGISTER, this.unregister, this);
	}
	
	
	/**
	 *  Override RAD.js default settings
	 *
	 *  @param {Object} options
	 *  @param {string} [options.parameterName = model] - Sets the name of the argument to be passed to the template function.
	 *  @param {boolean} [options.debug = false]        - Enable console logging
	 */
	Core.prototype.setOptions = function(options) {
	    _.extend(this.options, options);
	};
	
	Core.prototype.get = function (id) {
	    return modules[id];
	};
	
	Core.prototype.getAll = function () {
	    return _.clone(modules);
	};
	
	Core.prototype.register = function (id, obj) {
	    if (modules[id]) {
	        throw new Error('Such module ID: '+id+' already registered');
	    }
	    modules[id] = obj;
	};
	
	Core.prototype.unregister = function (id) {
	    if (modules[id]) {
	        delete modules[id];
	    }
	};
	
	
	module.exports = new Core( Dispatcher );
	
	


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _ = __webpack_require__(1);
	var Backbone = __webpack_require__(5);
	
	var IncrementalDOM = __webpack_require__(4);
	var Dispatcher = __webpack_require__(6);
	var Config = __webpack_require__(9);
	var Events = Config.Events;
	var Core = __webpack_require__(13);
	var defaultAttributes = Core.options.viewAttributes;
	var register = Core.register;
	var unregister = Core.unregister;
	
	function isRendering() {
	    return !!IncrementalDOM.currentElement();
	}
	
	function makeId(options) {
	    if (options && options.key) {
	        return 'view-key-' + options.key;
	    }
	    return _.result(options, 'id', _.uniqueId('view-'));
	}
	
	function compileTemplate(template) {
	    return typeof template === 'string' ? RAD.template(template) : template;
	}
	
	function hasKey(node) {
	    return node.__incrementalDOMData && node.__incrementalDOMData.key;
	}
	
	var BaseView = function(options) {
	    this.viewId = makeId(options);
	    this.refs = {};
	
	    var Props = this.propsModel || Backbone.Model;
	    this.props = new Props( _.omit(options, Config.ViewOptions) );
	
	    this._bindChannels();
	    Backbone.View.apply(this, arguments);
	    this.template = compileTemplate(this.template);
	    this.bindRender(this.props, 'change');
	
	    register(this.getID(), this);
	};
	
	BaseView.prototype = _.create(Backbone.View.prototype, {
	    _bindChannels: function() {
	        var id = this.getID();
	        var attachMsg = id + ':' + Events.ATTACH;
	        var detachMsg = id + ':' + Events.DETACH;
	
	        this.subscribe(id, this.onReceiveMsg, this);
	        this.subscribe(attachMsg, this.onAttach, this);
	        this.subscribe(detachMsg, this.onDetach, this);
	
	        if (isRendering()) {
	            this.subscribe(detachMsg, this.destroy, this);
	        }
	    },
	
	    setElement: function(el) {
	        var $el = el instanceof Backbone.$ ? el : Backbone.$(el);
	        var viewId = $el.attr(Config.Attributes.ID);
	
	        if (viewId && viewId !== this.getID()) {
	            throw new Error('You cannot setElement which is used by another View.');
	        } else {
	            Backbone.View.prototype.setElement.call(this, $el);
	        }
	    },
	
	    getID: function() {
	        return this.viewId;
	    },
	
	    getTemplateData: function() {
	        return {
	            collection: this.collection && this.collection.toJSON(),
	            model: this.model && this.model.toJSON(),
	            props: this.props.toJSON()
	        };
	    },
	
	    bindRender: function(target, events) {
	        this.listenTo(target, events, this.render);
	    },
	
	    render: function () {
	        if (isRendering()) {
	            this._render();
	        } else {
	            this._renderOuter();
	        }
	        return this;
	    },
	
	    _renderOuter: function() {
	        var self = this;
	        IncrementalDOM.patchOuter(this.el, function() {
	            if (hasKey(self.el)) {
	                self._render();
	            } else {
	                self.el.setAttribute('key', self.getID());
	                self._render();
	                self.el.removeAttribute('key');
	            }
	        });
	        return this;
	    },
	
	    _render: function () {
	        if (this.onBeforeRender() === false) {
	            return this._skip();
	        }
	
	        this._viewElOpen();
	        this._renderTemplate();
	        this._viewElClose();
	
	        this.onRender();
	        return this;
	    },
	
	    _renderTemplate: function() {
	        if (typeof this.template === 'function') {
	            this.refs = this.template(this.getTemplateData());
	        } else {
	            IncrementalDOM.skip();
	        }
	    },
	
	    _skip: function() {
	        this._viewElOpen();
	        IncrementalDOM.skip();
	        this._viewElClose();
	        return this;
	    },
	    _viewElOpen: function () {
	        IncrementalDOM.elementOpenStart(this.el.tagName.toLowerCase(), this.getID());
	        this._setElAttributes();
	        IncrementalDOM.elementOpenEnd();
	    },
	    _viewElClose: function () {
	        var el = IncrementalDOM.elementClose(this.el.tagName.toLowerCase());
	        if (this.el !== el) {
	            this.setElement(el);
	        }
	    },
	    _setElAttributes: function() {
	        var attributes = _.extend({}, defaultAttributes, _.result(this, 'attributes', {}));
	        attributes.id = _.result(this, 'id');
	        attributes.class = _.result(this, 'className');
	        attributes[Config.Attributes.ID] = this.getID();
	
	        _.each(attributes, function (value, name) {
	            IncrementalDOM.attr(name, value);
	        });
	    },
	
	    _removeElement: function () {
	        this.$el.remove();
	        this.publish(Events.NODE_REMOVED, this.el);
	        return this;
	    },
	
	    destroy: function () {
	        this.unsubscribe(null, null, this);
	        unregister(this.getID());
	
	        this.remove();
	        this.onDestroy();
	
	        this.off();
	        this.undelegateEvents();
	    },
	    subscribe: function(channel, callback, context) {
	        return Dispatcher.subscribe(channel, callback, context || this);
	    },
	    unsubscribe: function(channel, callback, context) {
	        return Dispatcher.unsubscribe(channel, callback, context || this);
	    },
	    publish: function() {
	        return Dispatcher.publish.apply(Dispatcher, arguments);
	    }
	});
	
	_.extend(BaseView.prototype, {
	    onReceiveMsg:   function () {},
	    onBeforeRender: function () {},
	    onRender:       function () {},
	    onAttach:       function () {},
	    onDetach:       function () {},
	    onDestroy:      function () {}
	});
	
	BaseView.extend = function(protoProps, staticProps) {
	    return Backbone.View.extend.apply(this, arguments)
	};
	
	module.exports = BaseView;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(1);
	var IDOM_DATA = '__incrementalDOMData';
	var RENDER_DATA = '__renderData';
	
	
	function getNodeData(el) {
	    return el[IDOM_DATA];
	}
	
	function setRenderData(node, options) {
	    if (!node[RENDER_DATA]) {
	        node[RENDER_DATA] = {};
	    }
	    return _.extend(node[RENDER_DATA], options);
	}
	
	function getRenderData(node) {
	    return node[RENDER_DATA] || setRenderData(node, {});
	}
	
	function toArray(args, startIndex) {
	    return Array.prototype.slice.call(args, startIndex || 0);
	}
	
	module.exports = {
	    getNodeData: getNodeData,
	    getRenderData: getRenderData,
	    setRenderData: setRenderData,
	    toArray: toArray
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(1);
	var publish = __webpack_require__(6).publish;
	var iDOM = __webpack_require__(4);
	var Events = __webpack_require__(9).Events;
	var utils = __webpack_require__(15);
	var transition = __webpack_require__(17);
	var initTransitionOptions = __webpack_require__(21);
	
	var RenderStatus = {
	    ENTER: 'enter',
	    LEAVE: 'leave',
	    DONE: 'done'
	};
	
	var isPlaceholder = false;
	
	function createPlaceholder(node) {
	    var key = utils.getNodeData(node).key;
	    var tagName = node.tagName.toLowerCase();
	    isPlaceholder = true;
	    iDOM.elementOpen.apply(null, [tagName, key, null].concat( utils.getNodeData(node).attrsArr ));
	    iDOM.skip();
	    iDOM.elementClose(tagName);
	    isPlaceholder = false;
	}
	
	function alignContent(children, position, key) {
	    var length = children.length;
	    var node = children[position];
	
	    while (position < length && node && utils.getNodeData(node).key !== key) {
	        createPlaceholder(node);
	        node = children[++position];
	    }
	
	    return position;
	}
	
	function renderStart(renderData) {
	    var position = renderData.position;
	    var children = renderData.children;
	    var keyMap = renderData.keyMap;
	    var level = 0;
	    var childLevel = 1;
	    var isNewChild = false;
	
	    function beforeCreate(tagName, key) {
	        if (isPlaceholder) {
	            return;
	        }
	
	        var isChild = (++level) === childLevel;
	        isNewChild = false;
	
	        if (isChild) {
	            // Check if opened Element is already present in the list.
	            if (keyMap[key]) {
	                // If so then align its position with current content and return new position
	                position = alignContent(children, position, key);
	            } else {
	                isNewChild = true;
	            }
	            position++;
	        }
	    }
	    function afterCreate(tagName, key) {
	        if (isPlaceholder) {
	            return;
	        }
	
	        var isChild = level === childLevel;
	        var node = iDOM.currentElement();
	
	        if (isChild) {
	            renderData.keysRendered[key] = node;
	        }
	        if (isNewChild) {
	            children.splice(position - 1, 0, node);
	            keyMap[key] = node;
	            renderData.keysToShow[key] = node;
	        }
	
	        renderData.position = position;
	    }
	
	    iDOM.events.on('elementOpen:before', beforeCreate, renderData);
	    iDOM.events.on('elementOpen:after', afterCreate, renderData);
	    iDOM.events.on('elementClose:after', function() {
	        if (!isPlaceholder) {
	            level--;
	        }
	    }, renderData);
	
	    var elementOpenKey;
	    iDOM.events.on('elementOpenStart:before', function(tagName, key) {
	        if (!isPlaceholder) {
	            elementOpenKey = key;
	            beforeCreate(tagName, key);
	        }
	    }, renderData);
	
	    iDOM.events.on('elementOpenEnd:after', function(tagName, key) {
	        if (!isPlaceholder) {
	            afterCreate(tagName, elementOpenKey);
	        }
	    }, renderData);
	}
	
	function renderStop(renderData) {
	    iDOM.events.off(null, null, renderData);
	
	    alignContent(renderData.children, renderData.position);
	}
	
	function doTransition(renderData, runner) {
	    var rootEl = renderData.rootEl;
	    var activeKeys = utils.getNodeData(rootEl).keyMap;
	    var transitionOptions = initTransitionOptions(renderData.attrs);
	    var children = Array.prototype.slice.call(rootEl.children);
	
	    if (!renderData.applyAnimation) {
	        transitionOptions.enterTimeout = transitionOptions.leaveTimeout = 0;
	    }
	
	    _.each(children, function(node) {
	        var key = utils.getNodeData(node).key;
	        var render = utils.getRenderData(node);
	
	        if (!renderData.keysRendered[key]) {
	            if (render.status !== RenderStatus.LEAVE) {
	                render.status = RenderStatus.LEAVE;
	                transition.leave(node, transitionOptions, function() {
	                    render.status = RenderStatus.DONE;
	                    delete activeKeys[key];
	                    publish(Events.NODE_REMOVED, node, runner);
	                }, runner);
	           }
	        } else if (renderData.keysToShow[key] || render.status === RenderStatus.LEAVE) {
	            if (render.status !== RenderStatus.ENTER) {
	            render.status = RenderStatus.ENTER;
	                transition.enter(node, transitionOptions, function () {
	                    render.status = RenderStatus.DONE;
	                }, runner);
	            }
	        }
	    });
	}
	
	module.exports = {
	    start: renderStart,
	    stop: renderStop,
	    doTransition: doTransition
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var AnimationEnd = __webpack_require__(18);
	var TransitionEnd = __webpack_require__(19);
	var utilsDOM = __webpack_require__(8);
	var sep = ' ';
	
	function clearTransitionTimeout(node) {
	    if (node.__transitionId) {
	        clearTimeout(node.__transitionId);
	        node.__transitionId = null;
	    }
	}
	
	function setTransitionTimeout(node, cb, timeout) {
	    node.__transitionId = setTimeout(function () {
	        cb(node);
	    }, timeout);
	}
	
	function hasActiveTransition(node) {
	    return node.__transitionId && node.stopActiveTransition;
	}
	
	function transition(node, options, timeout, callback) {
	    var transitionEnd = new TransitionEnd(node);
	    var animationEnd = new AnimationEnd(node);
	    var triggers = [
	        options.animationEnter,
	        options.animationLeave,
	        options.enterClass,
	        options.leaveClass,
	        options.activeClass
	    ].join(sep);
	
	    node.stopActiveTransition = function () {
	        clearTransitionTimeout(node);
	        transitionEnd.unbindAll();
	        animationEnd.unbindAll();
	        utilsDOM.removeClass(node, triggers);
	    };
	
	    function done() {
	        node.stopActiveTransition();
	        callback && callback(node);
	    }
	
	    function onTransitionEnd(e) {
	        if (e.target === node) {
	            done();
	        }
	    }
	
	    // handle both animation and transition
	    transitionEnd.bind(onTransitionEnd);
	    animationEnd.bind(onTransitionEnd);
	
	    if (!timeout) {
	        return done();
	    }
	
	    setTransitionTimeout(node, done, timeout);
	
	    // Run transition
	    utilsDOM.addClass(node, options.activeClass);
	}
	
	function transitionLeave(node, options, callback, runner) {
	    if (hasActiveTransition(node)) {
	        node.stopActiveTransition();
	    }
	
	    utilsDOM.addClass(node, [options.leaveClass].join(sep));
	    utilsDOM.removeClass(node, options.enterClass);
	
	    runner.push(function () {
	        utilsDOM.addClass(node, [options.animationLeave].join(sep));
	        transition(node, options, options.leaveTimeout, function (node) {
	            node.parentNode && node.parentNode.removeChild(node);
	            callback && callback();
	        });
	    });
	}
	
	function transitionEnter(node, options, callback, runner) {
	    if (hasActiveTransition(node)) {
	        node.stopActiveTransition();
	    }
	
	    utilsDOM.addClass(node, [options.enterClass].join(sep));
	    utilsDOM.removeClass(node, options.leaveClass);
	
	    runner.push(function () {
	        utilsDOM.addClass(node, [options.animationEnter].join(sep));
	        transition(node, options, options.enterTimeout, callback);
	    });
	}
	
	module.exports.enter = transitionEnter;
	module.exports.leave = transitionLeave;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var TransitionEnd = __webpack_require__(19);
	var whichCssEvent = __webpack_require__(20);
	var ANIMATION_DATA = '__animationData';
	
	function AnimationEnd(el) {
	    TransitionEnd.call(this, el);
	}
	
	AnimationEnd.prototype = Object.create(TransitionEnd.prototype);
	AnimationEnd.prototype.constructor = AnimationEnd;
	
	AnimationEnd.prototype._initData = function() {
	    this.el[ANIMATION_DATA] = {
	        eventName: whichCssEvent({
	            "animation"      : "animationend",
	            "MozAnimation"   : "animationend",
	            "WebkitAnimation": "webkitAnimationEnd"
	        }),
	        callbacks: []
	    };
	};
	
	AnimationEnd.prototype._getData = function() {
	    return this.el[ANIMATION_DATA];
	};
	
	module.exports = AnimationEnd;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var whichCssEvent = __webpack_require__(20);
	var TRANSITION_DATA = '__transitionData';
	
	function TransitionEnd(el) {
	    this.el = el && (el[0] || el);
	
	    if (!(this.el instanceof HTMLElement)) {
	        throw new Error('HTMLElement must be passed as an argument');
	    }
	
	    if (!this._getData()) {
	        this._initData();
	    }
	}
	
	TransitionEnd.prototype._initData = function() {
	    this.el[TRANSITION_DATA] = {
	        eventName: whichCssEvent({
	            'transition'      :'transitionend',
	            'MozTransition'   :'transitionend',
	            'WebkitTransition':'webkitTransitionEnd'
	        }),
	        callbacks: []
	    };
	};
	
	TransitionEnd.prototype._getData = function() {
	    return this.el[TRANSITION_DATA];
	};
	
	TransitionEnd.prototype.bind = function(fn) {
	    var data = this._getData();
	
	    if (data.callbacks.indexOf(fn) === -1) {
	        data.callbacks.push(fn);
	        this.el.addEventListener(data.eventName, fn, false);
	    }
	};
	
	TransitionEnd.prototype.unbind = function(fn) {
	    var data = this._getData(),
	        index = data.callbacks.indexOf(fn);
	
	    if (index !== -1) {
	        data.callbacks.splice(index, 1);
	        this.el.removeEventListener(data.eventName, fn, false);
	    }
	};
	
	TransitionEnd.prototype.unbindAll = function() {
	    this._getData().callbacks.forEach(this.unbind, this);
	};
	
	
	module.exports = TransitionEnd;

/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function whichCssEvents(eventsMap) {
	    var name,
	        testEl = document.createElement("xelement");
	
	    for (name in eventsMap){
	        if (testEl.style[name] !== undefined) {
	            return eventsMap[name];
	        }
	    }
	};

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';
	
	var DEFAULT_LEAVE_CLASS = 'leave';
	var DEFAULT_ENTER_CLASS = 'enter';
	var DEFAULT_ACTIVE_CLASS = 'animated';
	var DEFAULT_TIMEOUT = 3500;
	
	
	module.exports = function (attrs) {
	    var enterTimeout = parseInt(attrs.enterTimeout, 10);
	    var leaveTimeout = parseInt(attrs.leaveTimeout, 10);
	    var animationName = attrs.name || attrs.animationName;
	
	    return {
	        animationEnter: attrs.animationEnter || animationName,
	        animationLeave: attrs.animationLeave || animationName,
	        initialAnimation: attrs.initialAnimation,
	
	        enterClass: attrs.enterClass || DEFAULT_ENTER_CLASS,
	        leaveClass: attrs.leaveClass || DEFAULT_LEAVE_CLASS,
	
	        enterTimeout: isNaN(enterTimeout) ? DEFAULT_TIMEOUT : enterTimeout,
	        leaveTimeout: isNaN(leaveTimeout) ? DEFAULT_TIMEOUT : leaveTimeout,
	
	        activeClass: attrs.activeClass || DEFAULT_ACTIVE_CLASS
	    };
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	function Runner(name) {
	    this.name = name;
	    this.callbacks = [];
	}
	
	Runner.prototype.push = function (callback) {
	    this.callbacks.push(callback);
	};
	
	Runner.prototype.execute = function () {
	    for (var i = this.callbacks.length - 1; i >= 0; i--)
	        this.callbacks.pop()();
	};
	
	var query = {
	
	    runners: {},
	
	    create: function (options) {
	        var delay;
	
	        // extract delay value
	        if (options && options.hasOwnProperty('delay')) {
	            delay = parseInt(options.delay, 10) || 0;
	        }
	
	        // generate name for runner
	        var name = "name_" + Math.random().toString(16).slice(2);
	        if (options && options.hasOwnProperty('groupName')) {
	            name = options.groupName;
	        }
	
	        // push runner to query
	        if (!this.runners.hasOwnProperty(name)) {
	            this.runners[name] = [];
	        }
	
	        var runner = new Runner(name);
	        this.runners[name].push(runner);
	        this.runners[name].delay = delay;
	
	        return runner;
	    },
	
	    run: function (name) {
	        var runners = this.runners[name];
	        if (runners) {
	            var delay = this.runners[name].delay;
	
	            function execute() {
	                for (var i = runners.length - 1; i >= 0; i--) {
	                    runners.pop().execute();
	                }
	            }
	
	            if (delay !== undefined) {
	                setTimeout(execute, delay);
	            } else {
	                execute();
	            }
	            this.runners[name] = [];
	        }
	    }
	};
	
	module.exports = query;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _ = __webpack_require__(1);
	
	var Module = __webpack_require__(24);
	var Events = __webpack_require__(9).Events;
	var Attrs = __webpack_require__(9).Attributes;
	
	var LayoutManager = Module.extend({
	    activePatches: [],
	
	    initialize: function() {
	        this.subscribe(Events.PATCH_START, this.onPatchStart, this);
	        this.subscribe(Events.PATCH_END, this.onPatchEnd, this);
	        this.subscribe(Events.NODE_REMOVED, this.onNodeRemove, this);
	    },
	
	    onNodeRemove: function(node) {
	        var ids = this.getChildIDs(node);
	
	        // Check that we are not trying to remove are still active children.
	        // It is possible that Parent was removed from the DOM but its children should stay in DOM (was reattached).
	        if (this.activeViews) {
	            ids = ids.filter(function(id) {
	                return this.activeViews.indexOf(id) < 0;
	            }, this);
	        }
	
	        if (node.hasAttribute(Attrs.ID)) {
	            ids.unshift(node.getAttribute(Attrs.ID));
	        }
	
	        this.publishEvent(ids, Events.DETACH);
	    },
	
	    isOnPage: function(node) {
	        return document.body.contains(node);
	    },
	
	    onPatchStart: function(node) {
	        if (!this.isOnPage(node)) {
	            return;
	        }
	
	        var views = this.getChildIDs(node);
	
	        if (node.hasAttribute(Attrs.ID)) {
	            views.unshift(node.getAttribute(Attrs.ID));
	        }
	
	        this.activePatches.push({
	            node: node,
	            views: views
	        });
	    },
	
	    onPatchEnd: function(node) {
	        if (!this.isOnPage(node)) {
	            return;
	        }
	
	        var patchData = this.activePatches.pop();
	
	        if (patchData.node !== node) {
	            throw new Error('Wrong patch order');
	        }
	
	        this.refreshLayout(patchData);
	    },
	
	    getChildIDs: function (el) {
	        var els = el.querySelectorAll('['+Attrs.ID+']');
	        var ids = [];
	        var index = 0;
	
	        for (index; index < els.length; index++) {
	            ids[index] = els[index].getAttribute(Attrs.ID);
	        }
	
	        return ids;
	    },
	
	    refreshLayout: function(patchData) {
	        var node = patchData.node;
	        var viewsBefore = patchData.views;
	        var viewsAfter = this.getChildIDs(node);
	
	        if (node.hasAttribute(Attrs.ID)) {
	            viewsAfter.unshift(node.getAttribute(Attrs.ID));
	        }
	
	        this.activeViews = viewsAfter;
	        var detachedViews = _.difference(viewsBefore, viewsAfter);
	        this.publishEvent(detachedViews, Events.DETACH);
	
	        var attachedViews = _.difference(viewsAfter, viewsBefore);
	        this.publishEvent(attachedViews, Events.ATTACH);
	        this.activeViews = null;
	    },
	
	    publishEvent: function(subscribers, event) {
	        subscribers.forEach(function(id){
	            this.publish(id + ':' + event);
	        }, this);
	    }
	});
	
	module.exports = new LayoutManager();

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var _ = __webpack_require__(1);
	var Backbone = __webpack_require__(5);
	var Dispatcher = __webpack_require__(6);
	
	var moduleOptions = ['channel', 'id'];
	
	function Module(options) {
	    this.cid = _.uniqueId('module');
	
	    _.extend(this, _.pick(options, moduleOptions));
	
	    this.id = _.result(this, 'id', this.cid);
	    this.initialize.apply(this, arguments);
	
	    if (this.channel) {
	        this.subscribe(this.channel, this.onReceiveMsg, this);
	    }
	}
	
	_.extend( Module.prototype, Dispatcher, {
	    initialize: function () {},
	    onReceiveMsg: function () {},
	
	    destroy: function () {
	        this.unsubscribe(null,null, this);
	    }
	});
	
	Module.extend = Backbone.View.extend;
	
	module.exports = Module;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var _ = __webpack_require__(1);
	var core = __webpack_require__(13);
	var Module = __webpack_require__(24);
	var iDOM = __webpack_require__(4);
	var renderView = __webpack_require__(12);
	
	var Navigator = Module.extend({
	
	    initialize: function() {
	        this.subscribe('navigation:show', this.navigateView, this);
	        this.subscribe('navigation:back', this.navigateBack, this);
	
	        // Old API support
	        this.subscribe('navigation.show', this.navigateView, this);
	        this.subscribe('navigation.back', this.navigateBack, this);
	    },
	
	    /**
	     * @description
	     * Allow to navigate View with transition effects
	     *
	     * @param {Object} data
	     * @param {(String|HTMLElement)}    data.container          - CSS selector or HTMLElement where to attach new View
	     * @param {String}                  data.content            - View ID to show
	     *
	     * @param {String}                  [data.animation]        - animation name which will be applied for transition
	     * @param {Object}                  [data.extras]           - extra data that you can pass to the new View
	     *
	     * @callback doneCallback
	     * @param {doneCallback}            [data.callback]         - fires on transition end
	     */
	    navigateView: function(data) {
	        data = data || {};
	
	        var container = this.getEl(data.container);
	
	        if (!container) {
	            throw new Error('Cannot find container el: ' + data.container);
	        }
	
	        this.patchContainer(container, this.getContent(data.content), data.options);
	    },
	
	    navigateBack: function (data) {
	        data.direction = 'back';
	        this.navigateView(data);
	    },
	
	    getEl: function(selector) {
	        return _.isString(selector) ? document.querySelector(selector) : selector;
	    },
	
	    patchContainer: function(container, view, options) {
	        iDOM.patch(container, function() {
	            if (view) {
	                renderView(view, options);
	            }
	        });
	    },
	
	    getContent: function(content) {
	        if (_.isString(content)) {
	            return core.get(content);
	        }
	
	        return content;
	    }
	});
	
	module.exports = new Navigator();


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports.template = __webpack_require__(10);
	module.exports.IncrementalDOM = __webpack_require__(4);
	module.exports.TransitionEnd = __webpack_require__(19);
	module.exports.AnimationEnd = __webpack_require__(18);
	module.exports.DOM = __webpack_require__(8);
	
	// todo remove binder after redesign component constructor
	module.exports.ITemplate = __webpack_require__(11);
	module.exports.binder = __webpack_require__(12);

/***/ }
/******/ ])
});
;
//# sourceMappingURL=rad.js.map