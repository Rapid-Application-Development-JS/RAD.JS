RAD.application(function (core) {
    var app = this, isAuthorized = false;

    app.start = function () {
        core.startService('service.router');
    };

    app.login = function () {
        isAuthorized = true;
        core.publish('service.router.actions', {actions: 'home'});
    };

    app.logout = function () {
        isAuthorized = false;
        core.publish('service.router.actions', {actions: 'login'});
    };

    app.isLogined = function () {
        return isAuthorized;
    };

    app.action = function(action, params) {
        if (action === 'logout') {
            app.logout();
        } else {
            core.publish('service.router.actions', {
                actions: action,
                parameter: params
            });
        }
    };

    return app;
}, true);