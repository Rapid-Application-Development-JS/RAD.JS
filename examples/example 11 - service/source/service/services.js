RAD.service("service.my_service", RAD.Blanks.Service.extend({
    onReceiveMsg: function (channel, data) {
        "use strict";
        var backway = data.split("").reverse().join("");
        this.publish('view.widget2', backway);
    }
}));

RAD.service("service.my_service2", RAD.Blanks.Service.extend({
    onReceiveMsg: function (channel, data) {
        "use strict";
        window.console.log('Length: ' + data.length);
    }
}));