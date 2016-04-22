"use strict";

var WelcomePage = RAD.Base.View.extend({
    tagName: 'section',
    template: document.getElementById('hello-page').innerHTML,
    events: {
        'click': 'onClick'
    },
    initialize: function() {
        console.log('initialize');
    },
    onElementSet: function(newEl) {
        console.log('element set', newEl);
    },
    onAttach: function() {
        console.log('onAttach');
    },
    onRender: function() {
        console.log('onRender');
    },
    onDetach: function () {
        console.log('onDetach');
    },
    onClick: function(e) {
        console.log(e);
    }
});

//var page = new WelcomePage({
//    el: '#screen'
//});
//page.render();

//var page = new WelcomePage();
//page.render();
//page.setElement('#screen');

//RAD.publish('navigation.show', {
//    container: '#screen',
//    content: WelcomePage
//});
