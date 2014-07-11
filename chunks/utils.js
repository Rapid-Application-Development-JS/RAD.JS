function execute(func, args, context) {
    if (typeof func !== "function") {
        return;
    }
    if (context && context instanceof Object) {
        func.apply(context, args);
    } else {
        func(args);
    }
}

function isArray(value) {
    return (Object.prototype.toString.call(value) === '[object Array]');
}

exports.isArray = isArray;
exports.execute = execute;