'use strict';
var RAD = require('RAD');
var Sortable = require('./SortableStage');
var clients = require('../../../models/Clients/Clients');

var Stage = RAD.View.extend({
    template: require('./Stage.ejs'),
    className: 'stage js-sortable',
    events: {
        'sortreceive': 'onCardReceive'
    },

    initialize: function (props) {
        var stageID = parseInt(this.props.get('stage-id'), 10);
        this.props.set('clients', clients.where({stage: stageID}))
    },
    onAttach: function () {
        this.sortable = new Sortable(this.el);
    },
    onCardReceive: function (event, ui) {
        var stage = parseInt(this.props.get('stage-id'), 10);
        var clientID = ui.item.attr('id');
        var clientModel = clients.get(clientID);

        clientModel.save({stage: stage}, {
            silent: true
        });
    }
});


module.exports = Stage;