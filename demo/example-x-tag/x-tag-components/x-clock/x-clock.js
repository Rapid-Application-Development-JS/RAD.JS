xtag.register('x-clock', {
    lifecycle: {
        created: function(){
            this.start();
        }
    },
    methods: {
        start: function(){
            this.update();
            this.xtag.interval = setInterval(this.update.bind(this), 1000);
        },
        stop: function(){
            this.xtag.interval = clearInterval(this.xtag.interval);
        },
        update: function(){
            this.textContent = new Date().toLocaleTimeString();
        }
    },
    events: {
        tap: function(){
            if (this.xtag.interval) this.stop();
            else this.start();
        }
    }
});