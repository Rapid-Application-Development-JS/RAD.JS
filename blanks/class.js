var cl = (function () {
    var self = function () {
    };

    function isFn(fn) {
        return typeof fn === "function";
    }

    self.extend = function (proto) {
        var key, k = function (magic) { // call initialize only if there's no magic cookie
            if (magic !== isFn && isFn(this.initialize)) {
                this.initialize.apply(this, arguments);
            }
        };
        k.prototype = new this(isFn); // use our private method as magic cookie
        for (key in proto) {
            (function (fn, sfn) { // create a closure
                k.prototype[key] = !isFn(fn) || !isFn(sfn) ? fn : // add _super method
                    function () {
                        this._super = sfn;
                        return fn.apply(this, arguments);
                    };
            }(proto[key], k.prototype[key]));
        }
        k.prototype.constructor = k;
        k.extend = this.extend || this.create;
        return k;
    };
    return self;
}());

exports.namespace = 'RAD.Class';
exports.module = cl;
exports.type = 'namespace';