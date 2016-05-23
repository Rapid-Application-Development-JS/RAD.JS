'use strict';
var RAD = require('RAD');
var app = require('source/application');

RAD.core.setOptions({
    parameterName: 'data',
    viewAttributes: {
        'data-role': 'view'
    }
});

app.start();
