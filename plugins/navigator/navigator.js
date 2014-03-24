RAD.plugin("plugin.navigator", function (core, id) {
    var self = {},
        window = core.window,
        defaultAnimation = core.options.defaultAnimation || 'slide',
        animationTimeout = core.options.animationTimeout || 1000,
        transEndEventName = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd animationend webkitAnimationEnd oanimationend MSAnimationEnd',
        overlay,
        defaultSaveInBackstack = (core.options && core.options.defaultBackstack !== undefined) ? core.options.defaultBackstack : false,
        ieVersion,
        ieLessThanTen = false,
        animator;

    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { //test for MSIE x.x;
        ieVersion = new Number(RegExp.$1); // capture x.x portion and store as a number
        if ( ieVersion < 10) {
            ieLessThanTen = true;
        }
    }

    function apply(callback, context, data) {
        if (typeof callback !== 'function') { return; }
        if (typeof context === 'object') {
            callback.apply(context, [data]);
        } else {
            callback(data);
        }
    }

    function getViewIDBySelector(root, selector) {
        var result,
            element = root.querySelector(selector);
        if (element && element.getAttribute) {
            result = element.getAttribute('view');
        }
        return result;
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

        return recursion(core.document.querySelector(selector));
    }


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

    function setupPopupPosition(popup, target, gravity, width, height) {
        var winW = window.innerWidth,
            winH = window.innerHeight,
            popupW = width || 150,
            popupH = height || 150,
            popupX = 0,
            popupY = 0,
            $target =  $(target),
            targetY = $target.offset().top,
            targetX = $target.offset().left,
            targetW = $target.outerWidth(),
            targetH = $target.outerHeight(),
            gravityEnable = (gravity && gravity.length > 0 && ("top bottom left right center".indexOf(gravity) !== -1)),
            popupStyle = window.getComputedStyle(popup),
            pointer = popup.querySelector('.popup-pointer'),
            pointerOffsetLeft = 0,
            pointerOffsetTop = 0;

        //autoposition
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
            popupY = targetY - popupH;
            break;
        case 'bottom':
            popupX = targetX - popupW / 2 + targetW / 2;
            popupY = targetY + targetH;
            break;
        case 'left':
            popupY = targetY - popupH / 2 + targetH / 2;
            popupX = targetX - popupW;
            break;
        case 'right':
            popupY = targetY - popupH / 2 + targetH / 2;
            popupX = targetX + targetW;
            break;
        default:
            break;
        }

        popup.style.left = Math.max(Math.round(popupX + window.pageXOffset), 0) + 'px';
        popup.style.top = Math.max(Math.round(popupY + window.pageYOffset), 0) + 'px';
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

    function setToastGravity(el, gravity) {
        var x = 0, y = 0,
            w = el.offsetWidth,
            h = el.offsetHeight,
            width = window.innerWidth,
            height = window.innerHeight;

        switch (gravity) {
        case 'center':
            x = (width - w) / 2;
            y = (height - h) / 2;
            break;
        case 'left':
            y = (height - h) / 2;
            break;
        case 'right':
            x = width - w;
            y = (height - h) / 2;
            break;
        case 'bottom':
            x = (width - w) / 2;
            y = height - h;
            break;
        default:
            x = (width - w) / 2;
            break;
        }
        el.style.left = Math.round(x + window.pageXOffset) + 'px';
        el.style.top = Math.round(y + window.pageYOffset) + 'px';
    }

    function Animator() {
        var self = {};

        self.inAnimation = 0;

        function publish(msg, subscrabers) {
            var index,
                length;
            for (index = 0, length = subscrabers.length; index < length; index += 1) {
                core.publish(subscrabers[index] + '.' + msg);
            }
        }

        self.animate = function (datawrapper, revers) {
            var newPage, oldPage, newView, oldView,
                container,
                parent,
                effectName,
                animationName = '',
                endFunc,
                done = false,
                previous,
                attachedViews,
                detachedViews = [],
                parentViewID,
                parentView,
                children,
                child,
                newChildOptions,
                index,
                length;

            /* IMPORTANT: remove focus from active elements (inputs, textareas etc) before view is detached.
             * Otherwise content can disappear (not render properly) on iOS device after detaching old view/view
             * in case if some element was focused before detaching.
             */
            if (window.document.activeElement) {
                window.document.activeElement.blur(); // remove focus from active element
            }

            if (datawrapper === null || datawrapper === undefined) {
                return;
            }

            effectName = datawrapper.animation || defaultAnimation;
            container = core.$(datawrapper.container_id);
            // new adding view
            newView = core.getView(datawrapper.content, core.extractExtras(datawrapper));
            previous = container.attr('view');

            // old removing view
            oldView = previous ? core.getView(previous) : undefined;

            if (oldView && oldView.viewID === (newView && newView.viewID)) {
                window.console.log("You try navigate the same view:" + oldView.viewID + " as old and new widget!");
                return;
            }

            // clear old container attr
            var oldContainer = document.querySelector('[view="' + datawrapper.content + '"]');
            if (oldContainer) {
                oldContainer.removeAttribute('view');
            }

            // get array of detached viewsID
            parent = getViewIDBySelector(core.document, datawrapper.container_id);
            if (parent) {
                detachedViews = getSubviewsID(core.getView(parent));
                detachedViews.push(parent);
            }

            // get array attached viewsID
            attachedViews = getSubviewsID(newView);
            attachedViews.push(datawrapper.content);

            //remove old child from parent view and add new information about child
            parentViewID = getParentViewIDForSelector(datawrapper.container_id);
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

                if (newChildOptions.content) {
                    children.push(newChildOptions);
                }
            }

            container.attr('view', datawrapper.content);

            function startAnimation() {
                if (newView && newView.el) {
                    // Force the browser to calculate new element styles, before CSS animation start
                    window.getComputedStyle(newView.el, null).getPropertyValue('left');

                    publish('attach', attachedViews);
                }

                // Start CSS animation
                if (!newView && !oldView) {
                    overlay.removeClass('show');
                } else {
                    container.addClass('animate');
                }
            }

            function showView() {
                if (oldPage) {
                    oldPage.addClass('old-page ' + animationName);
                }
                if (newPage) {
                    newPage.addClass('new-page ' + animationName);
                    newView.appendIn(container, startAnimation);
                } else {
                    startAnimation();
                }
            }

            function callEnd() {
                self.inAnimation -= 1;
                if (self.inAnimation === 0) {
                    overlay.removeClass('show');
                }

                apply(datawrapper.callback, datawrapper.context, [newView, oldView]);
                publish('detach', detachedViews);
                publish('attach_complete', attachedViews);

                //create url for navigation
                core.publish("router.endTransition", datawrapper);
            }

            newPage = newView ? newView.$el : undefined;
            oldPage = oldView ? oldView.$el : undefined;

            overlay.addClass('show');
            self.inAnimation += 1;

            if (datawrapper.animation === 'none' || (defaultAnimation === 'none' && !datawrapper.animation) || ieLessThanTen) {
                if (oldView) {
                    oldView.detach();
                }

                if (newPage) {
                    newView.appendIn(datawrapper.container_id, function () {
                        publish('attach', attachedViews);
                    });
                }
                callEnd();
            } else {
                endFunc = function (e) {
                    var flag = e && ((newView && e.target === newView.el) || (oldView && e.target === oldView.el));

                    if (done || !flag) {
                        return;
                    }

                    container.removeClass('animate');
                    if (newPage) {
                        newPage.removeClass('new-page ' + animationName);
                    }
                    if (oldPage) {
                        oldPage.removeClass('old-page ' + animationName);
                        oldView.detach();
                    }
                    container.off(transEndEventName, endFunc);

                    callEnd();
                    done = true;
                };

                container.on(transEndEventName, endFunc);
                window.setTimeout(endFunc, 4000);

                if (revers) {
                    if (effectName.indexOf('-out') !== -1) {
                        animationName = effectName.replace('-out', '-in');
                    } else if (effectName.indexOf('-in') !== -1) {
                        animationName = effectName.replace('-in', '-out');
                    } else {
                        animationName = effectName + '-out';
                    }
                } else {
                    if ((effectName.indexOf('-out') !== -1) || (effectName.indexOf('-in') !== -1)) {
                        animationName = effectName;
                    } else {
                        animationName = effectName + '-in';
                    }
                }
                showView();
            }
        };

        return self;
    }

    function showModal(data, type) {
        var newView = core.getView(data.content, core.extractExtras(data)),
            $element,
            endFunc,
            done = false;
        if (newView === null || newView === undefined) {
            return;
        }

        if (newView.isShown) {
            return;
        }
        newView.isShown = true;

        if (data.animation) {
            newView.animation = data.animation;
        }

        $element = newView.$el;
        endFunc = function () {
            if (done) {
                return;
            }
            done = true;

            apply(data.callback, data.context, newView);
            overlay.removeClass('show');
            $element.off(transEndEventName, endFunc);
            $element.off('cssClassChanged', endFunc);
            core.publish(data.content + '.' + 'attach_complete', null);
            newView = null;
        };

        if (!(newView.animation === 'none' || (defaultAnimation === 'none' && !newView.animation) || ieLessThanTen)) {
            $element.addClass('animate');
            $element.on(transEndEventName, endFunc);
        } else {
            $element.on('cssClassChanged', endFunc);
        }

        overlay.addClass('show');
        window.setTimeout(endFunc, animationTimeout);

        newView.appendIn('body', function () {
            $element.attr('id', data.content);

            switch (type) {
            case 'dialog':
                $element.addClass('lightbox');
                break;
            case 'toast':
                setToastGravity(newView.el, data.gravity);
                break;
            case 'popup':
                setupPopupPosition(newView.el, data.target, data.gravity, data.width, data.height);
                break;
            }

            $element.width();
            window.setTimeout(function() {
                core.publish(data.content + '.' + 'attach', null);
                $element.trigger('cssClassChanged');
            }, 0);
            $element.addClass('show');
        });
    }

    function closeModal(data) {
        var oldDialog = core.getView(data.content),
            oldElement = oldDialog.$el,
            endFunc,
            done = false;

        /* IMPORTANT: remove focus from active elements (inputs, textareas etc) before view is detached.
         * Otherwise content can disappear (not render properly) on iOS device after detaching old view/view
         * in case if some element was focused before detaching.
         */
        if (window.document.activeElement) {
            window.document.activeElement.blur(); // remove focus from active element
        }

        endFunc = function () {
            if (done) {
                return;
            }
            done = true;

            oldDialog.detach();
            apply(data.callback, data.context, oldDialog);
            overlay.removeClass('show');
            oldElement.removeClass('animate');
            oldElement.off(transEndEventName, endFunc);
            oldElement.off('cssClassChanged', endFunc);

            core.publish(data.content + '.' + 'detach', null);

            //destroy dialog
            if (!data || data.destroy === undefined || data.destroy === true) {
                core.stop(data.content);
            } else {
                oldDialog.isShown = false;
            }
            oldDialog = null;
        };

        overlay.addClass('show');

        if (!(oldDialog.animation === 'none' || (defaultAnimation === 'none' && !oldDialog.animation) || ieLessThanTen)) {
            oldElement.on(transEndEventName, endFunc);
        }
        else {
            oldElement.on('cssClassChanged', endFunc);
        }

        window.setTimeout(function () {
            endFunc();
        }, animationTimeout);

        oldElement.removeClass('show');

        window.setTimeout(function() {
            oldElement.trigger('cssClassChanged');
        }, 0);
    }

    function isArray(value) {
        return (Object.prototype.toString.call(value) === '[object Array]');
    }

    function onNavigationEvent(channel, data) {
        var parts = channel.split('.'),
            index,
            direction,
            length;

        function initBackstack(dataWrapper) {
            var bkstk = dataWrapper ? dataWrapper.backstack : undefined;
            if (bkstk || (defaultSaveInBackstack && bkstk === undefined)) {
                core.publish("router.beginTransition", dataWrapper);
            }
        }

        switch (parts[1]) {
        case 'show':
            if (isArray(data)) {
                for (index = 0, length = data.length; index < length; index += 1) {
                    initBackstack(data[index]);
                    animator.animate(data[index], false);
                }
            } else {
                initBackstack(data);
                animator.animate(data, false);
            }
            break;
        case 'back':
            direction = (data.direction !== undefined) ? data.direction : true;
            animator.animate(data, direction);
            break;
        case 'toast':
        case 'popup':
        case 'dialog':
            switch (parts[2]) {
                case 'show':
                    showModal(data, parts[1]);
                    break;
                case 'close':
                    closeModal(data);
                    break;
            }
            break;
        }
    }

    //initialization (auto constructor)
    // you should call instantiate NavManager after DOM was loaded
    animator = new Animator();
    core.subscribe('navigation', onNavigationEvent, self);
    overlay = core.$('#overlay');
    self.viewID = id;

    self.destroy = function () {
        core.unsubscribe(onNavigationEvent, self);
    };

    return self;
});