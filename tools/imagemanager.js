function ImageQueue(size, stubUrl) {
    var i, queue = this;

    this._loaders = new Array(size);
    this._free = [];
    this._pool = [];
    this._map = {};
    this._isPaused = false;
    this._stubUrl = stubUrl;

    this._isDone = true;

    function clear() {
        if (this.src in queue._map) {
            delete queue._map[this.src];
        }
        this.success = null;
        this.error = null;
    }

    function onload() {
        if (typeof this.success === 'function') {
            this.success(this.src);
        }
        this.clear();
        queue._next(this.index);
    }

    function onerror(e) {
        if (typeof this.error === 'function') {
            this.error(e, this.src);
        }
        this.clear();
        queue._next(this.index);
    }

    for (i = 0; i < size; i += 1) {
        this._loaders[i] = new Image();
        this._loaders[i].index = i;
        this._loaders[i].clear = clear;
        this._loaders[i].onload = onload;
        this._loaders[i].onerror = onerror;

        this._free.push(i);
    }
}

ImageQueue.prototype = {

    _next: function (index) {
        var task = this._pool[0], i, l;
        if (index !== undefined && this._free.indexOf(index) === -1) {
            this._free.push(index);
        }
        if ((task !== undefined) && (!this._isPaused)) {
            for (i = 0, l = this._pool.length - 1; i < l; i += 1) {
                this._pool[i] = this._pool[i + 1];
            }

            this._pool.length = this._pool.length - 1;
            this.inQueue(task.url, task.success, task.error);
        } else {
            this._isDone = true;
            if (typeof this._callback === 'function') {
                this._callback();
            }
        }
    },

    inQueue: function (url, success, error) {
        var index, loader;

        this.reject(url);

        if (!this._isPaused) {
            index = this._free.pop();
        }

        this._isDone = false;
        if (index !== undefined) {
            loader = this._loaders[index];
            loader.success = success;
            loader.error = error;

            loader.src = url;
            this._map[url] = index;

            if (loader.complete) {
                loader.success(url);
                loader.clear();
                loader.src = this._stubUrl;
                this._next(index);
            }
        } else {
            this._pool.push({
                url: url,
                success: success,
                error: error
            });
        }
    },

    reject: function (url) {
        var index, i;

        if (url in this._map) {
            index = this._map[url];
            this._loaders[index].clear();
            this._loaders[index].src = this._stubUrl;
            delete this._map[url];
        } else {
            for (i = this._pool.length - 1; i > -1; i -= 1) {
                if (this._pool[i].url === url) {
                    this._pool.splice(i, 1);
                }
            }
        }
    },

    pause: function () {
        this._isPaused = true;
    },

    resume: function () {
        this._isPaused = false;
        this._next();
    },

    clear: function () {
        var i;
        for (i = this._loaders.length - 1; i > -1; i -= 1) {
            this._loaders[i].clear();
            this._loaders[i].src = this._stubUrl;
        }
        this._pool = [];
    },

    doWhenEnd: function (callback) {
        this._callback = callback;
        if (this._isDone && typeof this._callback === 'function') {
            this._callback();
        }
    }
};

function ImageManager(cacheSize, poolSize, stubUrl) {
    var i;

    this._queue = new ImageQueue(poolSize, stubUrl);
    this._container = new Array(cacheSize);
    this._nextItem = 0;
    this._map = {};
    this._stubUrl = stubUrl;

    for (i = 0; i < cacheSize; i += 1) {
        this._container[i] = {
            key: '',
            image: new Image()
        };
    }
}

ImageManager.prototype = {

    _addInCache: function (url) {
        var oldKey = this._container[this._nextItem].key;
        if (oldKey !== undefined) {
            delete this._map[oldKey];
        }

        this._container[this._nextItem].image.src = url;
        this._container[this._nextItem].key = encodeURI(url);
        this._map[encodeURI(url)] = this._nextItem;

        this._nextItem += 1;

        if (this._nextItem === this._container.length) {
            this._nextItem = 0;
        }
    },

    getImage: function (url, callback) {
        var key = encodeURI(url), cache = this;

        if (this._map[key] !== undefined) {
            callback(this._container[this._map[key]].image.src, true);
        } else {
            callback(this._stubUrl, true);
            this._queue.inQueue(url, function (successURL) {
                cache._addInCache(successURL, this);
                callback(successURL, false);
            });
        }
    },

    stopImage: function (url) {
        this._queue.reject(url);
    },

    pause: function () {
        this._queue.pause();
    },

    resume: function () {
        this._queue.resume();
    },

    clearQueue: function () {
        this._queue.clear();
    },

    clearCache: function () {
        var i;

        for (i = 0; i < this._container.length; i += 1) {
            this._container[i].url = '';
            this._container[i].image.src = '';
        }
        this._map = {};
    },

    stopQueue: function () {
        this._queue.clear();
    },

    doWhenEnd: function (callback) {
        this._queue.doWhenEnd(callback);
    }
};

if (typeof exports !== "undefined") {
    exports.module = ImageManager;
}