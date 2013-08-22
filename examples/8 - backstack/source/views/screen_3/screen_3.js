RAD.view("view.screen_3", RAD.Blanks.View.extend({
    url: 'source/views/screen_3/screen_3.html',
    children: [
        {
            container_id: '.subscreen',
            content: "view.subscreen_1"
        },
        {
            container_id: '.top',
            content: "view.top"
        }
    ]
}));