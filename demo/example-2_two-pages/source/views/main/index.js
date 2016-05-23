"use strict";

var RAD = require('RAD');
var _ = require('underscore');
var animations = require('../../collections/animations');

var MainView = RAD.View.extend({
    template: require('./tpl.ejs'),
    className: 'root-view',
    events: {
        'click .topcoat-list__item': 'navigate',
        'click #back': 'goBack'
    },
    goBack: function () {
        this.props.set({direction: 'backward'});
    },
    onRender: function () {
        // Used to show how animation works during continuous render
        if (!this.interval) {
            this.interval = window.setInterval(function () {
                this.render();
            }.bind(this), 100);
        }
    },
    navigate: function (e) {
        var animationData = animations.get(+e.currentTarget.id).toJSON();

        this.props.set(animationData, {silent: true});
        this.props.set({direction: 'forward'});
    }
});

module.exports = new MainView();
