function BackStack(core, id) {
    var self = {},
        router,
        stubStack = [],
        toForward = false,
        START_URL = 'index.html',
        ID_SEPARATOR = '%%%',
        routerType = (function (type) {
            var newAPI = (typeof history.pushState === 'function'),
                result = newAPI ? "native" : "hashbang",
                types = ["native", "hashbang", "custom"];

            if (type && types.indexOf(type) > 0) {
                result = type;
            }
            return result;
        }(core.options.backstackType));

    function getRootView(el) {
        var result, nodes, i, l, id;

        nodes = el.childNodes;
        for (i = 0, l = nodes.length; i < l; i += 1) {
            if (nodes[i].getAttribute) {
                result = nodes[i].getAttribute('view');
                id = nodes[i].getAttribute('id');
                id = id ? ('#' + id) : ('.' + nodes[i].className.split(' ').join('.'));
                if (result) {
                    return {content: result, container_id: id};
                }
            }
        }
        for (i = 0, l = nodes.length; i < l; i += 1) {
            result = getRootView(nodes[i]);
            if (result) {
                return result;
            }
        }
    }

    function buildURL(view) {
        var children,
            index,
            length,
            childID,
            child,
            tmp,
            result = [];

        function comparator(a, b) {
            var val1 = a.container_id, val2 = b.container_id, result = 0;
            if (val1 > val2) {
                result = 1;
            } else if (val1 < val2) {
                result = -1;
            }
            return result;
        }

        if (!view) {
            return result;
        }

        children = view.getChildren();
        for (index = 0, length = children.length; index < length; index += 1) {
            child = _.clone(children[index]);
            result.push(child);

            childID = child.content;
            tmp = buildURL(core.getView(childID));
            if (tmp && tmp.length > 0) {
                child.children = tmp;
            }
        }
        result.sort(comparator);

        return result;
    }

    function packURL(urlObj, timestamp, animation) {
        return encodeURIComponent(JSON.stringify(urlObj)).replace(/[!'()]/g, escape).replace(/\*/g, "%2A") + '$$$' + timestamp + '$$$' + animation;
    }

    function unpackURL(packURLString) {
        var result = {},
            tmpArr;

        tmpArr = packURLString.split('$$$');
        result.urlObj = JSON.parse(decodeURIComponent((tmpArr[0] + '').replace(/\+/g, '%20')));
        result.timestamp = tmpArr[1];
        result.animation = tmpArr[2];

        return result;
    }

    function HistoryStack() {
        var self = this,
            lastValue,
            currentPosition = -1,
            stack = [];

        self.push = function (data) {
            var position;
            // slice stack
            if (currentPosition !== stack.length - 1) {
                position = currentPosition + 1;
                stack = stack.slice(0, position);
            }

            if ((lastValue !== undefined) && (lastValue !== null)) {
                stack.push(lastValue);
            }

            lastValue = data;
            currentPosition = stack.length - 1;
        };

        self.getCurrent = function () {
            if ((lastValue !== undefined) && (lastValue !== null)) {
                return lastValue;
            }
            return stack[currentPosition];
        };

        self.getNext = function () {
            var position,
                result;

            position = currentPosition + 1;
            if ((position > -1) && (position < stack.length)) {
                result = stack[position];
                currentPosition = position;
            }

            return result;
        };

        self.getPrevious = function () {
            var position,
                result;

            if (lastValue) {
                stack.push(lastValue);
                currentPosition = stack.length - 1;
                lastValue = null;
            }

            position = currentPosition - 1;
            if ((position > -1) && (position < stack.length)) {
                result = stack[position];
                currentPosition = position;
            }
            return result;
        };

        self.clear = function () {
            lastValue = null;
            stack = [];
            currentPosition = stack.length - 1;
        };

        return self;
    }

    router = {

        // remove bugs associated with cleaning the local stack and repeat urls
        currentID: Math.floor(Math.random() * 100000),

        // used to calculate the difference in the current and future layouts
        currentURL: undefined,

        // used to calculate direction of stack popup (back/forward)
        lastURL: undefined,

        toBack: true,

        isBlocked: false,

        stack: new HistoryStack(),

        pushToStackRequest: false,

        navigate: function (newUrl) {
            var self = this;

            //enable entry in native history
            switch (routerType) {
                case "native":
                    history.pushState({url: newUrl, id: self.currentID}, null, null);
                    break;
                case "hashbang":
                    toForward = true;
                    window.location.href = START_URL + '#!' + newUrl + ID_SEPARATOR + self.currentID;
                    break;
                case "custom":
                    if (stubStack.last) {
                        stubStack.push(stubStack.last);
                    }
                    stubStack.last = {state: {url: newUrl, id: self.currentID}};
                    break;
            }

            self.lastURL = newUrl;
            self.currentURL = newUrl;

            self.pushToStackRequest = false;
            self.stack.push(newUrl);
        },

        saveScoopeAsURL: function (datawrapper) {
            var timestamp = +new Date().getTime(),
                rootModule = getRootView(document.body),
                rootView = core.getView(rootModule.content),
                animation = (datawrapper.animation) ? datawrapper.animation : core.options.defaultAnimation,
                children = buildURL(rootView);

            if (children && children.length > 0) {
                rootModule.children = children;
            }
            this.navigate(packURL(rootModule, timestamp, animation));
        },

        onNewTransition: function (data) {
            this.toBack = true;
            this.isBlocked = false;
            this.pushToStackRequest = data.container_id + data.content;
        },

        back: function () {
            this.toBack = true;
            switch (routerType) {
                case "native":
                case "hashbang":
                    history.back();
                    break;
                case "custom":
                    var state = stubStack.pop();
                    if (state) {
                        router.onPopState(state);
                    }
                    break;
            }
        },

        clearAndBlock: function () {
            this.toBack = true;
            this.isBlocked = true;
            this.currentURL = undefined;
            this.lastURL = undefined;
            this.currentID = Math.floor(Math.random() * 100000);

            this.stack.clear();
            stubStack = [];
            stubStack.last = null;
        },

        extractDiffer: function (oldLayout, newLayout) {
            var i,
                l,
                result,
                attr;

            for (attr in oldLayout) {
                if (oldLayout.hasOwnProperty(attr) && attr !== "children") {
                    if (oldLayout[attr] !== newLayout[attr]) {
                        delete newLayout.children;
                        return newLayout;
                    }
                }
            }

            if (oldLayout.hasOwnProperty('children')) {
                for (i = 0, l = oldLayout.children.length; i < l; i += 1) {
                    result = this.extractDiffer(oldLayout.children[i], newLayout.children[i]);
                    if (result) {
                        return result;
                    }
                }
            }

            return result;
        },

        onPopState: function (event) {
            var param,
                differ,
                directionStr,
                changeDirection = false,
                flagToBackDirection = this.toBack;

            if (event.state && event.state.id === this.currentID && this.currentURL && !this.isBlocked) {

                if (this.lastURL && this.lastURL === event.state.url) {
                    changeDirection = true;
                    flagToBackDirection = !flagToBackDirection;
                }

                if (flagToBackDirection) {
                    param = this.stack.getPrevious();
                } else {
                    param = this.stack.getNext();
                }

                directionStr = (this.toBack) ? 'back' : 'forward';
                if (param) {
                    if (changeDirection) {
                        this.toBack = !this.toBack;
                    }
                    differ = this.extractDiffer(unpackURL(this.currentURL).urlObj, unpackURL(param).urlObj);
                    differ.direction = this.toBack;
                    differ.animation = this.toBack ? unpackURL(this.currentURL).animation : unpackURL(param).animation;
                    // replace -in and -out suffix for correct back animation
                    differ.animation = differ.animation.replace(/-in$|-out$/, function(sufix) {
                        if (sufix === '-in') {
                            return '-out';
                        } else {
                            return '-in';
                        }
                    });

                    core.publish("navigation.back", differ);

                    this.lastURL = this.currentURL;
                    this.currentURL = param;
                    differ.direction = directionStr;

                    core.publish('backstack.pop', differ);
                } else {
                    core.publish('backstack.empty', {direction: directionStr});
                }
            }
        }
    };

    function onMessage(channel, data) {
        var parts = channel.split('.');
        switch (parts[1]) {
            case 'beginTransition':
                router.onNewTransition(data);
                break;
            case 'endTransition':
                if (router.pushToStackRequest === (data.container_id + data.content)) {
                    router.saveScoopeAsURL(data);
                }
                break;
            case 'back':
                router.back();
                break;
            case 'clear':
                router.clearAndBlock();
                break;
        }
    }

    //initialization (auto constructor)
    core.subscribe('router', onMessage, self);

    switch (routerType) {
        case "native":
            core.window.onpopstate = function (event) {
                router.onPopState(event);
            };
            break;
        case "hashbang":
            $(window).bind('hashchange', function () {
                var tmp = window.location.href.substring(window.location.href.lastIndexOf('#!') + 2),
                    strings = tmp.split(ID_SEPARATOR),
                    href = strings[0],
                    id = parseInt(strings[1], 10);

                if (!toForward) {
                    router.onPopState({state: {id: id, url: href}});
                }
                toForward = false;
            });
            break;
        case "custom":
            // do nothing because use 'router.back' message
            break;
    }

    self.destroy = function () {
        core.unsubscribe(self);
    };

    return self;
}

if (typeof exports !== "undefined") {
    exports.module = BackStack;
}