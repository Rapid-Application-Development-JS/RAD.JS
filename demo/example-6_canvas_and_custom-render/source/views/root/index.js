"use strict";

var RAD = require('RAD');


var RootView = RAD.Base.View.extend({
    charData: 10,

    template: RAD.template(require('./tpl.ejs'), {
        components: {
            ChartView: require('./chart'),
            CustomView: require('./custom')
        }
    }),

    events: {
        'input .slider': 'changeData'
    },
    initialize: function () {
        this.props.set('charData', 10);
    },
    changeData: function (e) {
        this.props.set('charData', parseInt(e.target.value));
    }
});
module.exports = new RootView();