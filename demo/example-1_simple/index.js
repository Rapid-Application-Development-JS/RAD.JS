"use strict";

var WelcomePage = RAD.Base.View.extend({
    tagName: 'section',
    template: document.getElementById('hello-page').innerHTML,
    initialize: function() {
        console.log('initialize');
    },
    onAttach: function() {
        console.log('onAttach');
    },
    onRender: function() {
        console.log('onRender');
    },
    onDetach: function () {
        console.log('onDetach');
    }
});


RAD.publish('navigation.show', {
    container: '#screen',
    content: WelcomePage
});
