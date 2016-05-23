'use strict';

var IncrementalDOM = require('incremental-dom');
var _ = require('underscore');
var iTemplate = require('idom-template');
var binder = require('./binder');

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