RAD.view("view.screen_1", RAD.Blanks.View.extend({
    url: 'source/views/screen_1/screen_1.html',
    events: {
        'tap #login': 'login'
    },
    login: function (e) {
        "use strict";
        this.application.login();
    },
    onEndDetach: function () {
        "use strict";
        this.finish();
    }
}));