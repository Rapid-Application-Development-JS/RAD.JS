window.RAD = require('./prebuild');
window.RAD.init();
var blanks = [];



var animate_transition_plugin = require('../plugins/animate_transition.js');
blanks.push(animate_transition_plugin);



var navigator = require('../plugins/navigator.js');
blanks.push(navigator);



var router = require('../plugins/router.js');
blanks.push(router);



var pointer_plugin = require('../plugins/pointer.js');
blanks.push(pointer_plugin);



var gesture_plugin = require('../plugins/gesture.js');
blanks.push(gesture_plugin);



var deferred = require('../blanks/deferred.js');
blanks.push(deferred);



var plugin = require('../blanks/plugin.js');
blanks.push(plugin);



var service = require('../blanks/service.js');
blanks.push(service);



var view = require('../blanks/view.js');
blanks.push(view);



var scrollable_view = require('../blanks/scrollable_view.js');
blanks.push(scrollable_view);



for (var i = 0; i < blanks.length; i++) {
	RAD[blanks[i].type](blanks[i].namespace, blanks[i].module);
}