"use strict";

var RAD = require('RAD');

var MainView  = RAD.View.extend({
    template: RAD.template(require('./tpl.ejs'), {
        components: {
            List: require('../list'),
            Details: require('../details')
        }
    }),
    className: 'root-view',
    events: {
        'click .topcoat-list__item': 'navigate',
        'click #back': 'goBack'
    },
    goBack: function () {
        // revers animation
        this.props.set({
            direction: 'backward',
            animationEnter: this.props.get('animationEnterBack'),
            animationLeave: this.props.get('animationLeaveBack'),
            enterTimeout: this.props.get('leaveTimeout'),
            leaveTimeout: this.props.get('enterTimeout')
        })
    },
    navigate: function(e) {
        this.props.set({
            direction: 'forward',
            animationEnter: e.currentTarget.getAttribute('data-animation-enter'),
            animationLeave: e.currentTarget.getAttribute('data-animation-leave'),
            animationEnterBack: e.currentTarget.getAttribute('data-animation-enter-back'),
            animationLeaveBack: e.currentTarget.getAttribute('data-animation-leave-back'),
            enterTimeout: e.currentTarget.getAttribute('data-enter-timeout'),
            leaveTimeout: e.currentTarget.getAttribute('data-leave-timeout')
        })
    }
});

module.exports = new MainView();
