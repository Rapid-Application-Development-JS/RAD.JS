RAD.view("view.start_page", RAD.Blanks.View.extend({
    url: 'source/views/page/start_page.html',
    events: {
        'click .dialog-show': 'showDialog'
    },
    onReceiveMsg: function (channel, data) {
        "use strict";
        var parts = channel.split('.');

        switch (parts[2]) {
        case 'dialog':
            this.fillResult(data);
            break;
        }
    },
    showDialog: function () {
        "use strict";
        var self = this,
            title = this.$('#title').get(0).value || 'Empty dialog title',
            options = {
                content: "view.dialog",
                animation: 'popup-fade',
                outsideClose: false,
                extras: {
                    title: title,
                    parent: self.viewID
                }
            };

        this.publish('navigation.dialog.show', options);
    },
    fillResult: function (data) {
        "use strict";
        this.$('#dialog_result').html(data.result);
    }
}));