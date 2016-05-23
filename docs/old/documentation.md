##Application object

Any JS object can be registered as an application in RAD.js. This object will be available via the link `this.application` in `views` and `services`.

It is recommended to use the application object for incapsulation of logic for the entire application, for example `this.application.logout();` or `this.application.gotoSearchScreen();`.

As the constructor parameter, a link to core is transmitted, which allows to use the application object as a decorator for calling the direct methods of the core. Example of declaration of application object constructor, using methods of the core:

```javascript
RAD.application(function (core) {
  this.start = function () {
     var options = {
     	container_id: '#screen',
     	content: 'screen.home',
     	animation: 'none'
     };
     core.publish('navigation.show', options);
 };
 
 this.gotoSearch = function (searchString) {
     core.publish('navigation.show', {
     	container_id: '#screen',
     	content: 'screen.search',
     	animation: 'slide',
     	extras: {
     		reqest: searchString
     	}
     });
 };
}, true);
```

>Notice: the Boolean value is transferred by the second parameter in RAD.application. The value defines whether or not to create an application instance.

It is also worth noticing that application registry call can be performed only once, since it is a self-defining function. After the call, the instance of your application will be available in the RAD.application namespace.

>In case CLI is used, the application object is created automatically. In case of manual description, there are possible cases when a sipmle application can be constructed from independent modules `views` and `services` without direct creation of application object.

##Core

The core of RAD.js is based on two independent libraries [PubSub](tools/pubsub.md) [ServiceLocator](tools/servicelocator.md), which allow to construct low-coupling architecture with an opportunity of controlling the instantiation of separate application components.

- Management of application part lifecycle;
- Communication interface (allows application parts to interact with each other);

Opportunity to extend functionality via plugins.


###Methods of the core

Here is an example of how methods of the core can be called from applications object or plugins:

```javascript
// if the core is available (from a plugin or on application level)
core.subscribe('navigation.show', call);
// for a module
core.publish('navigation.show', options);
```
####subscribe
	
```javascript
subscribe(channel, fn, context);
```

Subscribes the **fn** callback function to execution in **context** after having received a message through **channel**.

>The modules registered in the core are automatically subscribed to receiving the message in the channel that is tied up to its ID. For example, a created module, registered as `'view.myModule'`, will be automatically subscribed to the `'view.myModule'` channel, as well as to `'view.myModule.onReceiveMsg'`.

Such messages can be processed in the `onReceiveMsg` callback.

>This is a wrapper for `subscribe` in [pubsub.js](tools/pubsub.md)

####publish

```javascript
publish(channel, data);
```

Publishes a message in `channel` and transfers `data` to subscribers.

In case the message is published in the ID channel of a module it is registered by; and if you are not sure whether this module exists in the moment when the message is sent, you may use the `sticky` parameter for publishing.

>This is a wrapper for `publish` в [pubsub.js](tools/pubsub.md)

####unsubscribe
```javascript
unsubscribe([channel,] context);
```
Unsubscribes the channel in context where the callback was executed. If null is indicated as the channel, this method cancels all subscriptions of the object.

>This is a wrapper for `unsubscribe` in [pubsub.js](tools/pubsub.md)

####channels

```javascript
channels();
```
Returns the existing message channels.

>This is a wrapper for `channels` in [pubsub.js](tools/pubsub.md)

####register
```javascript
register(ID, fabric);
```
Registers a module in the core. The module is named by ID has the fabric constructor. If the module is registered automatically, this method is not necessary (ref. declaration of the module).

Hereby a module instance is not created.

>This is a wrapper for `register` in [servicelocator.js](tools/servicelocator.md)

>There is no need in registering modules manually; they will be registered automatically if you use constructions similar to: `RAD.view(ID, function() {...});`

####registerAll

```javascript
registerAll(arrayOfViews);
```
>This is a wrapper for `register` in [servicelocator.js](tools/servicelocator.md)

