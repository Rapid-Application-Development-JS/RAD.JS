RAD.service('service.json_loader', RAD.Blanks.Service.extend({

    jsonLocation: 'source/json/',

    onReceiveMsg: function (channel, data) {
        "use strict";
        var parts = channel.split('.'),
            filename = data.filename,
            callback = data.callback,
            self = this;
        switch (parts[2]) {
        case 'load':
            self.loadJSON(filename, callback);
            break;
        }
    },

    loadJSON: function (filename, callback) {
        "use strict";
        var uri = this.jsonLocation + filename;
        $.get(uri, function (response) {
            callback(response);
        }, 'json');
    }
}));