var view = require('./view').module;

var scrollable = view.extend({
    className: 'scroll-view',

    refreshScrollListener: function(e) {
        if (this.mScroll) {
            this.mScroll.refresh();
        }
        e.stopPropagation();
    },

    onrender: function() {
        this.refreshScroll();
    },
    onattach: function () {
        var self = this;

        this.attachScroll();

        this._tmpWrapper = function (e) {
            self.refreshScrollListener(e);
        };
        this.el.addEventListener('scrollRefresh', this._tmpWrapper);
    },
    ondetach: function () {
        if (this._tmpWrapper) {
            this.el.removeEventListener('scrollRefresh', this._tmpWrapper);
        }
        this.detachScroll();
    },

    refreshScroll: function() {
        var wrapper;

        if(!this.mScroll) {
            return;
        }

        wrapper = this.el.querySelector('.scroll-view') || this.el;
        if(this.mScroll.wrapper === wrapper && this.mScroll.scroller === wrapper.children[0]) {
            this.mScroll.refresh();
        } else { //elements have disappeared
            this.detachScroll();
            this.attachScroll();
        }
    },
    attachScroll: function() {
        var wrapper = this.el.querySelector('.scroll-view') || this.el,
            options = this.scrollOptions ? this.scrollOptions : {};

        options.onBeforeScrollStart = function (e) {
            var regExp = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;

            if (!regExp.test(e.target.tagName)) {
                e.preventDefault();
            }
        };
        this.mScroll = new window.iScroll(wrapper, options);
    },
    detachScroll: function() {
        if (this.mScroll) {
            this.mScroll.destroy();
        }
        this.mScroll = null;
    }
});

exports.namespace = 'RAD.Blanks.ScrollableView';
exports.module = scrollable;
exports.type = 'namespace';