Calls register for each module listed in arrayOfViews. Example of array:
```javascript
var views = [
    {id: 'view.start_page', creator: view.StartPage},
    {id: 'view.second_page', creator: view.SecondPage},
    ...
];
```

>Notice: it is obligatory for names of `services` to start with `'service.'`. For `views` it is not obligatory.

####startViewOrService

```javascript
startViewOrService(ID, [extras]);
```
Instantiates a module named ID.

Uses the extras object in the callback of the onNewExtras module.

####startPlugins
```javascript
startPlugin();
```
Instantiates all plugins of the core.

####stop
```javascript
stop(ID, callback, context);
```
Stops operation of the ID module; after that performs callback in context.

####startAll
```javascript
startAll();
```
Instantiates and launches all modules.

####getView
```javascript
getView(viewID, [extras]);
```
Returns the viewID module instance, transfers the extras object to it (ref. onNewExtras). If the instance does not exist, getView instantiates it.

####getStartedView
```javascript
getStartedView();
```
Returns the array of all instantiated modules; their visibility on the screen is not required.

####initialize
```javascript
initialize(application, options);
```
Initializes the core with the options parameters, saves the link to the application object for further injection of the direct application link into all modules.

####getService
```javascript
getService(serviceID, [extras]);
```
Identical to the getView method.

###Options of the core

Options of the core are determined by the object of the options. E.g.:
```javascript
var coreOptions = {
        defaultBackstack: false,
        backstackType: 'native',
        defaultAnimation: 'slide',
        animationTimeout: 3000,
        debug: false
    };
 
//initialize core by new application object
core.initialize(application, coreOptions);
```
####plugins
```javascript
		plugins: [
		    {'plugin.navigator': plugin.navigation},
		    {'plugin.fastclick': plugin.fastClick},
		    {'plugin.router': plugin.router}
		],
```
Array of connected plugins; of which currently are implemented router, layout manager, and crossbrowser events for touchscreen devices (`'tap'`, `'swipe'` etc.). For further details ref. plugins.

>Notice: the `'plugin.navigator'`, `'plugin.fastclick'`, `'plugin.router'` plugins are registered, and there is no need in declaring them.

####defaultBackstack
```javascript
		// no backstack
		defaultBackstack: false,
		// backstack enabled
		defaultBackstack: true,
```
Default backstack for all transactions. When indicated false, the history of changes in screen content (layout change of view) will not be saved. To enter a transaction to the history, the backstack: true option should be utilized, while using navigation.

For further details ref. Backstack.

####backstackType
```javascript
		//backstack using history API
		backstackType: 'native',
		//backstack using hash-links for history API
		backstackType: 'hashbang',
		//inner implementation of backstack
		backstackType: 'custom',
```
Backstack type for all transactions. If the value of this option is undefined, backstack type will be determined automatically ('native' or 'hashbang', depending on the browser).

For further details about backstack types ref. Backstack.

####defaultAnimation
```javascript
		defaultAnimation: 'slide',
```
Default animation of module interchange. It can take such values as 'slide', 'fade' and 'none' (instant substitution). Further details in module animation.

####animationTimeout
```javascript
		animationTimeout: 3000,
```
Duration of time, after which the interface is unblocked (the block is launched at the beginning of animation) in case of unforeseen errors.

####debug
```javascript
		debug: false,
```
Debug mode. When true, it enters information about events, channels and objects of the core into the browser console.

---

##Plugins of the core

Plugins implement additional functionality of the core, which is required for system functioning, and does not depend on actual implementation of application logic. If a functional module must be implemented without visual representation in actual application, it is recommended to use services.

###Navigation

The navigation plugin processes all messages with the 'navigation.' root node and manages views (display, hide, status change notification).

####show
```javascript
var options = {
    container_id: '#screen',
    content: 'view.start_page',
    animation: 'none',
    backstack: false,
    callback: null,
    context: null,
    extras: null
 
}
this.publish('navigation.show', options);
```
Shows the module indicated in options.content, in the options.container_id container (CSS-selector).

