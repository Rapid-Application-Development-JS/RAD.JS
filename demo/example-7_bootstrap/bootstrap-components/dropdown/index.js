var template = RAD.template.compileHelper(require('./template.ejs'));

RAD.template.registerHelper('x-dropdown', function (data) {
    // render template
    var refs = template(data);

    // attach onclick logic
    refs.ul.onclick = function (e) {
        if (e.target && e.target.tagName === 'A') {
            var index = parseInt(e.target.getAttribute('data-index'), 10);
            data.onclick(e, index, data.items[index]);
        }
    };
});