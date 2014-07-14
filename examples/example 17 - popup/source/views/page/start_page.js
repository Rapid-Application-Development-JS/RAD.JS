RAD.view("view.start_page", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/page/start_page.html',
    events: {
        'click .dialog-show': 'showDialog'
    },
    onReceiveMsg: function (channel, data) {
        "use strict";
        var parts = channel.split('.');

        switch (parts[2]) {
        case 'popup':
            this.fillResult(data);
            break;
        }
    },
    showDialog: function (e) {
        "use strict";
        var self = this,
            options = document.forms['popup-options'],
            gravity = options.querySelector('[name=gravity]:checked').value,
            outsideToClose = options.querySelector('[name=autoclose]').checked,
            targetID = e.currentTarget.getAttribute('data-target'),
            target = targetID ? this.el.querySelector('#'+targetID) : e.currentTarget,
            msg;

        msg = document.getElementById("content").value;

        this.publish('navigation.popup.show', {
            content: "view.popup",
            target: target,
            width: 240,
            height: 200,
            gravity: gravity,
            outsideClose: outsideToClose,
            extras: {
                msg: msg,
                parent: self.viewID
            }
        });
    },
    fillResult: function (data) {
        "use strict";
        this.$('#dialog_result').html(data.result);
    }
}));