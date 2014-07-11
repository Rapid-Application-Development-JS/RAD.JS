var blankPlugin = require('../blanks/plugin').module,
    backStack = require('../tools/backstack').module;

var router = blankPlugin.extend({
    onInitialize: function () {
        this.backStack = new backStack(RAD.core, this.radID);
    },
    onDestroy: function () {
        this.backStack.destroy();
        this.backStack = null;
    }
});

exports.namespace = 'plugin.router';
exports.module = router;
exports.type = 'plugin';