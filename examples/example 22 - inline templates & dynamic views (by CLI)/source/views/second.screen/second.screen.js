RAD.view("second.screen", RAD.Blanks.View.extend({

    url: 'source/views/second.screen/second.screen.html',

    events: {
        'click .back-button': 'goBack',
        'click .render-button': 'render'
    },

    count: 20,

    goBack: function () {
        this.application.showFirst();
    },

    onStartRender: function () {
        this.eraseChildrenCollection(this.namespace);
        this.namespace = makeid();
        this.generateChildrenCollection(this.namespace);
    },

    onDestroy: function () {
        this.eraseChildrenCollection(this.namespace);
    },

    getContainerName: function (index) {
        return 'child_' + index;
    },

    generateChildrenCollection: function (namespase) {
        var i, count = this.count, children = this.getChildren(), name;

        // create new collection of views
        for (i = 0; i < count; i += 1) {
            name = this.getContainerName(i);

            //register new child
            this.application.registerView(namespase + '.' + name);

            //push it to children
            children.push({
                container_id: '#' + name,
                content: namespase + '.' + name,
                animation: 'none'
            });
        }
    },

    eraseChildrenCollection: function (namespase) {
        var children = this.getChildren(), i, l = children.length, param, space;

        for (i = 0; i < l; i += 1) {
            param = children[i];
            if (param.content) {
                space = param.content.split('.');
                if (space[0] === namespase) {
                    this.application.unregisterView(param.content);
                    param.content = null;
                }
            }
        }
    }

}));