'use strict';

var RAD = require('RAD');
var Backbone = require('backbone');
var renderLink = RAD.template( require('./tpl.ejs'), {parameterName: 'link'} );

RAD.template.registerHelper('NavItem', function(attrs, content) {
    var selected = Backbone.history.fragment === attrs.href;
    var activeClass = 'active';

    renderLink({
        href: attrs.href,
        className: selected ? attrs.class + ' ' + activeClass : attrs.class,
        content: content
    });
});