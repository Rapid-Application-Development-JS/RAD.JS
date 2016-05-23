'use strict';
var $ = require('jquery');

// Connect jQuery UI sortable module
require('jquery-ui/sortable');

var defaults = {
    activeClass: 'tile--active',
    items: '.tile',
    cancel: '.stage-header',
    connectWith: '.js-sortable',
    placeholder: 'tile-placeholder'
};

function SortableStage(el, options) {
    this.$el = $(el);

    if (this.$el.hasClass('ui-sortable')) {
        this.refresh();
    } else {
        this.init($.extend({}, defaults, options));
    }
}

SortableStage.prototype.init = function (options) {
    this.$el.sortable({
        items: options.items,
        cancel: options.cancel,
        connectWith: options.connectWith,
        placeholder: options.placeholder,

        zIndex: 2,
        revert: 150,
        forcePlaceholderSize: true,

        start: function (event, ui) {
            ui.item.addClass(options.activeClass);
        },
        stop: function (event, ui) {
            window.setTimeout(function () {
                ui.item.removeClass(options.activeClass);
            }, 100);
        }
    });
};
SortableStage.prototype.refresh = function () {
    this.$el.sortable("refresh");
};

SortableStage.prototype.destroy = function () {
    this.$el.sortable("destroy");
};

module.exports = SortableStage;