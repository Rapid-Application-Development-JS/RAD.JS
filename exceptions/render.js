RAD.namespace('RAD.Errors.Render', ( function() {
    function RenderError(msg) {
        this.name = 'Render Error';
        this.message = msg;
    }
    RenderError.prototype = new Error();
    RenderError.prototype.constructor = RenderError;

    return RenderError;
}() )
);