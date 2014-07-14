RAD.view("view.dialog", RAD.Blanks.View.extend({
    url: 'source/views/dialog/dialog.html',
    className: 'modal-view',
    attributes: {
        'data-role': 'modal-view'
    },
    events: {
        'click .close-dialog': 'closeDialog'
    },
    onInitialize: function () {
        'use strict';
        this.model = new (Backbone.Model.extend())();
    },
    onNewExtras: function (extras) {
        'use strict';
        this.model.set({title: extras.title});
        this.caller = extras.parent;
    },
    closeDialog: function () {
        "use strict";
        var self = this,
            resultString = this.$('#text').get(0).value || '';

        //transfer data to parent
        this.publish(this.caller + '.dialog', {result: resultString });

        //close dialog
        this.publish('navigation.dialog.close', {content: self.viewID });
    }
}));
