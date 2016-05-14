var template = require('./template.ejs');

RAD.utils.ITemplate.registerHelper('i-dropdown', function (data) {
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