RAD.service('service.storage', RAD.Blanks.Service.extend({

    onInitialize: function () {
        "use strict";
        var self = this;

        this.storage = window.localStorage || window.sessionStorage;

        document.addEventListener('deviceready', function () {
            self.storage = window.localStorage;
        }, false);
    },

    saveObject: function (objectID, object) {
        "use strict";
        this.storage.setItem(objectID, JSON.stringify(object));
    },

    loadObject: function (objectID) {
        "use strict";
        var result = this.storage.getItem(objectID);
        if (result !== null) {
            result = JSON.parse(result);
        }

        return result;
    },

    removeObject: function (objectID) {
        "use strict";
        var objectForRemove = this.loadObject(objectID);
        this.storage.removeItem(objectID);
        return objectForRemove;
    },

    clearObject: function () {
        "use strict";
        this.storage.clear();
    },

    onReceiveMsg: function (channel, data) {
        "use strict";
        var parts = channel.split('.'),
            self = this,
            callback;

        if (!!data) {
            callback = data.callback;
        }

        switch (parts[2]) {
        case 'save':
            self.saveObject(data.objectID, data.object);
            if (typeof callback === "function") {
                callback();
            }
            break;
        case 'load':
            var loadedObject = self.loadObject(data.objectID);
            if (typeof callback === "function") {
                callback(loadedObject);
            }
            break;
        case 'remove':
            var removeObject = self.removeObject(data.objectID);
            if (typeof callback === "function") {
                callback(removeObject);
            }
            break;
        case 'clear':
            self.clearObject();
            if (typeof callback === "function") {
                callback();
            }
            break;
        }
    }
}));