Parameters of options:

- `content` - registered module name (viewID), which will be displayed;

- `container_id` - CSS selector of the container element for displaying the module;

- `animation` - animation used upon change of view in a selected container. See [animatetransition.js](tools/animatetransition.md);

- `backstack` - saves history of module position changes (true or false);

- `callback` - function that runs when the content module is no longer displayed;

- `context` - implementation context for callback;

- `extras` - ref. onNewExtras.

The required parameters are content and container_id (the latter is optional for toast.show and dialog.show). Other parameters are optional.

####back
```javascript
this.publish('navigation.back', options);
```
Service command, similar to `navigation.show`, but with reverse animation.

####dialog.show
```javascript
this.publish('navigation.dialog.show', options);
```
Similar to navigation.show but shows the module as a modal window. Can be closed with `dialog.close`. `outsideClose: true`/`false` - whether or not to close the dialog by outside click. The dialog can contain nested views.

####example
```javascript
var options = {
	content: "view.dialog",
	animation: 'popup-fade',
	outsideClose: false,
	extras: {
		title: title,
		content: content,
		parent: this.viewID
	}
};

this.publish('navigation.dialog.show', options);
```

####dialog.close
```javascript
this.publish('navigation.dialog.close', options);
```
Closes the modal window.

####example
```javascript
function () {
        ...
        //transfer data to parent
        this.publish(this.parentID, {result: resultString });

        //close dialog
        this.publish('navigation.dialog.close', {content: this.viewID });
    }
```

####toast.show
```javascript
this.publish('navigation.toast.show', {
            content: "view.toast",
            gravity: gravity,
            showTime: 4000,
            outsideClose: true,
            extras: {
                type: type,
                title: title,
                msg: msg
            }
        });
```
Shows the module as an alert which closes automatically or upon a click.
Options:
- `gravity` - `center`, `left`, `right`, `top`, `bottom`
- `showTime` - message show time
- `outsideClose` - whether or not it will be closed upon the click outside the message.

>Toast can't contain nested views.

####toast.close
```javascript
this.publish('navigation.toast.close', options);
```
Intentionally closes the message.

####popup.show
```javascript
this.publish('navigation.popup.show', {
            content: "view.popup",
            target: target,
            width: 240,
            height: 200,
            gravity: gravity,
            outsideClose: outsideToClose,
            animation: 'popup-fade',
            extras: {
                msg: msg,
                parent: self.viewID
            }
        });
```
Shows the module as a non-blocking popup window that can be closed with a click outside of it.

Options:

- `target` - element, with respect to which a popup is positioned;
- `gravity` - position with respect to target; it can take values `none` (direction is chosen automatically), `center`, `left`, `right`, `top`, and `bottom`;
- `outsideClose` - whether or not it will be closed upon the click outside the message;
- `width` and `height` - width and height of the popup, required for positioning;

>Popup can't contain nested views.

####popup.close
```javascript
this.publish('navigation.popup.close', options);
```
Closes the popup window.

###Pointer

The plugin implements crossbrowser DOM events 
- `pointerdown` - pointer or finger down
- `pointermove` - movement of pointer or finger
- `pointerup` - pointer or finger up
- `pointerover` - pointer or finger over the element
- `pointercancel` - pointer is cancelled

###Gesture Adapter

The plugin implements crossbrowser DOM events `fling`, `tap`, `longtap`.

###Router

It is used by the core for navigation; realizes backstack.

####backstack
```javascript
var options = {
    backstack: true,
};
```
The plugin component named router allows to dynamically memorize layout of views on the screen, for a particular session, using the browser's history API or internal realization. Thus it allows to return to previous positions of modules. Backstack is not analogous to Routers in Backbone.js or Angular.js.

There are 3 backstack types, implemented in the plugin (backstackType):

* `native` - uses the browser's history API;

* `hashbang` - uses generation of hash-link (for browsers that do not support history.pushState);

* `custom` - internal realization (without history API).

