var templateFn = RAD.template.compileHelper(require('./template.ejs'));

RAD.template.registerHelper('x-accordion-group', templateFn);