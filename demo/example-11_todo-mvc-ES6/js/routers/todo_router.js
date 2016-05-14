'use strict';
import {Router, history} from 'Backbone';
import RAD from 'RAD';

class TodoRouter extends Router {
    routes = {
        '*filter': 'filterItems'
    };

    constructor() {
        super();

        this._bindRoutes();
        history.start();
    }

    filterItems(param) {
        this.filterVal = param;
        RAD.publish('filter', param);
    }

    getValue() {
        return this.filterVal;
    }
}

module.exports = new TodoRouter();