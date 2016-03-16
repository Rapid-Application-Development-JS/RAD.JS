"use strict";

var RAD = require('RAD');

var ImageView = RAD.Blanks.View.extend({
    template: RAD.template( require('./gallery.ejs') ),
    onAttach: function() {
        console.log('attach', this.getID());
    },
    onDetach: function () {
        console.log('detach', this.getID());
    }
});

module.exports = ImageView;