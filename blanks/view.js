var deferred = require('./deferred').module;

var view = Backbone.View.extend({
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

    initialize: function () {
        var self = this, needBindModel, renderWrapper;

        this.loader = deferred();
        this.renderRequest = true;
        this.viewID = this.radID; // for capability with old versions
        this.finish = function () {
            RAD.core.stop(this.radID);
        };
        if (!this.children) {
            this.children = [];
        }

        // redefine render of view
        renderWrapper = this.render;
        this.render = function (callback) {
            var self = this, counter, childView, index, length, children = this.getChildren();

            function check() {
                counter -= 1;
                if (counter <= 0) {
                    self.onrender();
                    self.onEndRender();
                    self.dispatchScrollRefresh();
                    self.renderRequest = false;

                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            }

            if (!this.loader.isResolved()) {
                return;
            }

            this.onStartRender();
            counter = children.length;

            // detach children
            for (index = 0, length = children.length; index < length; index += 1) {
                if (children[index].content) {
                    childView = RAD.core.getView(children[index].content, children[index].extras);
                    if (childView) {
                        childView.detach();
                    } else {
                        window.console.log('Child view [' + children[index].content + '] is not registered. Please check parent view [' + this.radID + '] ');
                    }
                }
            }

            // view render
            renderWrapper.apply(this, [callback]);

            //attach children
            if (children.length > 0) {
                for (index = 0, length = children.length; index < length; index += 1) {
                    if (children[index].content) {
                        childView = RAD.core.getView(children[index].content, children[index].extras);
                        if (childView) {
                            this.insertSubview(children[index], check);
                        } else {
                            window.console.log('Cannot insert child view [' + children[index].content + ']. It is not registered. Please check parent view [' + this.radID + '] ');
                        }
                    }
                }
            } else {
                check();
            }
        };

        needBindModel = !this.model;
        if (typeof this.template === 'function') {
            this.bindModel(this.model);
            this.loader.resolve();
        } else if (window.JST && window.JST[this.url]) {
            this.template = window.JST[this.url];
            this.bindModel(this.model);
            this.loader.resolve();
        } else if(typeof this.url === 'string') {
            this.ajax = $.get(this.url, function (data) {
                if (self.ajax) {
                    self.template = _.template(data);
                    self.bindModel(self.model);
                    self.loader.resolve();
                }
                self.ajax = null;
            }, 'text');
        } else {
            this.bindModel(this.model);
            this.loader.resolve();
        }

        this.subscribe(this.radID, this.receiveMsg, this);
        this.oninit();
        this.onInitialize();

        if (needBindModel) {
            this.bindModel(this.model);
        }

        return this;
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
            for (i = this.listen.length - 1; i > -1; i -= 1) {
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
            container = this.el.querySelector(data.container_id);

        if (data && data.backstack) {
            RAD.core.publish("router.beginTransition", data);
        }

        content.appendIn(container, function () {
            var fakeContainer = document.querySelector('[view="' + data.content + '"]');
            if (fakeContainer) {
                fakeContainer.removeAttribute('view');
            }

            container.setAttribute('view', data.content);
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

    render: function () {
        var virtualEl = document.createElement('div'), virtualTemplates, self = this, index, length,
            json = (this.model) ? this.model.toJSON() : undefined;

        function prepareInnerTemplates() {
            var templates, i, length;

            // if innerTemplates property was set to 'false' - view was already checked and no [data-template] was found.
            if (self.innerTemplates === false) {
                return;
            }

            templates = self.el.querySelectorAll('[data-template]');

            if (templates.length) {
                // convert NodeList into Array
                self.innerTemplates = [];
                for (i = 0, length = templates.length; i < length; i++) {
                    self.innerTemplates[i] = templates[i];
                }
            } else {
                self.innerTemplates = false;
            }
        }

        try {
            if (this.innerTemplates && !this.renderRequest) {
                virtualEl.innerHTML = this.template({model: json, view: this});
                virtualTemplates = virtualEl.querySelectorAll('[data-template]');

                for (index = 0, length = this.innerTemplates.length; index < length; index++ ) {
                    this.innerTemplates[index].parentNode.replaceChild(virtualTemplates[index], this.innerTemplates[index]);
                    this.innerTemplates[index] = virtualTemplates[index];
                }
            } else {
                this.el.innerHTML = this.template({model: json, view: this});
                prepareInnerTemplates();
            }
        } catch (e) {
            window.console.log(e.message + '. Caused during rendering: '+ this.radID + ':' +  e.stack);
        }
    },

    appendIn: function (container, callback) {
        var self = this;

        if (!container) {
            window.console.log('Cannot insert view [' + self.radID + ']. Target container does not exist');
            return;
        }

        container.appendChild(this.el);
        if (this.renderRequest) {
            this.loader.doneFirstTask(function () {
                self.render(callback);
            });
        } else {
            callback();
        }
    },

    dispatchScrollRefresh: function (target) {
        var el = target || this.el,
            event = document.createEvent('Event');

        if(el.parentNode) {
            event.initEvent('scrollRefresh', true, true);
            el.parentNode.dispatchEvent(event);
        }
    },

    receiveMsg: function msgFunc(msg, data) {
        var self = this,
            parts = msg.split('.');

        switch (parts[parts.length - 1]) {
            case 'attach_start':
                self.loader.done(function () {
                    self.onBeforeAttach();
                });
                break;
            case 'attach':
                self.loader.done(function () {
                    self.onattach();
                    self.onStartAttach(msg, data);
                });
                break;
            case 'attach_complete':
                self.loader.doneLastTask(function () {
                    self.onEndAttach(msg, data);
                });
                break;
            case 'detach':
                self.ondetach();
                self.onEndDetach(msg, data);
                break;
            default:
                self.onReceiveMsg(msg, data);
                break;
        }

        return self;
    },

    detach: function () {
        if (this.$el) {
            this.$el.detach();
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

        self.unsubscribe(self);

        // Unbind view
        self.undelegateEvents();
        self.$el.removeData().off();
        // Remove view attribute from parent container
        self.$el.parent().removeAttr('view');
        //Remove view from DOM
        self.remove();

        for (property in self) {
            if (self.hasOwnProperty(property)) {
                delete self[property];
            }
        }

        return this;
    },

    //stubs for inner service callback functions
    oninit: function () {},
    onattach: function () {},
    ondetach: function () {},
    onrender: function () {},
    ondestroy: function () {},

    //stubs for external service callback functions
    onInitialize: function () {},
    onNewExtras: function () {},
    onReceiveMsg: function () {},
    onStartRender: function () {},
    onEndRender: function () {},
    onBeforeAttach: function () {},
    onStartAttach: function () {},
    onEndAttach: function () {},
    onEndDetach: function () {},
    onDestroy: function () {}
});

exports.namespace = 'RAD.Blanks.View';
exports.module = view;
exports.type = 'namespace';