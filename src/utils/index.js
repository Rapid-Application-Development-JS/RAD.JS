"use strict";

module.exports.template = require('./../template');
module.exports.IncrementalDOM = require('./../template/idom');
module.exports.TransitionEnd = require('./transition/transitionEnd');
module.exports.AnimationEnd = require('./transition/animationEnd');
module.exports.DOM = require('./DOM_Utils');

// todo remove binder after redesign component constructor
module.exports.ITemplate = require('idom-template');
module.exports.binder = require('../template/binder');