function Navigator() {
    var self = this,
        core = RAD.core,
        id = this.radID,
        defaultBackstack = (core.options && core.options.defaultBackstack !== undefined) ? core.options.defaultBackstack : false;

    function getSubviewsID(view) {
        var i,
            j,
            children,
            index,
            length,
            childID,
            views,
            result = [];

        if (!view) {
            return result;
        }

        children = view.getChildren();
        for (index = 0, length = children.length; index < length; index += 1) {
            childID = children[index].content;
            result.push(childID);
            views = getSubviewsID(core.getView(childID));
            for (i = 0, j = views.length; i < j; i += 1) {
                result.push(views[i]);
            }
        }
        return result;
    }

    function publishToGroup(msg, subscrabers) {
        var i, l;

        for (i = 0, l = subscrabers.length; i < l; i += 1) {
            core.publish(subscrabers[i] + '.' + msg);
        }
    }

    function setupPopupPosition(popup, target, gravity, width, height) {
        var winW = window.innerWidth,
            winH = window.innerHeight,
            popupW = width || popup.clientWidth,
            popupH = height || popup.clientHeight,
            popupX = 0,
            popupY = 0,

            $target = target ? $(target) : $(document.body),
            targetY = $target.offset().top,
            targetX = $target.offset().left,
            targetW = $target.outerWidth(),
            targetH = $target.outerHeight(),

            nullTargetOffsetX = target ? 0 : popupW,
            nullTargetOffsetY = target ? 0 : popupH,

            gravityEnable = gravity && ("top bottom left right center".indexOf(gravity) !== -1),
            popupStyle = window.getComputedStyle(popup),
            pointer = popup.querySelector('.popup-pointer'),
            pointerOffsetLeft = 0,
            pointerOffsetTop = 0;

        function inRect(left, top, right, bottom, width, height) {
            return (width < (right - left)) && (height < (bottom - top));
        }

        if (!gravityEnable) {
            gravity = 'center';
            if (inRect(0, 0, targetX, winH, popupW, popupH)) {
                gravity = 'left';
            }
            if (inRect(0, targetY + targetH, winW, winH, popupW, popupH)) {
                gravity = 'bottom';
            }
            if (inRect(targetX + targetW, 0, winW, winH, popupW, popupH)) {
                gravity = 'right';
            }
            if (inRect(0, 0, winW, targetY, popupW, popupH)) {
                gravity = 'top';
            }
        }

        //setup popup position
        switch (gravity) {
            case 'center':
                popupX = (winW - popupW) / 2;
                popupY = (winH - popupH) / 2;
                break;
            case 'top':
                popupX = targetX - popupW / 2 + targetW / 2;
                popupY = targetY - popupH + nullTargetOffsetY;
                break;
            case 'bottom':
                popupX = targetX - popupW / 2 + targetW / 2;
                popupY = targetY + targetH - nullTargetOffsetY;
                break;
            case 'left':
                popupY = targetY - popupH / 2 + targetH / 2;
                popupX = targetX - popupW + nullTargetOffsetX;
                break;
            case 'right':
                popupY = targetY - popupH / 2 + targetH / 2;
                popupX = targetX + targetW - nullTargetOffsetX;
                break;
            default:
                break;
        }

        popup.style.left = Math.round(popupX + window.pageXOffset) + 'px';
        popup.style.top = Math.round(popupY + window.pageYOffset) + 'px';
        popup.style.width = width + 'px';
        popup.style.height = height + 'px';

        //setup pointer position
        if (pointer) {
            pointer.style.top = '';
            pointer.style.left = '';
            pointer.className = 'popup-pointer ' + gravity;

            if (gravity === 'top' || gravity === 'bottom') {
                pointerOffsetLeft = (pointer.offsetWidth / 2) + parseInt(popupStyle.paddingLeft, 10);
                pointer.style.left = (targetX + Math.round(target.offsetWidth / 2)) - popupX - pointerOffsetLeft + 'px';
            }
            if (gravity === 'left' || gravity === 'right') {
                pointerOffsetTop = (pointer.offsetHeight / 2) + parseInt(popupStyle.paddingTop, 10);
                pointer.style.top = (targetY + Math.round(target.offsetHeight / 2)) - popupY - pointerOffsetTop + 'px';
            }
        }
    }

    function getParentViewIDForSelector(selector) {
        var result;

        function recursion(element) {
            if (!element || !element.parentNode) {
                return null;
            }

            element = element.parentNode;
            if (element && element.getAttribute) {
                result = element.getAttribute('view');
                if (result) {
                    return result;
                } else {
                    return recursion(element);
                }
            }
        }

        return (typeof selector === 'string') ? recursion(core.document.querySelector(selector)) : null;
    }

    //remove old child from parent view and add new information about child
    function updateChildren(datawrapper) {
        var parentViewID = getParentViewIDForSelector(datawrapper.container_id), parentView, children,
            newChildOptions, index, length, child;

        if (parentViewID) {
            parentView = core.getView(parentViewID);
            children = parentView.getChildren();
            newChildOptions = {
                container_id: datawrapper.container_id,
                content: datawrapper.content,
                animation: datawrapper.animation
            };

            if (children) {
                for (index = 0, length = children.length; index < length; index += 1) {
                    child = children[index];
                    if (child.container_id === newChildOptions.container_id) {
                        children.splice(index, 1);
                        break;
                    }
                }
            }

            children.push(newChildOptions);
        }
    }

    function renderView(view, callback) {
        if (view && view.renderRequest) {
            view.loader.doneFirstTask(function () {
                view.render(callback);
            });
        } else {
            if (typeof callback === 'function') {
                callback();
            }
        }
    }

    function navigateView(data) {
        var animation, container, oldViewId, newViewId, oldView, newView, detachedViews, attachedViews, attachViews;

        animation = data.animation || core.options.defaultAnimation;
        // prepare animation by suffix
        if (animation !== 'none' && animation.indexOf('-in') === -1 && animation.indexOf('-out') === -1) {
            if (data.direction) {
                animation += '-out';
            } else {
                animation += '-in';
            }
        }

        container = data.container_id.tagName ? data.container_id : document.querySelector(data.container_id);
        oldViewId = container.getAttribute('view');
        oldView = core.getView(oldViewId);
        newViewId = data.content;
        newView = core.getView(newViewId, core.extractExtras(data));

        if (newViewId && !newView) {
            window.console.log('View not found:' + newViewId);
        }

        detachedViews = getSubviewsID(oldView);
        attachedViews = getSubviewsID(newView);
        detachedViews.push(oldViewId);
        attachedViews.push(newViewId);

        if (oldViewId === newViewId) {
            window.console.log('You try to navigate the same view:' + newViewId);
            if (data && data.callback)
                data.callback(data, newView ? newView.el : null, oldView ? oldView.el : null, container);
            return;
        }

        attachViews = function () {
            var fakeContainer = document.querySelector('[view="' + newViewId + '"]');
            if (fakeContainer) {
                fakeContainer.removeAttribute('view');
            }

            publishToGroup('attach_start', attachedViews);
            container.setAttribute('view', newViewId);

            core.publish('animateTransition', {
                container: container,
                pageIn: newView ? newView.el : null,
                pageOut: oldView ? oldView.el : null,
                animation: animation,
                beforeTransition: function() {
                    if (data.beforeTransition) {
                        return data.beforeTransition.apply(arguments);
                    }
                },
                onTransitionStart: function () {
                    publishToGroup('attach', attachedViews);
                },
                onTransitionEnd: function (pageIn, pageOut, container) {
                    updateChildren(data);

                    publishToGroup('detach', detachedViews);
                    publishToGroup('attach_complete', attachedViews);

                    if (typeof data.callback === 'function') {
                        data.callback(data, pageIn, pageOut, container);
                    }

                    core.publish("router.endTransition", data);
                }
            });

        };

        renderView(newView, attachViews);
    }

    // helper function
    function stopPropagation(e) {
        e.stopPropagation();
    }

    function showSingle(data) {
        var viewId, view, attachView;

        viewId = data.content;
        view   = core.getView(viewId, data.extras);
        data.animation    = data.animation || 'fade';
        view.el.animation = data.animation; // save animation name for future using in closeSingle()
        if (view.el.timeout) {
            window.clearTimeout(view.el.timeout);
        }
        // remove onCloseListener in case when we popup was reopened
        if (view.el.onCloseListener) {
            view.el.removeEventListener('click', stopPropagation, false);
            document.body.removeEventListener('click', view.el.onCloseListener, false);
            view.el.onCloseListener = null;
        }
        attachView = function () {
            core.publish(viewId + '.attach_start');
            core.publish('animateTransition', {
                pageIn: view.el,
                animation: data.animation + '-in',
                onTransitionStart: function () {
                    setupPopupPosition(view.el, data.target, data.gravity, data.width, data.height);
                    core.publish(viewId + '.attach');
                },
                onTransitionEnd: function () {
                    core.publish(viewId + '.attach_complete');
                    // setup timeout to close popup
                    if (typeof data.showTime === 'number') {
                        view.el.timeout = window.setTimeout(function() {
                            closeSingle({content: viewId});
                        }, data.showTime);
                    }
                    // setup autoclose when user click outside
                    if (data.outsideClose) {
                        view.el.onCloseListener = function(e) {
                            closeSingle({content: viewId});
                        };
                        view.el.addEventListener('click', stopPropagation, false);
                        document.body.addEventListener('click', view.el.onCloseListener, false);
                    }
                }
            });
        };
        renderView(view, attachView);
    }

    function closeSingle(data) {
        var viewId, view;

        viewId = data.content;
        view   = core.getView(viewId);
        if (view.el.timeout) {
            window.clearTimeout(view.el.timeout);
        }
        if (view.el.onCloseListener) {
            view.el.removeEventListener('click', stopPropagation, false);
            document.body.removeEventListener('click', view.el.onCloseListener, false);
            view.el.onCloseListener = null;
        }
        core.publish('animateTransition', {
            pageOut: view.el,
            animation: view.el.animation + '-out',
            onTransitionEnd: function () {
                core.publish(viewId + '.detach');
            }
        });
    }

    function showWindow(data) {
        var container = document.createElement('div'),
            className = data.className || 'modal-container',
            modals = document.body.children, i, l;

        if (data.position) {
            className += ' pos-' + data.position;
        } else {
            className += ' pos-center-center';
        }

        // check existing modal view
        for (i = 0, l = modals.length; i < l; i += 1) {
            if (modals[i].getAttribute('view') === data.content) {
                window.console.log('You try to navigate the same view:' + data.content);
                return;
            }
        }

        // setup outside close
        if (data.outsideClose) {
            container.listener = function (e) {
                if(e.target === container) {
                    closeWindow({content: data.content});
                }
            };
            container.addEventListener('click', container.listener, false);
        }

        data.animation = data.animation || 'none';
        data.container_id = container;
        container.className = className;
        container.animation = data.animation; // save animation to use it when we close dialog

        data.beforeTransition = function() {
            document.body.appendChild(container);
        };
        navigateView(data);
    }

    function closeWindow(data) {
        var container = document.querySelector('[view="' + data.content + '"]'),
            closeAnimation;

        if(!container) {
            return;
        }
        closeAnimation = container.animation && container.animation !== 'none' ? container.animation + '-out' : 'none';
        data.animation = data.animation || closeAnimation;
        data.container_id = container;
        data.content = '';
        data.callback = function (data, pageIn, pageOut, container) {
            document.body.removeChild(container);
        };

        if (container.listener) {
            container.removeEventListener('click', container.listener);
            container.listener = null;
        }

        navigateView(data);
    }

    function onNavigationEvent(channel, data) {
        var parts = channel.split('.');
        switch (parts[1]) {
            case 'show':
                // init BackStack
                if (data.backstack || defaultBackstack) {
                    core.publish("router.beginTransition", data);
                }
                navigateView(data);
                break;
            case 'back':
                data.direction = (data.direction !== undefined) ? data.direction : true;
                navigateView(data);
                break;
            case 'dialog':
                if (parts[2] === 'show') {
                    showWindow(data);
                }
                if (parts[2] === 'close') {
                    closeWindow(data);
                }
                break;
            case 'toast':
            case 'popup':
                if (parts[2] === 'show') {
                    showSingle(data);
                }
                if (parts[2] === 'close') {
                    closeSingle(data);
                }
                break;
        }
    }

    //initialization (auto constructor)
    core.subscribe('navigation', onNavigationEvent, self);
    self.viewID = id;

    self.destroy = function () {
        core.unsubscribe(self);
    };
}

exports.namespace = 'plugin.navigator';
exports.module = Navigator;
exports.type = 'plugin';