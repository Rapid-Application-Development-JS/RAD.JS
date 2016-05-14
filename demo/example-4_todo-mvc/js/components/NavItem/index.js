'use strict';
var RAD = require('RAD');
var Backbone = require('Backbone');
var linkTemplate = require('./tpl.ejs');

RAD.utils.ITemplate.registerHelper('i-NavItem', function (attrs) {
    linkTemplate({
        href: attrs.href,
        title: attrs.title,
        selected: Backbone.history.fragment === attrs.href
    });
});