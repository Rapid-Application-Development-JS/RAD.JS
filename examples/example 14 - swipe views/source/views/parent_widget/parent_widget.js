RAD.view("view.parent_widget", RAD.Blanks.View.extend({
    swipe_content: ["view.inner_first_widget", "view.inner_second_widget", "view.inner_third_widget"],

    url: 'source/views/parent_widget/parent_widget.html',

    onEndRender: function () {
        this._firstTimeAttach = true;

    },

    onStartAttach: function () {
        if (this._firstTimeAttach) {
            if (this._pageController) {
                this._pageController.destroy();
            }

            this._firstTimeAttach = false;
            this._pageController = new Pager(this.$('.swipe-container')[0], this);
        }
    },

    getPageCount: function () {
        return this.swipe_content.length;
    },

    setPageContent: function (position, rootElement, helper) {
        this.publish('navigation.show', {
            container_id: rootElement,
            content: this.swipe_content[position],
            animation: 'none'
        });
    }
}));