If defaultBackstack in Core settings has the value false, then it is enough to indicate backstack: true in views change query to use backstack; thus the next layout of views will remain the same.

A shift back in the stack is executed:

by browser buttons **'Back'**/**'Forward'** or by calling `history.back()` - for such backstack types as `'native'` and `'hashbang'`;

by publishing a message `'router.back'` - for all types

`history.back();` for `backstackType: 'native'` or `'hashbang'`

`this.publish('router.back', null);` for any backstack types

Router is subscribed to the following messages:

* `'router.clear'`- when it receives a message, erases the whole navigation history of a chosen session (empties the backstack);

* `'router.back'` - when it receives a message, calls a one-step shift back in backstack;

* `'router.beginTransition'` - a message is published by the navigation plugin, before the animation (transition) of view change;

* `'router.endTransition'` - a message is published by the navigation plugin, when the animation of view change is over. In this case, the URL of previous positions of modules is added to history ('native' and 'hashbang' backstack types) or internal stack ('custom')

```javascript
this.publish('router.clear', null); //setting the existing backstack to zero
this.publish('router.back', null); //shift back in backstack
```
Router publishes the following messages:

* `'backstack.pop'` - message is published at the moment when a shift back in backstack occurs;

* `'backstack.empty'` - message is published at the moment when backstack is emptied.

An example of use of backstack:
```javascript 
RAD.view('view.screen_2', RAD.Blanks.View.extend({
    url: 'source/views/screen_2/screen_2.html',
    events: {
        'tap button.next-scr': 'open'
    }
    open: function () {
        this.publish('navigation.show', {
			content: 'view.screen_3',
			container_id: '#content',
			backstack: true
			//upon the completion of view change, the URL that corresponds to current position of views, will be saved
        });
    }
}));
```
```javascript 
RAD.view('view.top_widget', RAD.Blanks.View.extend({
    className: 'block',
    url: 'source/views/top_widget/top_widget.html',
    events: {
        'tap button.go-back': 'goBack'
    },
    goBack: function () {
        'use strict';
        this.publish('router.back', null); //return to the last saved position of modules
    }
}));
```

##View

Base for view constructor in the application; represents an extended backbone.view.

###Module declaration
You must use the register view, so that the module is available to the core. It is recommended to use the following way of module declaration:

```javascript
RAD.view('view.start_page', RAD.Blanks.View.extend({
	url: 'source/views/start_page.html'
}));
``` 

>Old style of view declaration through the 'namespace' pattern:
```javascript
RAD.views.StartPage = RAD.Blanks.View.extend({
    url: 'source/views/start_page.html'
})
```
but in this case you must register `view` additionaly.

###Methods

####subscribe
```javascript
this.subscribe(channel, function, context);
```
Subscribes an indicated module instance to an indicated channel; represents a direct link to the subscribed method of the core.

####unsubscribe
```javascript
this.unsubscribe([channel,] context);
```
Unsubscribes an indicated module instance from an indicated channel; represents a direct link to the unsubscribed method of the core.

####publish
```javascript
this.publish(channel, data);
```
Publishes a message containing data to an indicated channel; represents a direct link to the published method of the core.

####$
```javascript
this.$('css_selector');
```
Searches for an indicated CSS selector in an indicated module; then envelops the found element with JQuery.

Analogue:
```javascript
this.$el.find('css_selector');
```
####finish
```javascript
this.finish();
```
Eliminates the module instance.

####getChildren
```javascript
this.getChildren();
```
Brings back the array of child modules, which are indicated during a declaration in the children, or which are currently located in this view.

####bindModel
```javascript
this.bindModel(model);
```
Sets a model for the module. Hereby render() will be called to redraw the module. The module will be automatically subscribed to model events.

####changeModel
```javascript
this.changeModel(model);
```
Changes the module model into the one rendered in the model. Here render() will be called to redraw the module.

####unbindModel
```javascript
this.unbindModel(forceRender);
```
Eliminates the module model. If this parameter takes value 'true', then render() will be called to redraw the module.

>Notice: the call of this method may cause an error if the presence of the model is not checked in the template. It is recommended to use only by no other ways to solve the task.

####render
```javascript
this.render();
```
Rerenders the content of the module.

There is usually no need in calling this method manually.

###Callbacks

Callbacks are described by declaration of the view, e.g.:
```javascript
RAD.view('view.start_page', RAD.Blanks.View.extend({
    url: 'source/views/start_page.html',
    onEndRender: function () {
        'use strict';
        console.log('page rendered!');
    }
}));
```
Callbacks are functions called by events of the view lifecycle:
```javascript
 // executed during creation of an instance
onInitialize: function () {},
 
// executed during receiving data view through navigator
onNewExtras: function () {},
 
// executed after getting a message on a channel that matches viewID
onReceiveMsg: function () {},
 
// executed before the start of templating (creating HTML view)
onStartRender: function () {},
 
// executed after creating HTML content from a template,
// iScroll in inheritors of RAD.Blanks.ScrollableView does not exist during first displaying
onEndRender: function () {},

// executed before the start of animation embedded in view. Views html branch exist, but outside from DOM.
onBeforeAttach: function () {},
 
// executed before the start of animation embedded in view,
// iScroll already exists in inheritors of RAD.Blanks.ScrollableView 
onStartAttach: function () {},
 
// executed after the stop of animation embedded in view
onEndAttach: function () {},
 
// executed after removing view from DOM
onEndDetach: function () {},
 
// executed by elimination of the module
onDestroy: function () {},
```

####onInitialize
```javascript
onInitialize: function(){ };
```
Executed by the first callback at the end of constructor during view instantiation. It is the last moment to directly determine a model for the module. Further such view methods as bindModel and unbindModel should be used.

####onStartRender
```javascript
onStartRender: function(){ };
```
Executed before render() of the module. There is no HMTL-rendering of the module at this stage.

####onEndRender
```javascript
onEndRender: function(){ };
```
Executed in module's render() when HTML-rendering is generated from a template. Processing of everything regarding HTML (e.g. insertion of child modules or adding classes) must be performed within this method.

>Notice: module's render() is called during the first display of the module and during each change in the module model, to which it automatically binds during creation. It is also possible to call module's render() manually.

####onNewExtras
```javascript
var options = {
    extras: {
        hello : 'world'
    }
}
this.publish('navigation.show', options);
```
```javascript 
onNewExtras: function(extras){
    console.log(extras.hello);
},
```
Executed during transmission of new extras through navigator. Perfectly suits for transmission of either a new model or parameters of displayed module. Utilizes the extras parameter.

####onBeforeAttach
```javascript
onBeforeAttach: function(){ },
```
Executed before displaying the module and before the beginning of animation (even if it does not exist). View html branch exist, but outside from DOM.

####onStartAttach
```javascript
onStartAttach: function(channel, options){ },
```
Executed before displaying the module and before the beginning of animation (even if it does not exist). Takes the channel of the message and data from the navigation plugin as parameters.

####onEndAttach
```javascript
onEndAttach: function(channel, options){ },
```
Executed after the displaying of module is over, or after the animation is over (even if it doesn't exist). Takes the channel of the message and data from the navigation plugin as parameters.

####onEndDetach
```javascript
onEndDetach: function(channel, options){ },
```
Executed after the final disconnection of the module from the current DOM. Takes the channel of the message and data from the navigation plugin as parameters.

####onDestroy
```javascript
onDestroy: function(){ },
```
Called before elimination of module instance (destructor); has no input parameters.

####onReceiveMsg
```javascript
onReceiveMsg: function(msg, data){ },
```
During the creation a module is automatically subscribed to messages starting with `'view.'` and its own name. For example, a module named myModule will be subscribed to such messages as `'view.myModule'` and '`view.myModule.doSomeAction'`.

Parameters:
* `msg` - message channel, line;

* `data` - object of transmitted data (ref. publish).

Services are subscribed in the same way - on messages starting with `'service.'` + 'module_name'.

####loader.done
```javascript
onNewExtras: function (extras) {
    var self = this;
    this.loader.done(function () {
        self.$('#options').html(extras.data);
    });
},
```
It is not exactly a callback method. Each module has a deferred object loader, which can be given a function that will be executed after loading the HTML-rendering of the module. In case if HTML or HTML-template are loaded beforehand, the function will be executed immdeiately. This method can be used when it is needed to insert the data transmitted through extras into the ready HTML.

###Options of View

Modules are inherited from backbone.view, here are described several options.

####url
```javascript
url: 'source/views/inner/third_widget/third_widget.html',
```
Link to the HTML file, used by modules as a template.

####tagName
```javascript
tagName: 'li',
className: 'my_list_item',
```
Determines the element that will represent module container and its class(es).
####className
```javascript
tagName: 'li',
className: 'my_list_item',
```
Determines the element that will represent module container and its class(es).

####children
```javascript
children:[
    {
        container_id: '.sidebar',
        content: 'view.sidebar_menu',
    },
    {
        container_id: '.content',
        content: 'view.default_content',
    }
],
```
Array of child modules to be loaded and shown along with the parent module. Attributes are identical to 'navigation.show'.

####events
```javascript
events:{
    'focus .search-by-name': 'showAutocomplete',
    'click .my_button':'buttonAction'
},
buttonAction: function(e){
    console.log(e.currentTarget + ' clicked');
},
showAutocomplete: function(){},
```
Subscribes module elements to events.

####model
```javascript
//declarative way
model: RAD.models.noteList,
```
```javascript 
//model determination during initialization
onInitialize: function () {
    'use strict';
 
    this.model = RAD.models.noteList;
    this.model.add([
        {title:'test note 1', 'description':'test note description 1'},
        {title:'test note 2', 'description':'test note description 2'},
        {title:'test note 3', 'description':'test note description 3'}
    ]);
},
```
Determines the data model for the module. Further about models ref. model. View automatically subscribes to model events.

###Custom attributes
```javascript
currentPageDisplay: 2,
showMyCustomWidget: false,
```
Any attributes can be created and used for keeping module statuses.

Do not allow created options to redefine the names of existing ones - this may cause errors.

###Scrollable view

####refreshScroll
```javascript
this.refreshScroll();
```
Refreshes the bounds of scrolled content for correct display of scrolling.

There is usually no need in calling this method manually. It can be used during manual placement of content into the module element, which is not recommended.


Module with scrolling content, uses improved version of iScroll-lite.
```javascript
RAD.view('view.start_page', RAD.Blanks.View.extend({
    url: 'source/views/start_page.html'
}));
```
>Notice: for functioning of iScroll'а there must be a `"scroll-view"` class available in HTML for container, in which the content scrolls (if inherited from ScrollableView, it is automatically attached to view).
When scrolled content changes size, a set-up data-template attribute is required for correct functioning of scrolling.


##Templates

Templates are useful in rendering extensive and complex parts of HMTL-markup from JSON-data. The Underscore.js method from the library is used for templating. This method compiles templates to functions, which can be called for rendering a template. Path to HTML-template is indicated as a url option by declaring the View module. During the rendering of HTML-representation of the module, the view.model of this module, which is transformed into JSON-object, is transmitted to template engine function.

Example of markup with templates:
```html
<div class="scroll-view-body">
    <div class="block">
        <div class="block-title">
            <h2>All Action Items</h2>
        </div>
            <ul class="list-items-view">
                {{# _(model).each(function(action) { }}
                <li >
                <span class="priority-indicator {{ action.priority }}"></span>
                <div class="list-item-row row-title">
                    <div class="info">{{ action.title }}</div>
                    <div class="details">Due: {{ action.due }}</div>
                </div>
                <div class="list-item-row">
                    <div class="info">Patient: {{ action.patient }} (DOB: {{ action.dob }} )</div>
                    <div class="details">CM Program: {{ action.cm_program }}</div>
                </div>
                </li>
                {{# }); }}
        </ul>
    </div>
</div>
```
Syntax within the template:

* `{{ ... }}` - for interpolation of variables;

* `{{# ... }}` - for performing calculations (JavaScript-code inside the template);

* `{{{ ... }}}` - for screening special symbols (HTML-escaped);

`model` - view.model, transformed into JSON-object.

The model object, which is transferred to the template, lacks the Backbone.Model and Backbone.Collection options and methods. If it is needed to directly access view.model or other options and methods, one can use direct link named this, which leads to current view inside the template.

For building HTML from a large data array, it is convenient to use methods of the Underscore library, such as each(), sortBy(), filter() etc.

Example of use of the Underscore.js methods in a template:
```javascript
RAD.view('view.persons_list', RAD.Blanks.View.extend({
    url: 'source/views/persons_list.html',
    onInitialize: function () {
        this.model = RAD.model('persons', Backbone.Collection, true);
        this.model.add([
            {'firstName': 'John', 'lastName': 'Doe'},
            {'firstName': 'Homer', 'lastName': 'Simpson'},
            {'firstName': 'Fox', 'lastName': 'Mulder'}
        ]);
    }
}));
```

```html 
<!-- Template persons_list.html: -->
<ul class="persons_list">
    {{# _(model).each(function (person) { }}
    <li>{{ person.firstName }} <b>{{ person.lastName }}</b></li>
    {{# }); }}
</ul>
 
<!-- After templating: -->
<ul class="persons_list">
    <li>John <b>Doe</b></li>
    <li>Homer <b>Simpson</b></li>
 
 
    <li>Fox <b>Mulder</b></li>
</ul>
```
If it is needed to redraw only a part of the module upon a change of model, the container holding the template must get the data-template attribute.

Example of use of the data-template attribute:
```html
<div id="my_module">
<!-- content <div> will not be redrawn (radiobutton will not be set to default position) -->
    <div class="controls">
        <p>Sort by:</p>
        <label><input type="radio" name="sort_by" value="first_name" />First Name</label>
        <label><input type="radio" name="sort_by" value="last_name" checked />Last Name</label>
    </div>
    <!-- content <ul> will be redrawn -->
    <ul class="persons_list" data-template>
        {{# _(model).each(function (person) { }}
        <li>{{ person.firstName }} <b>{{ person.lastName }}</b></li>
        {{# }); }}
    </ul>
</div>
```

##Model

backbone.model is used as a data model.
```javascript
//creating a model
RAD.model('name', <backbone.model>, [instantiate]);
```
```javascript 
//receiving the model (will return undefined, if there is no model)
RAD.model('name');
```
RAD.model(...) is a method used for working with the model. Here the following parameters are used:

name - name of the model, which will be created in RAD.models; can be set as <namespace>.<subnamespace>.name;

backbone.model - backbone model (example below);

instantiate - parameter of model instantiation. true (or untransferred) - create an instance, false - save as constructor.

Creating a model constructor:
```javascript
RAD.model('note', Backbone.Model.extend({defaults: {
        title: '-',
        description: '-'
    }
}), false);
```

Creating a model in the module:
```javascript
onInitialize: function () {
    'use strict';
    var md = RAD.model('note');
    this.model = new md();
    this.model.set({title:'test note 1', 'description':'test note description 1'})
},
```
Use of model in a template:
```html
<div class="my page">
    <h3>Use models, Luke!</h3>
    <div id="title">{{ model.title }}</div>
    <div id="description">{{ model.description }}</div>
</div>
```
Upon the change of the model, the render() module method will be called, and ALL of its content will be updated automatically. In order to redraw only a part of the module, the container holding the template must get the data-template attribute (for examples ref. 'Templates').

Model of application level

If the model must be available for several modules, one can instantiate a model on application level, and set 'true' as the last parameter, to create an instance.

Creating a model instance:
```javascript
RAD.model('message', Backbone.Model.extend({
        defaults: {
            title: '-',
            description: '-'
        }
}), true);
```
Changing data in the model:
```javascript
RAD.model('message').set({title: 'new note', description: 'lorem ipsum dolor'});
```

##Service

Services have no visual representation and can be used to process the internal logic of the application. Services have several callback methods, similar to view, and also can have user-defined attributes and methods.

**example**
```javascript
RAD.service("service.tracker", RAD.Blanks.Service.extend({

    observable: [
        'view.listview',
        'view.native',
        'view.js',
        'view.start_page'
    ],

    tracker: null,

    onInitialize: function () {
        this.subscribe('navigation.show', this.onStartNavigation, this);
        this.subscribe('navigation.back', this.onStartNavigation, this);
        this.subscribe('view', this.onViewLiveCycle, this);
    },

    onViewLiveCycle: function (channel, data) {
        var parts = channel.split('.'),
            viewID,
            command;

        command = parts.pop();
        viewID = parts.join('.');

        if ((command !== 'attach' && command !== 'detach') || this.observable.indexOf(viewID) === -1) {
            return;
        }

        this.publish('navigation.toast.show', {
            content: "view.toast",
            gravity: 'bottom',
            extras: (Date.now() - this.tracker)
        });
    },

    onStartNavigation: function (channel, data) {
        if (this.observable.indexOf(data.content) !== -1) {
            this.tracker = Date.now();
        }
    }

}));
```

###Declaration

Services are declared similarly to modules and are also instantiated upon receiving the first message.
```javascript
RAD.service('service.my_service', RAD.Blanks.Service.extend({
    onReceiveMsg: function (channel, data) {
        'use strict';
        var backway = data.split('').reverse().join('');
        this.publish('view.widget2', backway);
    }
}));
```
##Callbacks

Service callbacks are similar to view callbacks, but not all of them are applicable due to absence of visual representation.

####onInitialize
```javascript
onInitialize: function(){ },
```
The first of the callbacks to be executed at the end of constructor during the instantiation of a service.

####onDestroy
```javascript
onDestroy: function(){ },
```
Called before elimination of a service instance (destructor). No input parameters.

####onReceiveMsg
```javascript
onReceiveMsg: function(msg, data){ },
```
Created service is automatically subscribed to messages starting with `'service.'` and its name. Similar to module.onReceiveMsg.

Parameters:

* `msg` - message channel, a line;

* `data` - object of transmitted data (ref. publish).

##Namespace

The framework allows to use the 'namespace' template for structured storage of proper constructors, such as models, views, services etc., or inheriting the existing ones.
```javascript
RAD.namespace(destination, [obj]);
```
* destination - location of namespace;

* obj - object which will be defined in this namespace.

```javascript
//Creating object authServer in namespace RAD.network.nodes
RAD.namespace('authServer', {name: 'AuthServer', baseUrl: 'http://192.168.1.1/'});
 
//Will create in namespace RAD.utils a method getRndInt
RAD.namespace('RAD.utils.getRndInt', function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
});
 
RAD.namespace('RAD.models.toDoList', Backbone.Collection.extend({
    comparator: function (task) {
        return task.get('name');
    }
}));
 
//Example of inheriting view from RAD.Blanks.ScrollableView and its following declaration.
RAD.namespace('RAD.views.ListView', RAD.Blanks.ScrollableView.extend({
    model: new RAD.models.toDoList
}));
RAD.view('view.todo_list', RAD.views.ListView);
```
>Notice: if Backbone.View (instead of RAD.Blanks.View) serves as prototype during view inheritance, then the view inheritor will not have the RAD.Blanks.View callback methods.

The framework provides ready namespaces:

* `RAD.Class` - for custom classes;

* `RAD.models` - for models and collections;

* `RAD.views` - for view constructors;

* `RAD.services` - for services;

* `RAD.plugins` - for plugins;

* `RAD.utils` - for useful utility methods.
