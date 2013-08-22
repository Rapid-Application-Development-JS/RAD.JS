RAD.view("view.start_page", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/page/start_page.html',
    events: {
        'tap .dialog-show': 'showDialog'
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
            targetID = $(e.currentTarget).data('target'),
            target = targetID ? document.getElementById(targetID) : e.currentTarget,
            gravity,
            msg,
            onCloseDestroy = $('#close').is(':checked') ? true : false,
            outSideClose = $('#out').is(':checked') ? true : false,
            options;

        //get parameters from html
        function getCheckedRadioValue(radioGroupName) {
            var i, rads = document.getElementsByName(radioGroupName);
            for (i = 0; i < rads.length; i += 1) {
                if (rads[i].checked) {
                    return rads[i].value;
                }
            }

            return null; // or undefined, or your preferred default for none checked
        }

        gravity = getCheckedRadioValue('gravity');
        msg = document.getElementById("content").value;

        // open popup
        options = {
            content: "view.popup",

            target: target,
            width: 180,
            height: 200,
            gravity: gravity,

            extras: {
                onCloseDestroy: onCloseDestroy,
                outSideClose: outSideClose,
                msg: msg,
                parent: self.viewID
            }
        };

        this.publish('navigation.popup.show', options);
    },
    fillResult: function (data) {
        "use strict";
        this.$('#dialog_result').html(data.result);
    }
}));