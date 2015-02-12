var def = function () {
    return {
        isResolved: function () { return false; },
        listeners: [],
        done: function (fn) {
            this.listeners.push(fn);
        },
        doneFirstTask: function (fn) {
            this.firstTask = fn;
        },
        doneLastTask: function (fn) {
            this.lastTask = fn;
        },
        resolve: function () {
            var self = this, index, length, fn;

            self.isResolved = function () { return true; };
            self.resolve = function () {
            };
            self.done = function (fn) {
                if (typeof fn === 'function') {
                    fn();
                }
            };
            self.doneLastTask = self.doneFirstTask = self.done;
            if (typeof self.firstTask === 'function') {
                self.firstTask();
            }

            for (index = 0, length = self.listeners.length; index < length; index += 1) {
                fn = self.listeners[index];
                if (typeof fn === 'function') {
                    fn();
                }
            }

            if (typeof self.lastTask === 'function') {
                self.lastTask();
            }
            delete self.listeners;
        }
    };
};

exports.namespace = 'RAD.Blanks.Deferred';
exports.module = def;
exports.type = 'namespace';