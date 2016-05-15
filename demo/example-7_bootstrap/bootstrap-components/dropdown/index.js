var template = require('./template.ejs');

module.exports = function (data) {
    // render template
    var refs = template(data);

    // attach onclick logic
    refs.ul.onclick = function (e) {
        e.preventDefault();
        if (e.target && e.target.tagName === 'A') {
            var index = parseInt(e.target.getAttribute('data-index'), 10);
            data.onclick(e, index, data.items[index]);
        }
    };
};