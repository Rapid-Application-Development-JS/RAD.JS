RAD.view("view.screen_3_second_tab", RAD.Blanks.View.extend({
    url: 'source/views/screen_3/inner_tabs/second/second.html',
    children: [
        {
            container_id: '#second-tab',
            content: "view.inner_screen_3",
            backstack: true
        }
    ]
}));