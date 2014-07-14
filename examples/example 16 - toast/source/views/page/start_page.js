RAD.view("view.start_page", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/page/start_page.html',
    events: {
        'submit': 'onSubmit',
        'click .toast-show': 'showToast'
    },
    onSubmit: function(e) {
        "use strict";
        e.preventDefault();
    },
    showToast: function () {
        "use strict";
        var formContent = document.forms['toast-content'],
            formOptions = document.forms['toast-options'],

            type    = formOptions.querySelector('[name=type]:checked').value,
            gravity = formOptions.querySelector('[name=gravity]:checked').value,

            title   = formContent.querySelector('[name=title]').value   || 'Empty Title',
            msg     = formContent.querySelector('[name=content]').value || 'Empty Content';

        // show toast
        this.publish('navigation.toast.show', {
            content: "view.toast",
            gravity: gravity,
            showTime: 4000,
            outsideClose: true,
            extras: {
                type: type,
                title: title,
                msg: msg,
                gravity: gravity
            }
        });
    }
}));