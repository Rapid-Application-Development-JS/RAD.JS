'use strict';

var RAD = require('RAD');
var Backbone = require('Backbone');
var linkTemplate = RAD.template.compileHelper( require('./tpl.ejs'), {parameterName: 'link'} );

RAD.template.registerHelper('NavItem', function(attrs) {
    linkTemplate({
        href: attrs.href,
        title: attrs.title,
        selected: Backbone.history.fragment === attrs.href
    });
});