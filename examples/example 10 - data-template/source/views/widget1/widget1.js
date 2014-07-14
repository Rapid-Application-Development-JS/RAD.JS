RAD.view("view.widget1", RAD.Blanks.View.extend({
    url: 'source/views/widget1/widget1.html',
    events: {
        'keyup input': 'changeVal'
    },
    changeVal: function (e) {
        "use strict";
        RAD.models.message.set({msg: e.currentTarget.value});
    }
}));