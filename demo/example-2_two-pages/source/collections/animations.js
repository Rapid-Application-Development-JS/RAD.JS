var Backbone = require('backbone');

var animationsList = [
    {
        id: 1,
        libName: "Animate.css",
        name: "Bounce",
        animationEnter: "bounceInDown",
        animationLeave: "bounceOutDown",
        animationEnterBack: "bounceInUp",
        animationLeaveBack: "bounceOutUp"
    },
    {
        id: 2,
        libName: "Animate.css",
        name: "Slide Up",
        animationEnter: "slideInUp",
        animationLeaveBack: "slideOutDown",
        leaveTimeout: 400
    },
    {
        id: 3,
        libName: "Animate.css",
        name: "Slide In",
        animationEnter: "slideInRight",
        animationLeave: "slideOutLeft",
        animationEnterBack: "slideInLeft",
        animationLeaveBack: "slideOutRight"
    },
    {
        id: 4,
        libName: "Codrops PageTransitions",
        name: "Move Fade",
        animationEnter: "pt-page-moveFromRight",
        animationLeave: "pt-page-fade",
        animationEnterBack: "pt-page-moveFromLeft pt-page-ontop",
        animationLeaveBack: "pt-page-fade pt-page-onbottom",
        enterTimeout: 600,
        leaveTimeout: 600
    },
    {
        id: 5,
        libName: "Codrops PageTransitions",
        name: "Scale down",
        animationEnter: "pt-page-scaleUpDown",
        animationLeave: "pt-page-scaleDown",
        animationEnterBack: "pt-page-scaleUp",
        animationLeaveBack: "pt-page-scaleDownUp",
        enterTimeout: 500,
        leaveTimeout: 500
    },
    {
        id: 6,
        libName: "Codrops PageTransitions",
        name: "Slide",
        animationEnter: "pt-page-rotateSlideIn",
        animationLeave: "pt-page-rotateSlideOut",
        animationEnterBack: "pt-page-rotateSlideOut pt-reverse",
        animationLeaveBack: "pt-page-rotateSlideIn pt-reverse",
        enterTimeout: 2000,
        leaveTimeout: 2000
    }
];

var Animation = Backbone.Model.extend({
    defaults: {
        animationEnter: null,
        animationLeave: null,
        animationEnterBack: null,
        animationLeaveBack: null,
        leaveTimeout: null,
        enterTimeout: null
    }
});

module.exports = new Backbone.Collection(animationsList, {
    model: Animation
});
