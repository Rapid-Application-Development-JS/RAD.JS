"use strict";
var RAD = require('RAD');

// custom underscore template
var template = _.template('<div>Custom Rendering: <%= date %><span class="data"></span></div>');

var CustomView = RAD.View.extend({
    className: 'block',

    onBeforeRender: function () {
        if (this.dataEl) {
            this.renderValue();
            return false;
        }
    },

    onRender: function () {
        this.el.innerHTML = template({date: new Date()});
        this.dataEl = this.el.querySelector('.data');
        this.renderValue();
    },

    renderValue: function () {
        this.dataEl.textContent = ' ' + this.props.get('value') + ' ';
    }
});

module.exports = CustomView;