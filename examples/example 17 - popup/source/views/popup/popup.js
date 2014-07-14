RAD.view("view.popup", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/popup/popup.html',
    events: {
        'click .close-dialog': 'closeDialog'
    },
    className: 'popup-view',
    attributes: {
        'data-role': 'popup-view'
    },
    onInitialize: function () {
        'use strict';
        this.model = new Backbone.Model();
    },
    onNewExtras: function (extras) {
        'use strict';
        this.model.set({msg: extras.msg});
        this.caller = extras.parent;
    },
    onEndDetach: function () {
        "use strict";
        var tag = this.$('#text').get(0),
            resultString = tag ? tag.value : '';
        //transfer data to parent
        this.publish(this.caller + '.popup', {result: resultString });
    },
    closeDialog: function () {
        "use strict";
        this.publish('navigation.popup.close', {content: this.viewID });
    }
}));
