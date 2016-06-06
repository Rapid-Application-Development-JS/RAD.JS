function Runner(name) {
    this.name = name;
    this.callbacks = [];
}

Runner.prototype.push = function (callback) {
    this.callbacks.push(callback);
};

Runner.prototype.execute = function () {
    for (var i = this.callbacks.length - 1; i >= 0; i--)
        this.callbacks.pop()();
};

var query = {

    runners: {},

    create: function (options) {
        var delay;

        // extract delay value
        if (options && options.hasOwnProperty('delay')) {
            delay = parseInt(options.delay, 10) || 0;
        }

        // generate name for runner
        var name = "name_" + Math.random().toString(16).slice(2);
        if (options && options.hasOwnProperty('groupName')) {
            name = options.groupName;
        }

        // push runner to query
        if (!this.runners.hasOwnProperty(name)) {
            this.runners[name] = [];
        }

        var runner = new Runner(name);
        this.runners[name].push(runner);
        this.runners[name].delay = delay;

        return runner;
    },

    run: function (name) {
        var runners = this.runners[name];
        if (runners) {
            var delay = this.runners[name].delay;

            function execute() {
                for (var i = runners.length - 1; i >= 0; i--) {
                    runners.pop().execute();
                }
            }

            if (delay !== undefined) {
                setTimeout(execute, delay);
            } else {
                execute();
            }
            this.runners[name] = [];
        }
    }
};

module.exports = query;