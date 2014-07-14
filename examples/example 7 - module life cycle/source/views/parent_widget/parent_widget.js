RAD.view("view.parent_widget", RAD.Blanks.View.extend({
    url: 'source/views/parent_widget/parent_widget.html',
    children: [
        {
            container_id: '.main',
            content: "view.inner_first_widget"
        },
        {
            container_id: '#console',
            content: "view.inner_third_widget"
        }
    ],
    events: {
        'tap .switch-to': 'switchTo',
        'tap .delete': 'deleteView'
    },
    switchTo: function (e) {
        "use strict";
        var $selectedTab = $(e.currentTarget),
            $allTabs = this.$el.find('.topcoat-tab-bar__button'),
            $activeTab = $allTabs.filter('.active'),
            activeTabIndex = $allTabs.index($activeTab),
            selectedTabIndex = $allTabs.index($selectedTab),
            animation;

        if (activeTabIndex === selectedTabIndex) {
            return;
        }
        animation = activeTabIndex < selectedTabIndex ? 'slide-in' : 'slide-out';

        $activeTab.removeClass('active');
        $selectedTab.addClass('active');

        this.publish('navigation.show', {
            container_id: '.main',
            content: $selectedTab.data('target'),
            animation: animation
        });
    },
    deleteView: function (e) {
        "use strict";
        this.$el.find('.topcoat-tab-bar__button').removeClass('active');
        $(e.currentTarget).addClass('active');
        this.publish('view.inner_second_widget', {
            deleteView: true,
            animation: 'slide-in'
        });
    }
}));