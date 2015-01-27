RAD.application(function (core) {
    var app = this, isAuthorized = false;

    app.start = function () {
        core.startService('service.router');
    };

    app.login = function () {
        isAuthorized = true;
        core.publish('service.router.go', {action: 'home'});
    };

    app.logout = function () {
        isAuthorized = false;
        core.publish('service.router.go', {action: 'login'});
    };

    app.isLogined = function () {
        return isAuthorized;
    };

    app.action = function (action, param) {
        if (action === 'logout') {
            app.logout();
        } else {
            core.publish('service.router.go', {
                action: action,
                parameter: param
            });
        }
    };

    return app;
}, true);