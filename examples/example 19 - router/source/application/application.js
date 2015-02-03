RAD.application(function (core) {
    var app = this, isAuthorized = false;

    app.DEFAULT_ACTION = 'home';
    app.NOT_AUTHORIZED_ACTION = 'login';

    app.start = function () {
        core.startService('service.router');
    };

    app.login = function () {
        isAuthorized = true;
        core.publish('service.router.go', {action: 'home'});
    };

    app.logout = function () {
        isAuthorized = false;
        core.publish('service.router.clear');
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