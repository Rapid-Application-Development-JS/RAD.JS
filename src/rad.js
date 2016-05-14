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

// Extend with Dispatcher API: publish, subscribe, unsubscribe
_.extend(RAD, require('./core/dispatcher'));

module.exports = RAD;