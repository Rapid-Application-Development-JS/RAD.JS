RAD.view("first.screen", RAD.Blanks.View.extend({

    url: 'source/views/first.screen/first.screen.html',

    events: {
        'click button': 'goNext'
    },

    goNext: function () {
        this.application.showSecond();
    }
/*
    onInitialize: function () {
        
    },
    onNewExtras: function (extras) {
        
    },
    onReceiveMsg: function (channel, data) {
        
    },
    onStartRender: function () {
        
    },
    onEndRender: function () {
        
    },
    onBeforeAttach: function(){

    },
    onStartAttach: function () {
        
    },
    onEndAttach: function () {
        
    },
    onEndDetach: function () {
        
    },
    onDestroy: function () {
        
    }
*/

}));