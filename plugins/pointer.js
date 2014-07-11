var blankPlugin = require('../blanks/plugin').module,
    pointer = require('../tools/pointer').module;

var PointerPlugin = blankPlugin.extend({
    onInitialize: function () {
        if (!window.PointerEvent){
            this.gesture = new pointer(document.body);
        }
    },

    onDestroy: function () {
        this.gesture.destroy();
        this.gesture = null;
    }
});

exports.namespace = 'plugin.pointer';
exports.module = PointerPlugin;
exports.type = 'plugin';
