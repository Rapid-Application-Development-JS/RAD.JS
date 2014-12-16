RAD.namespace('ChildView', RAD.Blanks.View.extend({

    template:  _.template('<div>{{ this.viewID }}</div>'),

    className: 'rad-block'
}));