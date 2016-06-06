function Runner() {
    this.callbacks = [];

    // this.delay = undefined;
    //
    // if (options && options.hasOwnProperty('delay')) {
    //     this.delay = parseInt(options.delay, 10) || 0;
    // }
}

Runner.prototype.push = function (callback) {
    this.callbacks.push(callback);
};

Runner.prototype.execute = function () {
    // clearTimeout(this.timeout);
    //
    // var callbacks = this.callbacks;
    //
    // function execute() {
    //     for (var i = callbacks.length - 1; i >= 0; i--)
    //         callbacks.pop()();
    // }
    //
    // if (this.delay !== undefined) {
    //     this.timeout = setTimeout(execute, this.delay);
    // } else {
    //     execute();
    // }

    for (var i = this.callbacks.length - 1; i >= 0; i--)
        this.callbacks.pop()();
};

function createExecutor(query, name, delay) {
    return function () {
        var runners = query.runners[name];

        runners.run = function () {
        };

        function execute() {
            for (var i = runners.length - 1; i >= 0; i--) {
                console.log(i, name);
                runners.pop().execute();
            }

            delete query.runners[name];
        }

        if (delay !== undefined) {
            setTimeout(execute, delay);
        } else {
            execute();
        }
    }
}

var query = {

    runners: {},

    create: function (options) {
        var self = this;
        var runner = new Runner(options);
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

            this.runners[name].run = createExecutor(this, name, delay);
        }
        this.runners[name].push(runner);

        // modify the runner
        runner.name = name;
        runner.run = function () {
            self.runners[this.name].run();
        };

        return runner;
    }
};

module.exports = query;