RAD.view("view.second_page", RAD.Blanks.View.extend({
    url:'source/views/second_page/second_page.html',
    events: {
        'tap #back': 'goBack'
    },
    goBack: function () {
        "use strict";
        var options = {
            container_id: '#screen',
            content: "view.start_page",
            animation: "slide-out"
        };

        this.publish('navigation.show', options);
    },
    onNewExtras: function (extras) {
        "use strict";
        var self = this;
        self.loader.done(function () {
            self.$("#options").html(extras.data);
        });
    },
    onStartAttach: function () {
        "use strict";
        var self = this;
        self.$("#on_new").html(self.extras.data);
    }
}));