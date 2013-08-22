RAD.views.Dialog = RAD.Blanks.View.extend({
    url: 'source/views/dialog/dialog.html',
    events: {
        'tap .close-dialog': 'closeDialog'
    },
    onInitialize: function () {
        'use strict';
        this.model = new (Backbone.Model.extend())();
    },
    onNewExtras: function (extras) {
        'use strict';
        this.model.set({title: extras.title, content: extras.content});
        this.caller = extras.parent;
    },
    closeDialog: function () {
        "use strict";
        var self = this;
        this.publish('navigation.dialog.close', {content: self.viewID });
    }
});
