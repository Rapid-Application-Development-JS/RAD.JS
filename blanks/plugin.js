var radClass = require('./class').module;

var blankPlugin = radClass.extend({
    initialize: function () {
        this.subscribe(this.radID, this.onReceiveMsg, this);
        this.onInitialize();
    },
    destroy: function () {
        this.onDestroy();
        this.unsubscribe(this);
    },
    onInitialize: function () {},
    onReceiveMsg: function () {},
    onDestroy: function () {}
});

exports.namespace = 'RAD.Blanks.Plugin';
exports.module = blankPlugin;
exports.type = 'namespace';