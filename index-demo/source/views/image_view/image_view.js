RAD.view('view.image_view', RAD.Blanks.View.extend({

    url: 'source/views/image_view/image_view.html',
    className: 'topcoat-overlay-bg',

    model: new (Backbone.Model.extend({
        defaults: {
            "src": ""
        }
    })),

    events: {
        'tap .image-block': 'selfClose',
        'tap .src-image': 'selfClose'
    },

    onNewExtras: function (data) {
        "use strict";
        var src = data.src;
        this.model.set('src', src);
    },

    onStartAttach: function () {
        "use strict";
        this.imageAutoZoom();
    },
    imageAutoZoom: function () {
        "use strict";
        var img = this.$('.src-image').get(0),
            imgHolder = this.$('.zoom-view').get(0);
        if (img.naturalHeight > (window.innerHeight * 0.80) - 40 || img.naturalWidth > (window.innerWidth * 0.80) - 20) {
            this.$el.imgIScroll = new window.iScroll(imgHolder, {
                bounce: false,
                momentum: false,
                hideScrollbar: false,
                fadeScrollbar: false,
                onBeforeScrollStart: function (e) {
                    var target = e.target;

                    while (target.nodeType !== 1) {
                        target = target.parentNode;
                    }
                    if (target.tagName !== 'SELECT' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                        e.preventDefault();
                    }
                },
                onScrollStart: function (e) {
                    e.preventDefault();
                },
                onScrollMove: function () {
                },
                onScrollEnd: function (e) {
                }
            });
        }
    },

    onEndDetach: function () {
        "use strict";
        if (this.$el.imgIScroll) {
            this.$el.imgIScroll.destroy();
            this.$el.imgIScroll = null;
        }
    },

    selfClose: function () {
        "use strict";
        this.publish('navigation.dialog.close', {content: this.viewID});
    }
}));
