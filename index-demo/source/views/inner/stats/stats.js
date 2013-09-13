RAD.view("view.stats", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/stats/stats.html',
    events: {
        'tap .btn-reset': 'onResetStat'
    },
    onInitialize: function () {
        this.model = new RAD.models.StatsCollection;
    },
    onNewExtras: function (data) {
        this.refreshStats();
        this.render();
    },
    onEndRender: function () {
        this.buildChart();
    },
    onReceiveMsg: function (channel, data) {
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
		this.model.refreshStats();
	},
    buildChart: function () {
        var stats = this.model,
            keys = ['unanswered', 'know', 'unsure', 'dontKnow'],
            color = RAD.models.colors,
            chrtCanvases = this.$('.pie-chart');
    },
    onResetStat: function (e) {
        var options = {
            content: 'view.confirm_dialog',
            extras: {
                msg: 'Do you want to reset progress?',
                fromViewID: this.viewID
            }
        };
        this.publish('navigation.dialog.show', options);
    },
    clearProgress: function () {
        this.application.clearProgress();
        this.model.refreshStats();
    }
}));