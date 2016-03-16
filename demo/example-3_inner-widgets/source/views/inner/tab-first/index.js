"use strict";

var RAD = require('RAD');

var TabView = RAD.Base.View.extend({
    template: RAD.template( require('./tpl.ejs'), {
        components: {
            ImageView: require('../gallery')
        }
    } ),

    onAttach: function () {
        console.log('attach', this.getID());
    },
    onDetach: function () {
        console.log('detach', this.getID());
    }
});

module.exports = TabView;