RAD.view("view.parent", RAD.Blanks.View.extend({

    url: 'source/views/view.parent/view.parent.html',

    count: 20,

    onInitialize: function () {
        var i, count = this.count, children = this.getChildren(), name;

        for (i = 0; i < count; i += 1) {
            name = this.getContainerName(i);

            //register
            RAD.view('view.' + name, RAD.Blanks.Child.extend({}));

            //push to children
            children.push({
                container_id: '#' + name,
                content:'view.' + name
            })
        }
    },

    getContainerName: function(index) {
        return 'child_' + index;
    }
}));