function ServiceLocator() {
    var servicesWrap = {},
        serviceMixin,
        debug = false;

    function log() {
        if (debug) {
            window.console.log(arguments);
        }
    }

    function mix(object) {
        var mixins = Array.prototype.slice.call(arguments, 1), key, i;
        object.__mixins = [];
        for (i = 0; i < mixins.length; ++i) {
            for (key in mixins[i]) {
                if (object[key] === undefined) {
                    object[key] = mixins[i][key];
                    object.__mixins.push(key);
                }
            }
        }
    }

    function invoke(Constr, mixin, args) {
        var instance;

        function Temp(mixins) {
            var i, key;
            if (!mixins) return this;
            this.__mixins = [];
            for (i = 0; i < mixins.length; ++i) {
                for (key in mixins[i]) {
                    this[key] = mixin[i][key];
                    this.__mixins.push(key);
                }
            }
        }

        Temp.prototype = Constr.prototype;
        Constr.prototype = new Temp(mixin);
        instance = new Constr(args);
        Constr.prototype = Temp.prototype;

        return instance;
    }

    function deleteProp(object, propList) {
        var j;

        if (!object || propList.recursion > 1000) return;

        propList.recursion += 1;
        if (object.hasOwnProperty('__mixins')) {
            for (j = 0; j < propList.length; j++) {
                delete object[propList[j]];
            }
            delete object.__mixins;
        } else {
            deleteProp(Object.getPrototypeOf(object), propList);
        }
    }

    function unmix(object) {
        object.__mixins.recursion = 0;
        deleteProp(object, object.__mixins);

        return object;
    }

    function createObj(id) {
        log("create: " + id);
        return servicesWrap[id].instance = invoke(servicesWrap[id].creator, [
            {radID: id},
            serviceMixin
        ]);
    }

    return {

        printLog: function (flag) {
            debug = flag;
            return this;
        },

        setMixin: function (obj) {
            serviceMixin = obj;
            return this;
        },

        getLocator: function() {
            return servicesWrap;
        },

        register: function (value, obj, instantiate) {

            function track(id){
                if (servicesWrap[id] === undefined) {
                    if (typeof obj === "function" && (instantiate === true || instantiate === undefined)) {
                        servicesWrap[id] = {
                            creator: obj
                        };
                    } else {
                        mix(obj, {radID: id}, serviceMixin);
                        servicesWrap[id] = {
                            instance: obj
                        };
                    }
                } else {
                    log('You try register already registered module:' + id + '!');
                }
            }

            if (Object.prototype.toString.call(value) === '[object Array]') {
                for(var i = value.length - 1; i > -1; i--){
                    track(value[i]);
                }
            } else {
                track(value);
            }
            return this;
        },

        registerAll: function (arrayOfServices) {
            var i, service, radID, obj, instantiate;

            for (i = 0; i < arrayOfServices.length; ++i) {
                service = arrayOfServices[i];
                radID = service.radID || service.ID || service.id;
                obj = service.service || service.obj || service.object || service.creator;
                instantiate = (service.instantiate !== undefined) ? !!service.instantiate : true;
                this.register(radID, obj, instantiate);
            }
            return this;
        },

        get: function (id) {
            if (servicesWrap[id] === undefined) {
                log('Error - ' + id + ' is not registered!');
                return null;
            }

            return servicesWrap[id].instance || createObj(id);
        },

        // Instantiate and return registered services. You can define filter function which takes service ID
        // as argument and returns true or false. In this case instances will be created only for services
        // which will pass filter checking.
        instantiateAll: function (filter) {
            var radID, result = [];
            filter = filter || function() {
                return true;
            };

            for (radID in servicesWrap) {
                if ( servicesWrap.hasOwnProperty(radID) && servicesWrap[radID].creator && !servicesWrap[radID].instance && filter(radID) ) {

                    result.push(createObj(radID));
                }
            }
            return result;
        },

        getAllInstantiate: function (withConstructor) {
            var radID, result = [], flag;
            for (radID in servicesWrap) {
                flag = (withConstructor) ? !!servicesWrap[radID].creator : true;
                if (servicesWrap.hasOwnProperty(radID) && servicesWrap[radID].instance && servicesWrap[radID].creator) {
                    result.push(radID);
                }
            }
            return result;
        },

        removeInstance: function(id) {
            if (!servicesWrap[id] || !servicesWrap[id].instance) {
                return false;
            }
            delete servicesWrap[id].instance;
        },

        unregister: function (value, removeMixin) {
            var result, i;

            function remove(id){
                var serviceData, instance;
                serviceData = servicesWrap[id];
                if (removeMixin && serviceData && serviceData.instance) {
                    instance = serviceData.instance;
                    unmix(instance);
                }
                delete servicesWrap[id];
                return serviceData.instance;
            }

            if (Object.prototype.toString.call(value) === '[object Array]') {
                result = [];
                for (i = value.length - 1; i > -1; i--) {
                    result.push(remove(value[i]));
                }
            } else {
                result = remove(value);
            }
            return result;
        },

        unregisterAll: function (removeMixins) {
            var id, result = [], instance;

            for (id  in servicesWrap) {
                if ( servicesWrap.hasOwnProperty(id)) {
                    instance = this.unregister(id, removeMixins);
                    if (instance) result.push(instance);
                }
            }
            return result;
        }

    };
}

exports.serviceLocator = ServiceLocator;