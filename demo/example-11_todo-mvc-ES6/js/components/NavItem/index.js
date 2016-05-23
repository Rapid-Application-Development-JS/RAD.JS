'use strict';
var {utils} = require('RAD');
var Backbone = require('Backbone');
var linkTemplate = require('./tpl.ejs');
var registerHelper = utils.ITemplate.registerHelper;

registerHelper('i-NavItem', function (attrs) {
    linkTemplate({
        href: attrs.href,
        title: attrs.title,
        selected: Backbone.history.fragment === attrs.href
    });
});