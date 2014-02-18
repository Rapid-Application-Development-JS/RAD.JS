RAD.namespace('RAD.Blanks.Deferred', function () {
    "use strict";

    return {
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
});

RAD.namespace('RAD.Blanks.View', Backbone.View.extend({
    className: 'backbone-view',

    attributes: {
        'data-role': 'view'
    },

    listen: ['add', 'remove', 'fetch', 'sort', 'change', 'reset'],

    getChildren: function () {
        if (!this.children) {
            this.children = [];
        }
        return this.children;
    },

    initialize: function (options) {
        var self = this,
            children,
            core,
            extras = options.extras;

        function unEscape(str) {
            if (!str) return str;
            return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
        }

        self.loader = RAD.Blanks.Deferred();
        self.renderRequest = true;

        // transfer options
        self.viewID = options.viewID;
        core = options.core;
        self.publish = core.publish;
        self.subscribe = core.subscribe;
        self.unsubscribe = core.unsubscribe;
        self.finish = function () {
            core.stop(self.viewID);
        };
        self.application = options.application;

        //delete options
        delete self.options;

        children = _.clone(self.getChildren());
        self.children = children;

        self.ajax = $.get(self.url, function (data) {
            var innerTemplate, wrapper, i, l, templArr;
            if (self.ajax) {
                templArr = window.$('<div></div>').html(data).find('[data-template]');
                if (templArr.length > 0) { self.innerTemplate = []; }
                for (i = 0, l = templArr.length; i < l; i += 1) {
                    wrapper = templArr.get(i);
                    innerTemplate = wrapper.innerHTML;
                    self.innerTemplate[i] = _.template(unEscape(innerTemplate));
                }

                self.template = _.template(data);
                self.bindModel(self.model);
                self.loader.resolve();
            }
            self.ajax = null;
        }, 'text');

        self.subscribe(self.viewID, self.receiveMsg, self);

        self.oninit();
        self.onInitialize();
        self.setExtras(extras);

        return self;
    },

    setExtras: function (extras) {
        if (extras !== this.extras) {
            this.onNewExtras(extras);
            this.extras = extras;
        }
    },

    bindModel: function (model) {
        var self = this, i;
        if (model) {
            self.model = model;
            for (i = this.listen.length - 1; i > -1; i -=1) {
                self.listenTo(model, self.listen[i], self.render);
            }
            if (self.template && !self.renderRequest) {
                model.trigger('change');
            }
        }
    },

    unbindModel: function (forceRender) {
        if (this.model) {
            this.stopListening(this.model);
            this.model = null;
            if (forceRender) {
                this.render();
            }
        }
    },

    changeModel: function (newModel) {
        var self = this;
        self.unbindModel();
        self.bindModel(newModel);
    },

    insertSubview: function (data, callback) {
        var content = RAD.core.getView(data.content, data.extras),
            container = this.$(data.container_id);

        if (data && data.backstack) {
            RAD.core.publish("router.beginTransition", data);
        }

        content.appendIn(container, function () {
            container.attr('view', data.content);
            if (typeof data.callback === 'function') {
                if (typeof data.context === 'object') {
                    data.callback.call(data.context);
                } else {
                    data.callback();
                }
            }

            if (typeof callback === 'function') {
                callback();
            }
        });
    },

    render: function (callback) {
        var self = this,
            json = (self.model) ? self.model.toJSON() : undefined,
            children = self.getChildren(),
            counter = children.length,
            index,
            length,
            arr;

        function check() {
            counter -= 1;
            if (counter <= 0) {
                self.onrender();
                self.onEndRender();
                self.initScrollRefresh();
                self.renderRequest = false;

                if (typeof callback === 'function') {
                    callback();
                }
            }
        }

        self.onStartRender();

        //detach children
        for (index = 0, length = children.length; index < length; index += 1) {
            RAD.core.getView(children[index].content, children[index].extras).detach();
        }

        try {
            if (self.innerTemplate && !self.renderRequest) {
                for (index = 0, length = self.innerTemplate.length; index < length; index += 1) {
                    $(self.$inner[index]).html(self.innerTemplate[index].apply(self, [{model: json}]));
                }
            } else {
                self.$el.html(self.template({model: json}));

                if (self.innerTemplate) {
                    self.$inner = [];
                    arr = self.$('[data-template]');
                    for (index = 0, length = self.innerTemplate.length; index < length; index += 1) {
                        self.$inner[index] = arr.get(index);
                    }
                }
            }
        } catch (e) {
            window.console.log('Error rendering in' + self.viewID + ': ' + e.toString());
            return self;
        }

        //attach children
        if (children.length > 0) {
            for (index = 0, length = children.length; index < length; index += 1) {
                this.insertSubview(children[index], check);
            }
        } else {
            check();
        }

        return self;
    },

    appendIn: function (container, callback) {
        var self = this, $container = $(container);

        if (!container || $container.length === 0) {
            window.console.log('Container for ' + self.viewID + ' doesn\'t exist!');
            return;
        }

        function onEnd() {
            self.attachScroll();
            callback();
        }

        $container.append(self.$el);
        if (self.renderRequest) {
            self.loader.doneFirstTask(function () {
                self.render(onEnd);
            });
        } else {
            onEnd();
        }
    },

    initScrollRefresh: function (target) {
        var elem = target || this.el,
            event = document.createEvent('Event');

        event.initEvent('scrollRefresh', true, true);
        elem.dispatchEvent(event);

        this.refreshScroll();
    },

    receiveMsg: function msgFunc(msg, data) {
        var self = this,
            parts = msg.split('.');

        switch (parts[2]) {
            case 'attach':
                self.loader.done(function () {
                    self.onattach();
                    self.onStartAttach(msg, data);
                });
                break;
            case 'detach':
                self.ondetach();
                self.onEndDetach(msg, data);
                break;
            case 'attach_complete':
                self.loader.doneLastTask(function () {
                    self.onEndAttach(msg, data);
                });
                break;
            default:
                self.onReceiveMsg(msg, data);
                break;
        }

        return self;
    },

    detach: function () {
        var self = this;
        self.detachScroll();
        if (self.$el) {
            self.$el.detach();
        }
    },

    destroy: function () {
        var property,
            self = this;

        if (self.ajax) {
            self.ajax.abort();
            self.ajax = null;
        }

        self.onDestroy();
        self.ondestroy();
        self.unbindModel();
        self.off(null, null, self);

        self.unsubscribe(self.viewID, self);

        //COMPLETELY UNBIND THE VIEW
        self.undelegateEvents();
        self.$el.removeData().unbind();

        //Remove view from DOM
        self.remove();
        window.Backbone.View.prototype.remove.call(self);

        for (property in self) {
            if (self.hasOwnProperty(property)) {
                delete self[property];
            }
        }

        return this;
    },

    //stubs for inner service callback functions
    oninit: function () {},
    onattach: function () {
        this.el.offsetHeight;
    },
    ondetach: function () {},
    onrender: function () {},
    ondestroy: function () {},

    attachScroll: function () {},
    refreshScroll: function () {},
    detachScroll: function () {},

    //stubs for external service callback functions
    onInitialize: function () {},
    onNewExtras: function () {},
    onReceiveMsg: function () {},
    onStartRender: function () {},
    onEndRender: function () {},
    onStartAttach: function () {},
    onEndAttach: function () {},
    onEndDetach: function () {},
    onDestroy: function () {}
}));

RAD.namespace('RAD.Blanks.Service', RAD.Class.extend({
    initialize: function (options) {
        "use strict";
        this.publish = options.core.publish;
        this.subscribe = options.core.subscribe;
        this.unsubscribe = options.core.unsubscribe;
        this.serviceID = this.viewID = options.viewID;
        this.application = options.application;

        this.subscribe(this.serviceID, this.onReceiveMsg, this);
        this.onInitialize();
    },
    destroy: function () {
        "use strict";
        this.onDestroy();
        this.unsubscribe(null, this);
    },
    onInitialize: function () {
        "use strict";
    },
    onReceiveMsg: function () {
        "use strict";
    },
    onDestroy: function () {
        "use strict";
    }
}));

RAD.namespace('RAD.Blanks.ScrollableView', RAD.Blanks.View.extend({

    className: 'scroll-view',
    offsetY: 0,

    attachScroll: function () {
        var self = this,
            scrollView = self.el.querySelector('.scroll-view') || self.el;

        if (self.mScroll) {
            return;
        }

        self.mScroll = new window.iScroll(scrollView, {
            bounce: true,
            onBeforeScrollStart: function (e) {
                var target = e.target;

                while (target.nodeType !== 1) {
                    target = target.parentNode;
                }
                if (target.tagName !== 'SELECT' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                }
            }
        });
    },

    onattach: function () {
        var self = this;
        window.setTimeout(function () {
            if (self.mScroll) {
                self.mScroll.refresh();
                self.mScroll.scrollTo(0, self.offsetY, 0);
            }
        }, 0);
    },

    refreshScroll: function () {
        if (this.mScroll) {
            this.mScroll.refresh();
        }
    },

    detachScroll: function () {
        if (this.mScroll) {
            this.offsetY = this.mScroll.y;
            this.mScroll.destroy();
            this.mScroll = null;
        }
    }
}));

RAD.namespace('RAD.Blanks.Toast', RAD.Blanks.View.extend({
    className: 'toast',

    closeTimeOut: undefined,

    showTime: 4000,

    oninit: function () {
        var self = this;
        self.refreshTimeout = function () {
            clearTimeout(self.closeTimeOut);
            self.closeTimeOut = window.setTimeout(function () {
                self.close(self);
            }, self.showTime);
        };
    },

    setExtras: function (extras) {
        if (extras !== this.extras) {
            this.refreshTimeout();
            this.onNewExtras(extras);
            this.extras = extras;
        }
    },

    close: function (context) {
        var self = context || this,
            options = { content: self.viewID };

        clearTimeout(self.closeTimeOut);
        $(document.body).off('click.close');

        if (self.publish) {
            self.publish('navigation.toast.close', options);
        }
    },

    onattach: function () {
        var self = this;
        clearTimeout(self.closeTimeOut);
        self.closeTimeOut = window.setTimeout(function () {
            self.close();
        }, self.showTime);

        $(document.body).one('click.close', function () {
            self.close();
        });
    }
}));

RAD.namespace('RAD.Blanks.Popup', RAD.Blanks.ScrollableView.extend({
    className: 'popup',

    close: function () {
        "use strict";
        var self = this,
            options = {
                content: self.viewID,
                destroy: self.onCloseDestroy
            },
            viewID,
            array = self.viewID.split('.');
        viewID = array[array.length - 1];

        $(document.body).off('tapdown.' + viewID);
        $(document.body).off('click.' + viewID);

        self.publish('navigation.popup.close', options);
    },

    onattach: function (msg, data) {
        "use strict";
        var self = this,
            viewID,
            array = self.viewID.split('.');

        RAD.Blanks.ScrollableView.prototype.onattach.call(self);

        viewID = array[array.length - 1];
        function close() {
            self.close();
        }
        function stopPropagation(e) {
            e.stopPropagation();
        }

        if (self.outSideClose) {
            self.$el.on('tapdown.' + viewID, stopPropagation);
            self.$el.on('click.' + viewID, stopPropagation);
            $(document.body).one('tapdown.' + viewID, close);
            $(document.body).one('click.' + viewID, close);
        }

        $(window).one('orientationchange.' + viewID, close);
    },

    ondetach: function () {
        "use strict";
        var self = this,
            viewID,
            array = self.viewID.split('.');

        viewID = array[array.length - 1];

        $(document.body).off('tapdown.' + viewID);
        $(document.body).off('click.' + viewID);
        self.$el.off('tapdown.' + viewID);
        self.$el.off('click.' + viewID);
        $(window).off('orientationchange.' + viewID);
    }
}));