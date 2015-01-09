#Development of a simplest application

We will overview development of a simplest application, comprising a few pages, services, and transition animations.

>It should be noted that **RAD.js** is a system helper for [backbone.js](http://backbonejs.org/), which extends the capabilities of the basic [View](http://backbonejs.org/#View) and inputs callback methods of the lifecycle of application parts and a low-coupling application architecture (in a low-related architecture, modules should not interact directly with each other, they should only send messages, which provides big flexibility and stability in work. You can read more by the following links [1](https://ru.wikipedia.org/wiki/GRASP), [2](http://rachkov.pro/blog/6)). This is why everything that works for [backbone.js](http://backbonejs.org/) and for [underscorejs.org](http://underscorejs.org/), works for **RAD.js** as well.

We will start with preparing the environment.

##Installation of Command Line Interface

Let's start with installation of CLI.

Presence of installed `node.js` and `npm` is required.

>Installation should be conducted with an administrator account.

```bash
>sudo npm install -g rad-cli
```

You can check correctness and version using this command:
```bash
>rad -V
0.1.3
```
##Creating the project

It is possible to create a project in an existing directory from scratch.

```bash
>rad create rad_project
project created
required libs copied successfully
CSS copied successfully
copy file /usr/local/lib/node_modules/rad-cli/node_modules/rad/bin/rad.js
index.html created
index.js created
application.js created
RAD lib copied successfully
```
Then the following project structure will be created:

![project stucture](images/project.png)

Where:
- `index.html` is the main executable `html` file, containing the connection of style files, libraries, and the main `js` file;
- `index.js` is the main executable `js` file, containing the loading of all `js` files of the project and the launch of the application object from `aplication.js`;
- **source** - the whole source code of the application;
	- **application**
		- `application.js` - file with the application object;
	- **assets** - directory for assets;
		- **css** - directory for CSS files;
			- `rad.css` - main styles that use the framework;
			- `transitions.css` - extendable styles for transition animations;
		- **img** - directory for images;
	- **external** - directory for external `js` dependencies. After the addition of scripts to this folder, they will be automatically added to the scripts loading list. **index.js** (after `>rad update`);
	- **lib** - directory for libraries that `RAD.js` depends on;
	- **models** - directory for data models;
	- **rad** - directory for the framework;
	- **service** - directory for services;
	- **views** - directory for views;

##Adding a third-party CSS file

You can add your `css` file to the **css** directory and launch a command:
```bash
>rad update
```
Your file will be added to `index.html` as `link`.

>Unfortunately, you don't have the possibility to set the sequence of connection for `css` files. That's why it is possible to use a little "hack": styles are connected in alphabetical order; and if you name your file with styles, considering this requirement, it will be loaded in the first place.
>We used this approach to connect the `reset.css` file in the first turn, having renamed it as `_reset.css`

In case you need to delete an unneeded `css` file, delete it manually and execute:
```bash
>rad update
```

##Adding a screen to the application 

An application on `RAD.js` usually consists of the following parts: 
- `application` - application object, where we implement methods required for functioning of the application; 
- `views` - functionally detached part of the application that contains visual representation;
- `models` - data model in the application.
- `services` - part of the application that does not contain visual representation.

### Adding a new `view`

We need to create a new screen; this means a new part of the application that contains visual representation (`view`). Let's update the project at the same time:

```bash
> rad add view screen.home
view screen.home added
> rad update              
index.js created
index.html created
>
```
>Please note: the command `rad update` affects only `index.js` and `index.html`. Therefore, if you don't add new files, you have no need to launch it because it's not a **build** of the source code.

We recommend to use two-level names for `view`, like in our `screen.home` example. It will help you create clearer and more readable code in the future: `screen.home`, `screen.search_results`, `screen.details`, `view.header`, `view.toast`, etc.

>Note: regardless of the written **"index.js created"** and **"index.html created"**, `index.js` is not fully recreated, as opposed to `index.html` - only the content between the meta-tags `#script_begin#` and ` #script_end#` changes. That's why you can freely change the content of `index.js` according to your needs, for example, to turn on `debug` or `backstack` settings. When you use the `rad update` command in `index.js` and `index.html`, all connections will be updated by default between the commented tags #script_begin#` and `#script_end#. In this case we disregard all the connected libraries and scripts, which are not from RAD.js and are not located in default folders.


### Review of plugin.navigation
It processes all messages with the root node `navigation.` and controls `views` (displaying, hiding, provision of the backstack and notifications about changes of the state).

```javascript
var options = {
	container_id: '#someid',
	content: 'view.someview',
	animation: "none",
	backstack: false,
	callback: null,
	extras: null
};
this.publish('navigation.show', options);
```
We display the module specified in the `options.content` in the container `options.container_id` (CSS selector).  `options`parameters:
 - **container_id** - registered name of the `viewID` module, which will be displayed.
 - **container_id** - selector of a container's element for displaying the module.
 - **animation** - animation used during the change of `view` in a specified container.
 - **callback** - function launched upon completion of displaying the `content` module.
 - **context** - execution context for `callback`.
 - **extras** - additional data transmitted to `view`. Detailed review further. 

### Displaying a screen using plugin.navigation

If you launch `index.html` in the browser, you will see a native alert saying that the application has been launched. Yet we need to show the user the screen that we have generated. 

For this purpose we can look at `index.js`and see that the method from `application`is executed:

```javascript
//start
application.start();
```

Essentially, you can launch any method of the application object or give the `plugin.navigator` command directly to display the needed `view`. But it would be better to have the simplest possible architecture in the application.

This is why we enter `application.js` and in the `start` method we write the required actions to show a new screen.
```javascript
RAD.application(function (core) {
    var app = this;

    app.start = function () {
        var options = {
            container_id: '#screen',
            content: 'screen.home',
            animation: 'none',
            backstack: true
        };

        core.publish('navigation.show', options);
    };

    return app;
}, true);
```
Here we used the core method `publish` to send a message for `plugin.navigator` with request to display a `screen.home` `view`, without animation (`animation: 'none'`) in the container with the CSS selector `#screen`.

>`backstack: true` - we will need it later for navigation through the backstack.

Now if you launch `index.html`, you won't see the alert anymore. Instead you will see an inscription  **screen.home**. This inscription was automatically generated in the **template** of `screen.view` upon its creation.

>The `publish` method is also available in `views` and `services` through `this.publish(channel, data);`. However, in order to gather all navigation between `views` in one place, we will implement it in the application object.

##Data loading

We will use a standard data model to store data in the application. We mean the  **backbone.js** data model. It allows to connect `model` and `view` directly in the application.

>Use of `models` from [backbone.js](http://backbonejs.org/) is not the only possible way. It is also possible to call methods or refer to the `view` attributes directly from the patterns, which means creating calculated fields. We can also operate the DOM directly. However, this goes a little beyond the minimal product tutorial and will be overviewed separately.

###Creating the data `model`

Let's generate a new model for the list and name it `collection.phones`:
```bash
>rad add collection collection.phones
collection collection.phones added
>rad update
index.js created
index.html created
```
Now this model is added to the subdirectory **collection.phones** in the **models** directory.
There you can see that models and collections in RAD.js are inherited from `Backbone.Model` and  `Backbone.Collection` accordingly, without any changes or additions. They are just registered in `service.locator`.

>You can read more about work with [`collection`](http://backbonejs.org/#Collection) and [`model`](http://backbonejs.org/#Model) in  `backbone.js`. It should be noted that during the linking `collection` or `model` to `view`, `view` automatically subscribes to the data event and calls its own method `render`.

Now, calling the service locator to the `RAD.model("collection.phones")` collection identifiers, we can get access to the instance of this collection from anywhere within the application. The same goes for models. 

>When you designate the second parameter `true` during the collection registration:
>```javascript
>RAD.model('collection.phones', Backbone.Collection.extend({
>}), true);
>```
>An instance will be created automatically. If you want to avoid it, for example, for inheriting, you should set up the `false` parameter. Here you should only pay attention to the order of loading of the parental model; or the inheritor should be described directly in the file of the parental model.

###Creating `service` for data loading

Sure we can redefine the [`fetch`](http://backbonejs.org/#Collection-fetch) method in the collection, but unfortunately it is not always the optimal way. This is why (and as well to illustrate the possibility of work with services) we use a custom service to load data to the model.

Let's generate an empty service.
```bash
>rad add service service.json_loader 
service service.json_loader added
>rad update                         
index.js created
index.html created
```
>It's highly desirable for the service to have **service** as the first part of the identifier. It lets you use some of additional capabilities of the framework, for example, simultaneous initialization of all services, etc.

Look at the generated code `service.json_loader`:
```javascript
RAD.service("service.json_loader", RAD.Blanks.Service.extend({
    onReceiveMsg: function (channel, data) {
        window.console.log('channel:', channel, 'data:', data);
    }
}));
```
You can see a method that accepts all messages for this module and its subchannels. It will be our main method in the service. 

We will add some functionality to the `application.js` to achieve this.

### We launch `service` and send messages to it

It would be logical to initiate a loading of json data upon the application start, this is why we will add launch of all registered services and message delivery:
```javascript
app.start = function () {
    var options = {
        container_id: '#screen',
        content: "screen.home",
        animation: 'none',
        backstack: true
    };

    core.startService();
    core.publish('service.json_loader.get',  {file: "phones.json", loader: false});

    core.publish('navigation.show', options);
};
```
> `core.startService();` because the array of service identifiers is called, it launches all services. Otherwise you have to transmit one identifier or an array of identifiers.

For example, in the `console` of the browser you can see a message about acceptance of data by your server, similar to this:
```bash
channel: service.json_loader.get data: Object {file: "phones.json", loader: false} service.json_loader.js:5
```
> If you have issues, you can turn the `debug` mode in the core options (`index.js`) anytime:
> ```javascript
> coreOptions = {
> 	defaultBackstack: false,
> 	defaultAnimation: 'none',
> 	animationTimeout: 3000,
> 	debug: true // <---
>}
> ```
> and overview all that's happenning in the core.

###Processing the message

As you could see above, we sent a message from the application object to the channel: `service.json_loader.get` with data: `{file: "phones.json", loader: false}`. 

During the instantiation all `services` and `views` automatically subscribe to the channel with a congruent name, and to all subchannels that start with it. That is why we have accepted the message to the service - and now we can process the command and perform actions.

```javascript
RAD.service("service.json_loader", RAD.Blanks.Service.extend({
    _getJson: function (file, callback) {
        var that = this;

        $.getJSON(file, function (json) {
            if (typeof callback === 'function') {
                callback(json);
            }
        }).done(function () {
            // try to hide loader anyway
            that.publish('navigation.dialog.close', {content: 'screen.loader'});
        });
    },

    onReceiveMsg: function (channel, data) {
        var parts = channel.split('.'),
            command = parts[parts.length - 1];

        switch (command) {
        case 'get':
            if (data.loader) {
                // show loader popup if we need it
                this.publish('navigation.dialog.show', {content: 'screen.loader'});
            }
            this._getJson(data.file, data.callback);
            break;
        }
    }
}));
```
Let's make a detailed overview of what we have implemented in the service.

In the `onReceiveMsg` method we parce the channel that received the object of the message, allocating the last subchannel. We used its name as a command for the service. How exactly this message should be processed: we want the service to load a json file, and then to launch a callback method if it's present in the message.

>Talking about productivity of mobile applications, it's measured and evaluated by the end user according to the responsiveness of the user interface, not by the tests. Since data binding is functionally located in every `view` and DOM structure is free from excessive elements, the application becomes responsive.

RAD.js is based on `backbone.js`, and this framework is dependent on `jquery`; we can use `jquery` methods in our application.

>Take note that we send messages with a request to show and hide the message about the loading.
>```javascript
>this.publish('navigation.dialog.show', {content: 'view.loader'});
>```
>and
>
>```javascript
>service.publish('navigation.dialog.close', {content: 'view.loader'});
>```
>Currently nothing is happenning. But if you set the value of the `loader` parameter to `true` when you send the message from the application object, the application will keep on working correctly despite the fact that this `view` does not exist yet. It's all owing to the advantages of the `publisher subscriber` architecture. 
>
>In `console` will be shown a warning about the absence of the needed `view`.

###Adding data to the `model`

Now let's add the loaded data to the model.

For this purpose we implement a callback method in the message for `service.json_loader` from the `start` method in `application.js`.
```javascript
core.publish('service.json_loader.get', {
    file: "phones.json",
    loader: true,
    callback: function (json) {
        RAD.model('collection.phones').add(json);
    }
});
```
>For example, you can transmit a model identifier within the message for the service and load data to the model directly in the service, or transmit data from the service with the message for `view` (if there are not too many of them, and if they are not used elsewhere in the application).
>
>Everything depends on your specific requirements. Here we have done it this way to demonstrate the capabilities of callback methods. 

##Changing the content of `view`

All the `js` and `html` files, generated with help of CLI, are stored for every single `view` in subdirectories of the `views` directory; names of these subdirectories and names of **views** must match. These files basically are JavaScript code of `view` and its template.

Since we need to display the received data on `screen.home`, we must take these two steps:
- link `collection.phones` to `screen.home`;
- implement the template for `screen.home`.

###We link `model`/`collection` to `view`

You can use the CLI command to link `collection.phones` to `screen.home`:

```bash
>rad link screen.home collection.phones
PM LINK screen.home collection.phones
collection.phones linked to screen.home
```

When you enter `screen.home`, you will see the following code:
```javascript
RAD.view("screen.home", RAD.Blanks.View.extend({
    url: 'source/views/screen.home/screen.home.html',
    model : RAD.model('collection.phones'),
...
```

As you can see from the code, the main moment of linking `model` or `collection` to `view` is the process of installing the `model` attribute. Everything else, for example, subscribing to model events and transferring the model to the template, will happen automatically, when the `onInitialize` method from `view` will be launched.

>If you need to set the model after the instantiation of `view`(which means upon the launch of `onInitialize`), you can use such `view` methods as `bindModel`, `unbindModel` and `changeModel`.

Currently the feature of setting the order to launch the scripts does not exist (it will be added in the next version), despite the fact that instantiation of `view` is lazy. Extension of `Backbone.View` can happen before the moment when the model is loaded, which can cause an error. While we plan to add this feature to `script.loader` in the nearest future, currently we do not recommend to link the model to CLI. It is better to set it as an attribute, as a `view` in `onInitialize`:
```javascript
RAD.view("screen.home", RAD.Blanks.View.extend({

    url: 'source/views/screen.home/screen.home.html',

    onInitialize: function () {
        this.model = RAD.model('collection.phones'); //<--
    }

    /*
     onNewExtras: function () {
     },
     onReceiveMsg: function (channel, data) {
     },
     onStartRender: function () {
     },
     onEndRender: function () {
     },
     onBeforeAttach: function () {
     },
     onStartAttach: function () {
     },
     onEndAttach: function () {
     },
     onEndDetach: function () {
     },
     onDestroy: function () {
     }
     */
}));
``` 
It will be quite enough.

>Pay attention to callback methods generated for the lifecycle of `view`. It eases developer's work by showing the full lifecycle of `view`.

![project stucture](images/view-lifecycle.png)

###Working with the template

Here are the rules used in RAD.js for the pattern maker:

- `{{ ... }}` - evaluate;
- `{{# ... }}` - interpolate;
- `{{{ ... }}}` - escape;
- `this. ...` - reference to `view` instance from the template. By using this link you can call methods or use attributes of a `view` that owns the pattern;
- `model` - link to a JavaScript object, the `Backbone.Model` of which is linked to `view`. Please pay attention that it is exactly a **javascript object**;
- `data-template` - custom HTML attribute for creating subtemplates;

>We'd like to pay more attention to `data-template`. If this attribute is set on the root element, during the model change only the contents of this element will be re-rendered. In the `template` there may be any number of `data-template` attributes, but they cannot be put into each other.
>


Let's overview an example of the simplest template for displaying a list from our collection.
```html
<ul class="screen-home-list">
    {{# _.each(model, function(item, index) { }}
    <li class="screen-home-list-item">{{ item.name }}</li>
    {{# }); }}
</ul>
```
If you launch the application like this, you'll see a displayed list of devices, received from the file: "Motorola XOOM™ with Wi-Fi", "MOTOROLA XOOM™", etc.

Please note that `model` is available from the template as a JavaScript object, as we mentioned previously, and we use **underscore.js** methods for sorting out the elements of the array. 

>Also note that if you want to add more models to the view, all of them will be `Backbone` models and you should use [Backbone methods](http://backbonejs.org/#Model) to work with them.

Read more about work with templates: [underscore.js](http://underscorejs.org/#template).

##Making a scrolling `view` 

Unfortunately, if you launch an application in the browser on too small a screen (for example, on a mobile device), you will see only a part of it and you won't be able to scroll it to see everything. 

The reason is that `views` use `position: absolute;` for animation.

There are two ways to make a scrolling `view`:

###Using a CSS class
Use of the `.native-scroll` CSS class for the container where the content will be scrolled.

In our case we need to scroll all the content of `view`, this is why it will be simpler to add an attribute **className** directly to `view`. You may read more [here](http://backbonejs.org/#View-extend).

If you launch it now, the scroll won't work yet, because the root element `view` has no length or width. Let's create a CSS class:
```css
.screen {
    height: 100%;
    width: 100%;
}
```
Now let's implement CSS classes `.screen` and `.native-scroll` for the **className** attribute:
```javascript
RAD.view("screen.home", RAD.Blanks.View.extend({
    className: "screen native-scroll", // <--
    url: 'source/views/screen.home/screen.home.html',
...
```

Now the scroll will work.

>We'd also like to mention that native implementation of the scroll has a few disadvantages: 
> - it is different for each platform and may be visually different for every browser;
> - besides, native scroll does not work at all for the internal elements of the page on older devices, for example, those running Android 2.X;
> - on some platforms it is impossible to trace the gesture which launches the scroll;
> - animation during the scroll does not work on some browsers.

###Using the JavaScript custom scroll

If you are not satisfied with the abovementioned disadvantages, you may use readymade implementation of JavaScript custom scroll in RAD.js, based on [iScroll](http://iscrolljs.com/) (or implement your own `ScrollableView` and inherit from it).

Also in RAD.js there is `RAD.Blanks.ScrollableView`, which implements the scroll functionality with JavaScript.

It would be correct to generate `screen.home` from the very beginning not as `rad add view screen.home`, but rather as `rad add scrollable screen.home`, because this command has generated a `view` with another parental class.

But in our case we will only correct the parental class of our `view`, since we have already made some changes in the source code of `screen.home`:

```javascript
RAD.view("screen.home", RAD.Blanks.ScrollableView.extend({ //<--
    className: "screen", //<--
    ...
```
>Please note that in this case you will need a class that defines the size of the root element `view` as well.


>
>In case of need, you may scroll not the whole container, but its part. For this purpose you need to define an element of the window that will be scrolled. It is possible with a CSS class `.scroll-view`. It should be also noted that the functionality of the scroll will be added only to the first child of this element. The inner sizes should be defined for the element with the `.scroll-view` as well.

###Dynamic addition of elements to `ScrollableView`

Let's add a button which will launch the loading of **json** with new data upon tapping. Events in **DOM** will be described further in detail.

```javascript
events: {
	'tap .screen-home-list-item' : 'onItemClick',
	'tap .back-button' : 'onloadNextClick'
}

...

onloadNextClick: function (e) {
	this.application.loadList();
}
 ```
 template:
 
 ```javascript
 <div class="scroll-view screen-height">
	<ul data-template>
		{{# _.each(model, function(item, index) { }}
		<li class="screen-home-list-item" data-id="{{ item.id }}">
			<div id="item-list">
				<div class="image-wrapper"><img src='{{ item.imageUrl }}'/></div>
				<div>
					<p> {{ item.name }} - {{ index }}</p>
				</div>
			</div>
		</li>
		{{# }); }}
	</ul>
</div>
 ```
You can see that the scroll comes to default and comes back to the top when you scroll the list and then push **load next**. In order to fix it, you should add an empty `div`:
  ```javascript
 <div class="scroll-view screen-height">
	<div> <!-- empty div -->
		<ul data-template>
			{{# _.each(model, function(item, index) { }}
			 ...
```
> The solution with paste of an empty `div` is a little unobvious. It will be fixed in the next update.

##Tracking DOM events in `view`

Since `view` is inherited from `Backbone.View`, we are going to work with events accordingly.

```javascript
RAD.view("screen.home", RAD.Blanks.ScrollableView.extend({

    className: "screen",

    url: 'source/views/screen.home/screen.home.html',

    onInitialize: function () {
        this.model = RAD.model('collection.phones');
    },
	 /// <-- START event tracking
    events: {
        'tap .screen-home-list-item' : 'onItemClick'
    },

    onItemClick: function (e) {
        var id = e.currentTarget.getAttribute('data-id');
        this.application.showDetails(id);
    }
    /// <-- END event tracking
}));
```
In this example we replaced the default `click` event with `tap` to prevent the well-known **300ms** pause on mobile devices and connected it to the `.screen-home-list-item` CSS class.

>It is also possible to track `longtap` events (longer than 250ms) and `fling`.

The `onItemClick` method is launched upon the `tap` event. In this method the line identifier is taken from the template and transmitted to the method of the application object.

We also need to create a method in the application object and add it to the template for each identifier item.

`screen.home.html`:
```html
<ul class="screen-home-list">
    {{# _.each(model, function(item, index) { }}
    <li class="screen-home-list-item" data-id="{{ item.id }}">{{ item.name }}</li> <!-- new attribute -->
    {{# }); }}
</ul>
```
`application.js`:
```javascript
  app.showDetails = function (id) {
        var options = {
            container_id: '#screen',
            content: 'screen.details',
            backstack: true,
            extras: id
        };
        core.publish('navigation.show', options);
    }
```
We add our `id` and send a message to display `screen.details` on the view in `app.showDetails`, in `extras`.

Please take notice of the following:
- We removed `animation` from `options` for `core.publish('navigation.show', options);`. That's why the `defaultAnimation` value will be used in core options in `index.js`. You should set the value for it, for example, `slide`;
- We extend `options` with a specific attribute `extras` after receiving `json` in the callback method. We will discuss it below in detail.

##Creating a new `view` and transmitting data to it

### Generating a `view`
Now we need to generate a new `view`, because previously we have already sent a message with a request to show `screen.details`, but there was an empty screen after the animation:
>rad add scrollable screen.details
scrollable screen.details added
>rad update
index.js created
index.html created
```
This time we have immediately generated `screen.details` on the basis of the parental class `RAD.Blanks.ScrollableView`.

### Receiving the transmitted data

Let's go to `screen.details.js` and uncomment the `onNewExtras` method by adding the output to the console:
```javascript
RAD.view("screen.details", RAD.Blanks.ScrollableView.extend({

    url: 'source/views/screen.details/screen.details.html',

    onNewExtras: function (extras) {
        console.log(extras);
    }
/*
    onInitialize: function () {        
    },
    onReceiveMsg: function (channel, data) {       
    },
    onStartRender: function () {        
    },
    onEndRender: function () {        
    },
    onStartAttach: function () {       
    },
    onEndAttach: function () {
    },
    onEndDetach: function () {        
    },
    onDestroy: function () {        
    }
*/
}));
```
During the execution of the application you can see the data that was transmitted to the callback method `onNewExtras`. This data is the same that was installed to the `extras` attribute during the `plugin.navigator` message reference.

This attribute `extras` in the message for the navigator is intended for transmission of any data before, after, and during the animation. 

> You can also transmit data through `this.application`, setting some data as an attributes of the application's object. It is also possible through a third-party service. But anyway in both cases `view` should independently initiate data verification.

### Creating and updating the model 
Let's create a model:
```bash
>rad add model model.itemDetail
```

Now we refresh the files:

```bash
>rad update
```
The model has been created in the **models** directory. 
Now let's create a model sample in the `screen.details` view:
```javascript
onInitialize: function () {
	this.model  = new RAD.model('model.itemDetail');
},
```
Now the model sample is created and we can update the model depending on the `id` received during the **onNewExtras** event:
```javascript
onNewExtras: function (_id) {
	this.model.set(RAD.model('collection.phones').findWhere({id:_id}).toJSON());
}
```
Now the model is updated and our **screen.details** is rendered. This can be seen by uncommenting **onStartRender** and displaying the text in the console.
```javascript
onStartRender: function () {
   console.log("screen.details rendered!");     
}
 ```

			 
##Adding the feature of returning to the previous screen
Let's add a `back` button to the template and write an event and event handler for the button:
```javascript
events: {
	'tap .back-button' : 'onItemClick'
},
onItemClick: function (e) {
	this.publish('router.back', null);
}
```
We should also make sure that the `backstack:true` parameter is set when `publish.show` is called; or if the same parameter is set in `index.js` as the default value. 
```javascript
function onEndLoad() {
	var core = window.RAD.core,
	application = window.RAD.application,
	coreOptions = {
		defaultBackstack: true,
		defaultAnimation: 'slide',
		animationTimeout: 3000,
	};
	...
}

```


---
Sources of the tutorial are available here - [sources](source/rad_project.zip).

---