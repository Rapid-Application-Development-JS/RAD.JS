'use strict';

var RAD = require('RAD');
var template = RAD.template(require('./tpl.ejs'));

RAD.template.registerHelper('SliderItem', template);