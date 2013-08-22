RAD.application({
    start: function () {
        var options = {
            container_id: '#screen',
            content: "view.parent_widget",
            animation: 'none'
        };
        RAD.core.publish('navigation.show', options);
    }
});

