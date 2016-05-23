'use strict';

function hasClass(el, cname) {
    return el.className ? el.className.match(new RegExp('(\\s|^)'+cname+'(\\s|$)')) : false;
}

function addClass(el, cnames) {
    var classNames = cnames ? cnames.split(' ') : [];

    classNames.forEach(function(cname){
        if (!hasClass(el, cname)) {
            el.className = el.className ? el.className + " " + cname : cname;
        }
    }, this);
}

function removeClass(el, cnames) {
    var classNames = cnames ? cnames.split(' ') : [];

    classNames.forEach(function(cname){
        if (hasClass(el, cname)) {
            el.className = el.className.replace(new RegExp('(\\s|^)'+cname+'(?=\\s|$)'),'');
        }
    }, this);
}

module.exports.hasClass = hasClass;
module.exports.addClass = addClass;
module.exports.removeClass = removeClass;