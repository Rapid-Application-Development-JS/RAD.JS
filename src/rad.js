"use strict";

var _ = require('underscore');

// Init plugins
require('./plugins');

/**
 *
 * RAD namespace.
 * @namespace
 */

var RAD = {};

RAD.core = require('./core');
RAD.utils = require('./utils');
RAD.template = require('./template');
RAD.View = require('./blanks/view');
RAD.Module = require('./blanks/module');

// For Backward compatibility
RAD.Base = {};
RAD.Base.View = RAD.View;
RAD.Base.Module = RAD.Module;
RAD.Blanks = RAD.Base;
RAD.core.getView = RAD.core.get;

// Extend with Dispatcher API: publish, subscribe, unsubscribe
_.extend(RAD, require('./core/dispatcher'));

module.exports = RAD;