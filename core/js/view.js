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
        'use strict';
        if (!this.children) {
            this.children = [];
        }
        return this.children;
    },

    initialize: function () {
        'use strict';
        var self = this,
            children,
            core,
            extras = self.options.extras;

        function unEscape(str) {
            'use strict';
            if (!str) return str;
            return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
        }

        self.loader = RAD.Blanks.Deferred();
        self.renderRequest = true;

        // transfer options
        self.viewID = self.options.viewID;
        core = self.options.core;
        self.publish = core.publish;
        self.subscribe = core.subscribe;
        self.unsubscribe = core.unsubscribe;
        self.finish = function () {
            core.stop(self.viewID);
        };
        self.application = self.options.application;

        //delete options
        delete self.options;

        children = _.clone(self.getChildren());
        self.children = children;

        $.get(self.url, function (data) {
            var innerTemplate, wrapper, i, l, templArr;

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
        }, 'text');

        self.subscribe(self.viewID, self.receiveMsg, self);

        self.oninit();
        self.onInitialize();
        self.setExtras(extras);

        return self;
    },

    setExtras: function (extras) {
        "use strict";
        if (extras !== this.extras) {
            this.onNewExtras(extras);
            this.extras = extras;
        }
    },

    bindModel: function (model) {
        "use strict";
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
        "use strict";
        if (this.model) {
            this.stopListening(this.model);
            this.model = null;
            if (forceRender) {
                this.render();
            }
        }
    },

    changeModel: function (newModel) {
        "use strict";
        var self = this;
        self.unbindModel();
        self.bindModel(newModel);
    },

    render: function () {
        "use strict";
        var self = this,
            json = (self.model) ? self.model.toJSON() : undefined,
            children,
            index,
            length,
            arr;

        function insertSubview(parent, data) {
            var content = RAD.core.getView(data.content, data.extras),
                container = parent.$(data.container_id);

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
            });
        }

        self.onStartRender();

        //detach children
        children = self.getChildren();
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
        for (index = 0, length = children.length; index < length; index += 1) {
            insertSubview(self, children[index]);
        }

        self.onrender();
        self.onEndRender();

        self.initScrollRefresh();
        self.renderRequest = false;

        return self;
    },

    appendIn: function (container, callback) {
        "use strict";
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
                self.render();
                onEnd();
            });
        } else {
            onEnd();
        }
    },

    initScrollRefresh: function (target) {
        "use strict";
        var elem = target || this.el,
            event = document.createEvent('Event');

        event.initEvent('scrollRefresh', true, true);
        elem.dispatchEvent(event);

        this.refreshScroll();
    },

    receiveMsg: function msgFunc(msg, data) {
        "use strict";
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
        "use strict";
        var self = this;
        self.detachScroll();
        self.$el.detach();
    },

    destroy: function () {
        "use strict";
        var property,
            self = this;

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
    oninit: function () { "use strict"; },
    onattach: function () { "use strict"; },
    ondetach: function () { "use strict"; },
    onrender: function () { "use strict"; },
    ondestroy: function () { "use strict"; },

    attachScroll: function () { "use strict"; },
    refreshScroll: function () { "use strict"; },
    detachScroll: function () { "use strict"; },

    //stubs for external service callback functions
    onInitialize: function () { "use strict"; },
    onNewExtras: function () { "use strict"; },
    onReceiveMsg: function () { "use strict"; },
    onStartRender: function () { "use strict"; },
    onEndRender: function () { "use strict"; },
    onStartAttach: function () { "use strict"; },
    onEndAttach: function () { "use strict"; },
    onEndDetach: function () { "use strict"; },
    onDestroy: function () { "use strict"; }
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
        "use strict";
        var self = this,
            scrollView = self.el.querySelector('.scroll-view') || self.el;
        self.detachScroll();
        self.loader.done(function () {
            if (self.renderRequest) {
                return;
            }
            self.mScroll = new window.iScroll(scrollView, {
                bounce: false,
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
        });
    },

    onattach: function () {
        "use strict";
        var self = this;
        window.setTimeout(function () {
            if (self.mScroll) {
                self.mScroll.refresh();
                self.mScroll.scrollTo(0, self.offsetY, 0);
            }
        }, 0);
    },

    refreshScroll: function () {
        "use strict";
        if (this.mScroll) {
            this.mScroll.refresh();
        }
    },

    detachScroll: function () {
        "use strict";
        var self = this;
        if (self.mScroll) {
            self.offsetY = self.mScroll.y;
            self.mScroll.destroy();
            self.mScroll = null;
        }
    }
}));

RAD.namespace('RAD.Blanks.Toast', RAD.Blanks.View.extend({
    className: 'toast',

    closeTimeOut: undefined,

    showTime: 4000,

    close: function () {
        "use strict";
        clearTimeout(this.closeTimeOut);

        var options = {
            content: this.viewID
        };
        $(document.body).off('click.close');
        this.publish('navigation.toast.close', options);
    },

    onattach: function () {
        "use strict";
        var self = this;
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