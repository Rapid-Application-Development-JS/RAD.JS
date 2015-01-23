RAD.view("view.parent_widget", RAD.Blanks.View.extend({
    tagName: 'div',

    render: function () {
        // important !!!
        // you should redefine render method
        // for avoid url & template using
    },
    
    onEndRender: function () {
        this._firstTimeAttach = true;
    },

    onStartAttach: function () {
        if (this._firstTimeAttach) {
            if (this._pageController) {
                this._pageController.destroy();
            }

            this._firstTimeAttach = false;
            this._pageController = new Pager(this.el, this);
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