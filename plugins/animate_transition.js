var blankPlugin = require('../blanks/plugin').module,
    animateTransition = require('../tools/animate_transition').module;

var animateTransitionPlugin = blankPlugin.extend({
    onInitialize: function() {
        this.subscribe('animateTransition', this.applyTransition, this)
    },
    applyTransition: function(channel, data) {
        if (data) {
            animateTransition(data);
        }
    }
});

exports.namespace = 'plugin.animateTransition';
exports.module = animateTransitionPlugin;
exports.type = 'plugin';