RAD.view("view.screen_3", RAD.Blanks.View.extend({
    url: 'source/views/screen_3/screen_3.html',
    children: [
        {
            container_id: '#inner',
            content: "view.screen_3_first_tab"
        }
    ],
    events: {
        'tap .switch-to': 'switchTo',
        'tap .go-back': 'goBack',
        'tap .logout': 'logout'
    },
    tabs: [
        'view.screen_3_first_tab',
        'view.screen_3_second_tab'
    ],
    onInitialize: function () {
        "use strict";
        this.subscribe('navigation.back', this.changeTab, this);
    },
    logout: function() {
        "use strict";
        this.application.logout();
    },
    goBack: function () {
        "use strict";
        this.publish('router.back', null);
    },
    changeTab: function (channel, data) {
        "use strict";
        var tabIndex,
            $allTabs;
        if (!data) {
            return;
        }
        tabIndex = this.tabs.indexOf(data.content);
        if (tabIndex !== -1) {
            $allTabs = this.$el.find('.topcoat-tab-bar__button');
            $allTabs.removeClass('active');
            $allTabs.eq(tabIndex).addClass('active');
        }
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
            container_id: '#inner',
            content: this.tabs[selectedTabIndex],
            animation: animation,
            backstack: true
        });
    }
}));