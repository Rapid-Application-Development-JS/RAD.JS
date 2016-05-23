"use strict";

var WelcomePage = RAD.View.extend({
    tagName: 'section',
    template: document.getElementById('hello-page').innerHTML,
    events: {
        'click': 'onClick'
    },
    initialize: function () {
        console.log('initialize');
    },
    onAttach: function () {
        console.log('onAttach');
    },
    onRender: function () {
        console.log('onRender');
    },
    onDetach: function () {
        console.log('onDetach');
    },
    onClick: function (e) {
        console.log(e);
    }
});

var page = new WelcomePage({
    el: '#screen'
});
page.render();
