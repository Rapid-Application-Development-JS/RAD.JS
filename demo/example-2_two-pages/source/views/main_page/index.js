"use strict";

var RAD = require('RAD');

var MainView  = RAD.View.extend({
    template: RAD.template(require('./tpl.ejs'), {
        components: {
            FirstPage: require('views/first_page'),
            SecondPage: require('views/second_page')
        }
    }),
    events: {
        'click .topcoat-list__item': 'navigate',
        'click #back': 'goBack'
    },
    goBack: function () {
        // revers animation
        this.props.set({
            direction: 'backward',
            animationEnter: this.props.get('animationLeave'),
            animationLeave: this.props.get('animationEnter')
        })
    },
    navigate: function(e) {
        this.props.set({
            direction: 'forward',
            animationEnter: e.currentTarget.getAttribute('data-animation-enter'),
            animationLeave: e.currentTarget.getAttribute('data-animation-leave')
        })
    }
});

module.exports = new MainView();
