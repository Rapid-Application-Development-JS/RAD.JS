RAD.view("view.start_page", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/page/start_page.html',
    events: {
        'tap .toast-show': 'showToast'
    },
    showToast: function () {
        "use strict";
        var gravity,
            type,
            title,
            msg,
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

        gravity = getCheckedRadioValue('gravity') || 'center';
        type = getCheckedRadioValue('type') || 'message';
        title = document.getElementById("title").value || 'Empty Title';
        msg = document.getElementById("content").value || 'Empty Content';

        // show toast
        options = {
            content: "view.toast",
            gravity: gravity,
            extras: {
                type: type,
                title: title,
                msg: msg,
                showTime: 3000
            }
        };
        this.publish('navigation.toast.show', options);
    }
}));