var animateTransition = (function(){
    "use strict";
    var prefixes = ["webkit", "moz", "MS", "o", ""],
        overlay = document.createElement('div');

    overlay.className = 'transition-overlay';

    // Utils
    function showOverlay() {
        document.body.appendChild(overlay);
    }
    function hideOverlay() {
        if (overlay.parentNode) {
            document.body.removeChild(overlay);
        }
    }
    function getElement(selector) {
        if (!selector) {
            return null;
        }
        return selector.tagName ? selector : document.querySelector(selector);
    }
    function addPrefixedEvent(element, eventName, callback) {
        for (var i = 0; i < prefixes.length; i++) {
            if (!prefixes[i]) {
                eventName = eventName.toLowerCase();
            }
            element.addEventListener(prefixes[i]+eventName, callback, false);
        }
    }
    function removePrefixedEvent(element, eventName, callback) {
        for (var i = 0; i < prefixes.length; i++) {
            if (!prefixes[i]) {
                eventName = eventName.toLowerCase();
            }
            element.removeEventListener(prefixes[i]+eventName, callback, false);
        }
    }
    function hasClass(obj,cname) {
        return (obj.className ? obj.className.match(new RegExp('(\\s|^)'+cname+'(\\s|$)')) : false);
    }
    function addClass(obj,cname) {
        if (obj && !hasClass(obj,cname)) {
            obj.className += " "+cname;
        }
    }
    function removeClass(obj,cname) {
        if (obj && hasClass(obj,cname)) {
            obj.className=obj.className.replace(new RegExp('(\\s|^)'+cname+'(?=\\s|$)'),'');
        }
    }
    function getFakeEventObj(name) {
        return {
            type: 'fake',
            animationName: name || 'none',
            stopPropagation: function() {}
        }
    }

    function pagesTransition(options) {
        var container,
            pageIn,
            pageOut,
            animationName,

            pageInClassName,
            pageOutClassName,
            transitionTypeName,

            beforeTransition,
            onTransitionStart,
            onTransitionEnd,

            timer,
            timeOut = 3500;

        // initialize options
        options = options || {};

        container           = getElement(options.container) || document.body;
        pageIn              = getElement(options.pageIn);
        pageOut             = getElement(options.pageOut);
        animationName       = options.animation || 'none';

        beforeTransition    = options.beforeTransition  || function() {};
        onTransitionStart   = options.onTransitionStart || function() {};
        onTransitionEnd     = options.onTransitionEnd   || function() {};

        pageInClassName     = 'transition-view-to-show';
        pageOutClassName    = 'transition-view-to-hide';
        transitionTypeName  = 'transition-'+animationName;

        if (pageIn === pageOut) { return; }
        // Stop animation if any of pages still in animation process
        if ( (pageIn && pageIn.busy) || (pageOut && pageOut.busy)) {
            throw new Error("New animation cannot be applied to the same element until previous animation is not finished.");
        }

        // You can use beforeTransition callback to define extra logic.
        // If result of the callback will be false then pages transition will be aborted.
        if (beforeTransition && beforeTransition(pageIn, pageOut, container) === false) {
            return;
        }

        // Init onAnimationStart event handler
        function onAnimationStart(e) {
            if (e.animationName !== animationName) {
                return;
            }
            onTransitionStart(pageIn, pageOut, container, e);
            removePrefixedEvent(container, 'AnimationStart', onAnimationStart);
        }
        addPrefixedEvent(container, 'AnimationStart', onAnimationStart);

        // Init onAnimationEnd event handler
        function onAnimationEnd(e) {
            if (e.animationName !== animationName) {
                return;
            }
            e.stopPropagation();
            if (pageIn) {
                pageIn.busy = false;
            }
            if (pageOut) {
                pageOut.busy = false;
                container.removeChild(pageOut);
                removeClass(pageOut, pageOutClassName);
            }
            onTransitionEnd(pageIn, pageOut, container, e);
            removeClass(container, transitionTypeName);
            removeClass(pageIn, pageInClassName);

            if (timer) {
                clearTimeout(timer);
            }
            hideOverlay();
            removePrefixedEvent(container, 'AnimationEnd', onAnimationEnd);
        }
        addPrefixedEvent(container, 'AnimationEnd', onAnimationEnd);

        // If animation was not set - show new page without transition
        if (animationName === 'none') {
            if (pageIn) {
                container.appendChild(pageIn);
            }

            onTransitionStart(pageIn, pageOut, container, getFakeEventObj());

            if (pageOut) {
                // Small timeout to prevent screen flickering
                window.setTimeout(function(){
                    container.removeChild(pageOut);
                    onTransitionEnd(pageIn, pageOut, container, getFakeEventObj());
                }, 50);
            } else {
                onTransitionEnd(pageIn, pageOut, container, getFakeEventObj());
            }
            return;
        }

        // Init pages transition:
        // ----------------------
        // Prepare new page for transition.
        if (pageIn) {
            pageIn.busy = true;
            addClass(pageIn, pageInClassName);
            container.appendChild(pageIn);
        }

        // Prepare current page for transition
        if (pageOut) {
            pageOut.busy = true;
            addClass(pageOut, pageOutClassName);
        }

        // Enable overlay layer to protect from accidental clicks until animation ends
        showOverlay();

        // Set timeout for case if onAnimationEnd event will not occur
        timer = window.setTimeout(function() {
            onAnimationEnd( getFakeEventObj(animationName) );
        }, timeOut);

        // Add predefined CSS class to start CSS animation
        addClass(container, transitionTypeName);

    }

    return pagesTransition;
}());

exports.module = animateTransition;