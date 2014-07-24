RAD.view("view.parent_widget", RAD.Blanks.View.extend({
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
        return 10;
    },

    setPageContent: function (position, rootElement) {
        rootElement.innerHTML = "<div class='inn'>index: " + position + "</div>";
        rootElement.setAttribute('index', position);
    }
}));