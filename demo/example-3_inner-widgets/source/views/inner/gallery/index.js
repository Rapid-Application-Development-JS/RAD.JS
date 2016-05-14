"use strict";

var RAD = require('RAD');

var ImageView = RAD.View.extend({
    template: require('./gallery.ejs'),
    onAttach: function () {
        console.log('attach', this.getID());
    },
    onDetach: function () {
        console.log('detach', this.getID());
    }
});

module.exports = ImageView;