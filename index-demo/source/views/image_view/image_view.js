RAD.view('view.image_view', RAD.Blanks.View.extend({

    url: 'source/views/image_view/image_view.html',

    model: new (Backbone.Model.extend({
        defaults: {
            "src": ""
        }
    })),

    events: {
        'tap .image-block': 'selfClose'
    },

    onNewExtras: function (data) {
        var src = data.src;
        this.model.set('src', src);
    },

    onStartAttach: function () {
        this.imageAutoZoom();
    },

    imageAutoZoom: function () {
        var img = this.$('.src-image').get(0),
            imgHolder = this.$('.zoom-view').get(0);
        if (img.naturalHeight > (window.innerHeight * 0.75) - 40 || img.naturalWidth > (window.innerWidth) - 20) {
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
                    e.stopPropagation();
                },
                onScrollMove: function () {
                },
                onScrollEnd: function (e) {
                }
            });
        }
    },

    onEndDetach: function () {
        if (this.$el.imgIScroll) {
            this.$el.imgIScroll.destroy();
            this.$el.imgIScroll = null;
        }
    },

    selfClose: function () {
        this.publish('navigation.dialog.close', {content: this.viewID});
    }
}));
