function Pool(Constructor, count, releaseFnName) {
    var objects = {}, quantity = 0, freeObjects = [], usedObjects = [],
        fn = (typeof releaseFnName === 'string') ? releaseFnName : 'release';

    function create(id) {
        var obj;
        obj = new Constructor();
        obj[fn] = function () {
            var i;
            freeObjects.push(id);

            // remove id from used array
            i = usedObjects.indexOf(id);
            usedObjects[i] = usedObjects[usedObjects.length -1];
            usedObjects.length -= 1;
        };
        objects[id] = obj;
        return id;
    }

    function allocate(count) {
        var i, l;
        for (i = 0, l = count; i < l; i++) {
            create(i);
            quantity++;
            freeObjects.push(i);
        }
    }

    this.get = function () {
        var id;
        if (freeObjects.length > 0) {
            id = freeObjects.pop();
        } else {
            id = create(quantity);
            quantity++;
        }
        usedObjects.push(id);

        return objects[id];
    };

    allocate(count);
    return this;
}
