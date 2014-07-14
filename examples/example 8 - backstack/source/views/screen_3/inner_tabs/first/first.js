RAD.view("view.screen_3_first_tab", RAD.Blanks.View.extend({
    url: 'source/views/screen_3/inner_tabs/first/first.html',
    children: [
        {
            container_id: '#first-tab',
            content: "view.inner_screen_1",
            backstack: true
        }
    ]
}));