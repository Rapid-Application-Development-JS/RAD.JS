RAD.view('view.confirm_dialog', RAD.Blanks.View.extend({

    url: 'source/views/dialog/confirm_dialog.html',

    events: {
        'tap .btn-confirm': 'onConfirm',
        'tap .btn-cancel': 'onCancel'
    },

    model: new (Backbone.Model.extend({
        defaults: {
            "msg": ''
        }
    })),

    onNewExtras: function (data) {
        this.model.set('msg', data.msg);
        this.fromViewID = data.fromViewID;
    },

    onConfirm: function () {
        var ch = this.fromViewID + '.confirm';

        this.publish(ch);
        this.publish('navigation.dialog.close', {
            content: this.viewID
        });
    },

    onCancel: function () {
        this.publish('navigation.dialog.close', {
            content: this.viewID
        });
    }
}));

RAD.view('view.info_dialog', RAD.Blanks.View.extend({

    url: 'source/views/dialog/info_dialog.html',

    events: {
        'tap .btn-confirm': 'onConfirm'
    },

    model: new (Backbone.Model.extend({
        defaults: {
            "msg": ''
        }
    })),

    onNewExtras: function (data) {
        this.model.set('msg', data.msg);
    },

    onConfirm: function () {
        this.publish('navigation.dialog.close', {
            content: this.viewID
        });
    }
}));