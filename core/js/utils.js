RAD.namespace('RAD.utils.removeMultipleSpaces', function (string) {
    return string.replace(/\s{2,}/g, ' ');
});

/*
 * Return an element position {top:px, left:px} relative to parent element.
 * If parent elem not set - relative to browser window.
 */
RAD.namespace('RAD.utils.getCoords', function (elem, parent) {
    'use strict';

    var parentRect, pTop, pLeft,
        scrollTop = window.pageYOffset,
        scrollLeft = window.pageXOffset,
        elemRect = elem.getBoundingClientRect(),
        top = elemRect.top + scrollTop,
        left = elemRect.left + scrollLeft;

    if (parent) {
        parentRect = parent.getBoundingClientRect();
        pTop = parentRect.top + scrollTop;
        pLeft = parentRect.left + scrollLeft;
        top = top - pTop;
        left = left - pLeft;
    }

    return { top: Math.round(top), left: Math.round(left) };
});

RAD.namespace('RAD.utils.dispatchResizeEvent', function (target) {
    'use strict';

    var event = document.createEvent('Event');

    if (!target) {
        return false;
    }
    event.initEvent('scrollRefresh', true, false);
    target.dispatchEvent(event);
});

RAD.namespace('RAD.utils.Base64', {
    // private property
    _keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode:function (input) {
        "use strict";

        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        var Base64 = RAD.utils.Base64;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
                Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode:function (input) {
        "use strict";

        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var Base64 = RAD.utils.Base64;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = Base64._keyStr.indexOf(input.charAt(i++));
            enc2 = Base64._keyStr.indexOf(input.charAt(i++));
            enc3 = Base64._keyStr.indexOf(input.charAt(i++));
            enc4 = Base64._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode:function (string) {
        "use strict";

        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

// private method for UTF-8 decoding
    _utf8_decode:function (utftext) {
        "use strict";

        var string = "";
        var i = 0;
        var c = 0, c1 = 0, c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c1 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
                i += 2;
            }
            else {
                c1 = utftext.charCodeAt(i + 1);
                c2 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
                i += 3;
            }

        }
        return string;
    }
});

RAD.namespace('RAD.utils.QueryFactory', function () {
    "use strict";
    var self = this,
        lastTask;

    function Query(options) {

        var query = this,
            listeners = [],
            success,
            error,
            context;

        function shift(a) {
            var result = [], i;
            for (i = 1; i < a.length; i += 1) {
                result.push(a[i]);
            }
            return result;
        }

        function apply(func) {
            var args = shift(arguments);
            if (typeof func !== "function") {
                return;
            }
            if (context && context instanceof Object) {
                func.apply(context, args);
            } else {
                func.apply(query, args);
            }
        }

        function isArray(vArg) {
            return (Object.prototype.toString.call(vArg) === "[object Array]");
        }

        if (typeof options === "object") {
            success = options.success;
            error = options.error;
            context = options.context;
        }

        query.error = function (data) {
            apply(error, data);
        };

        query.success = function (data) {
            apply(success, data);
        };

        query.then = function (fn) {
            listeners.push(fn);
            return this;
        };

        query.next = function (data) {
            var index,
                length,
                listener;

            if (listeners.length > 0) {
                listener = listeners[0];
                if (isArray(listener)) {
                    if (!listener.isAlreadyRunning) {
                        listener.isAlreadyRunning = true;
                        listener.whileCounter = 0;
                        for (index = 0, length = listener.length; index < length; index += 1) {
                            apply(listener[index], this, data);
                        }
                    } else {
                        listener.whileCounter += 1;
                        if (listener.whileCounter === listener.length) {
                            listeners.shift();
                            apply(listeners.shift(), this, data);
                        }
                    }
                } else {
                    apply(listeners.shift(), this, data);
                }
            } else {
                this.success(data);
            }
        };

        query.when = function () {
            var i, l, array = [];
            for (i = 0, l = arguments.length; i < l; i += 1) {
                array.push(arguments[i]);
            }
            listeners.push(array);
            return this;
        };

        query.resolve = function (data) {
            this.next(data);

            this.then = this.when = this.resolve = function () {
                throw new Error("You try use already resolved query");
            };
        };

        return query;
    }

    self.createQuery = function (option) {
        lastTask = new Query(option);
        return lastTask;
    };

    self.lastQuery = function () {
        return lastTask;
    };

    return self;
});

RAD.namespace('RAD.utils.serializeFormToObject', function (formSelector) {
    var o = {},
        a = $(formSelector).find('input, select, textarea, button'),
        name, value, i,l;

    for (i = 0, l = a.length; i < l; i+=1){
        name = a.get(i).getAttribute('name') || a.get(i).id||a.get(i).className.replace(' ', '');
        value = a.get(i).value || '';

        if (o[name] !== undefined) {
            if (!o[name].push) {
                o[name] = [o[name]];
            }
            o[name].push(value);
        } else {
            o[name] = value;
        }
    }

    return o;
});

RAD.namespace('RAD.utils.serializeFormToString', function (formSelector) {
    var result;

    try {
        result = JSON.stringify(RAD.utils.serializeFormToObject(formSelector));
    } catch (e) {
        result = '';
    }
    return result;
});