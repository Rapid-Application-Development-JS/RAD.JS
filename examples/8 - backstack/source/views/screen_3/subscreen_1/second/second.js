RAD.view("view.screen_3_second", RAD.Blanks.View.extend({
    url: 'source/views/screen_3/subscreen_1/second/second.html',
    children: [
        {
            container_id: '#inner-tabs',
            content: "view.tab_inner_1",
            backstack: true
        }
    ]
}));