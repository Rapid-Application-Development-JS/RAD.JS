"use strict";

var _ = require('underscore');

var Module = require('../../blanks/module');
var Events = require('../../config').Events;
var Attrs = require('../../config').Attributes;

var LayoutManager = Module.extend({
    activePatches: [],

    initialize: function() {
        this.subscribe(Events.PATCH_START, this.onPatchStart, this);
        this.subscribe(Events.PATCH_END, this.onPatchEnd, this);
        this.subscribe(Events.NODE_REMOVED, this.onNodeRemove, this);
    },

    onNodeRemove: function(node) {
        var ids = this.getChildIDs(node);

        // Check that we are not trying to remove are still active children.
        // It is possible that Parent was removed from the DOM but its children should stay in DOM (was reattached).
        if (this.activeViews) {
            ids = ids.filter(function(id) {
                return this.activeViews.indexOf(id) < 0;
            }, this);
        }

        if (node.hasAttribute(Attrs.ID)) {
            ids.unshift(node.getAttribute(Attrs.ID));
        }

        this.publishEvent(ids, Events.DETACH);
    },

    onPatchStart: function(node) {
        this.activePatches.push({
            node: node,
            views: this.getChildIDs(node)
        });
    },

    onPatchEnd: function(node) {
        var patchData = this.activePatches.pop();

        if (patchData.node !== node) {
            throw new Error('Wrong patch order, please check layout manager');
        }
        this.refreshLayout(patchData);
    },

    getChildIDs: function (el) {
        var els = el.querySelectorAll('['+Attrs.ID+']');
        var ids = [];

        for (var i = 0; i < els.length; i++) {
            ids[i] = els[i].getAttribute(Attrs.ID);
        }

        return ids;
    },

    refreshLayout: function(patchData) {
        var viewsBefore = patchData.views;
        var viewsAfter = this.getChildIDs(patchData.node);

        this.activeViews = viewsAfter;
        var detachedViews = _.difference(viewsBefore, viewsAfter);
        this.publishEvent(detachedViews, Events.DETACH);

        var attachedViews = _.difference(viewsAfter, viewsBefore);
        this.publishEvent(attachedViews, Events.ATTACH);
        this.activeViews = null;
    },

    publishEvent: function(subscribers, event) {
        subscribers.forEach(function(id){
            this.publish(id + ':' + event);
        }, this);
    }
});

module.exports = new LayoutManager();