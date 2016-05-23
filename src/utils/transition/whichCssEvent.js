'use strict';

module.exports = function whichCssEvents(eventsMap) {
    var name,
        testEl = document.createElement("xelement");

    for (name in eventsMap){
        if (testEl.style[name] !== undefined) {
            return eventsMap[name];
        }
    }
};