RAD.view("view.stats", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/stats/stats.html',
    events: {
        'tap .btn-reset': 'onResetStat'
    },
    onInitialize: function () {
        "use strict";
        this.model = new RAD.models.StatsCollection;
    },
    onEndAttach: function () {
        "use strict";
        this.refreshStats();
        this.render();
    },
    onReceiveMsg: function (channel, data) {
        "use strict";
        var self = this,
            parts = channel.split('.');

        switch (parts[2]) {
        case 'refresh':
            self.refreshStats();
            break;
        case 'confirm':
            self.clearProgress();
            break;
        }
    },
    refreshStats: function () {
        "use strict";
        this.model.refreshStats();
    },
    onResetStat: function (e) {
        "use strict";
        var self = this,
            options = {
                content: 'view.confirm_dialog',
                extras: {
                    msg: 'Do you want to reset progress?',
                    fromViewID: self.viewID
                }
            };
        self.publish('navigation.dialog.show', options);
    },
    clearProgress: function () {
        "use strict";
        this.application.clearProgress();
        this.model.refreshStats();
    }
}));