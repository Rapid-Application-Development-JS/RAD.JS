"use strict";

var WelcomePage = RAD.Base.View.extend({

    template: document.getElementById('hello-page').innerHTML,

    onRender: function () {
        console.log('onRender');
    }
});

var page = new WelcomePage();

RAD.publish('navigation.show', {
    container: '#screen',
    content: page
});
