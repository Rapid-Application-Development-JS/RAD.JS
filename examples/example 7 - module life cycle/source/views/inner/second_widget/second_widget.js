RAD.view("view.inner_second_widget", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/second_widget/second_widget.html',
    onInitialize: function () {
        "use strict";
        var self = this;
        self.publish("life_cycle", {what: "onInitialize", where: self.viewID});
    },
    onNewExtras: function () {
        "use strict";
        var self = this;
        self.publish("life_cycle", {what: "onNewExtras", where: self.viewID});
    },
    onReceiveMsg: function (channel, data) {
        "use strict";
        var self = this, options;
        self.publish("life_cycle", {what: "onReceiveMsg", where: self.viewID});

        if (!self.visible) {
            return;
        }

        if (data.deleteView) {
            options = {
                container_id: '.main',
                animation: data.animation,
                content: null,
                callback: function () {
                    self.finish();
                }
            };

            self.publish('navigation.show', options);
        }
    },
    onStartRender: function () {
        "use strict";
        var self = this;
        self.publish("life_cycle", {what: "onStartRender", where: self.viewID});
    },
    onEndRender: function () {
        "use strict";
        var self = this;
        self.publish("life_cycle", {what: "onEndRender", where: self.viewID});
    },
    onStartAttach: function () {
        "use strict";
        var self = this;
        self.visible = true;
        self.publish("life_cycle", {what: "onStartAttach", where: self.viewID});
    },
    onEndAttach: function () {
        "use strict";
        var self = this;
        self.publish("life_cycle", {what: "onEndAttach", where: self.viewID});
    },
    onEndDetach: function () {
        "use strict";
        var self = this;
        self.visible = false;
        self.publish("life_cycle", {what: "onEndDetach", where: self.viewID});
    },
    onDestroy: function () {
        "use strict";
        var self = this;
        self.publish("life_cycle", {what: "onDestroy", where: self.viewID});
    }
}));