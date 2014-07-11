var blankPlugin = require('../blanks/plugin').module,
    gesture = require('../tools/gesture').module;

var GesturePlugin = blankPlugin.extend({
    onInitialize: function () {
        this.gesture = new gesture(document.body);
    },

    onDestroy: function () {
        this.gesture.destroy();
        this.gesture = null;
    }
});

exports.namespace = 'plugin.gesture';
exports.module = GesturePlugin;
exports.type = 'plugin';
