RAD.JS 2.0
======
***
[PhoneGap optimized javascript framework](http://rad-js.com/ "rad-js.com") 

---

<!--- [Tutorial](tutorial.md) --->

<!--- [Developer Guide](guide.md) --->

[Command Line Interface](docs/cli.md)

[API Reference](docs/documentation.md)

[Tools API Reference](docs/tools.md)

<!--- [Examples](examples.md) --->

---

What RAD.js is:
---

A system-level framework. It allows to build a single-page application that looks and feels as a conventional multi-page one. It also takes over system-level tasks, such as message bus, creating and deleting certain part instances of the application, transactions between views, etc.

What RAD.js isn't:
---

  - An MV* framework. In RAD.js, MV* is based upon BackboneJS;
  - An application-level framework. Any JavaScript object can serve as an application. The framework does not require any special environments for creating an object of the application;
  - A layout engine. The layout engine is implemented as a navigation plugin for the framework core;
  - A UI framework. There is no reason in creating another UI framework, because in real-life projects UI patterns and appearance of applications change. ScrollableView, PopupView and ToastView serve as an extension to the basic view; all of these have extended and frequent behavior in different projects. You can easily write new views (such as ListView), which are frequently used in your projects.

Advantages:
---

  - CLI
  - The framework is optimized for PhoneGap and mobile browsers;
  - Ability to dynamically control (create and delete) module instances of the application through the functionality of the core, at both view level and application level;
  - Ability to build an application consisting of loosely bound modules: models, views, services (application part without visual representation); and of the object of the application;
  - Tree-structured messaging;
  - Debug mode of the core and messages;
  - Flexible and loosely bound architecture - almost any extraneous code can be enveloped by the module with several lines of code. Failure of a module doesn't cause failure of the whole application;
  - Ability to monitor the lifecycle of view and services. Callback methods for all lifecycle events;
  - Templating. A template is an HTML file that can be created separately;
  - Partial templating of view. Ability to determine parts of the view template, that will or will not be rerendered by changes of data within a model;
  - Any JavaScript object can serve as the object of the application;
  - Ability to extend functionality of the core via plugins;
  - Complex embedded views and declarative transition animations between them;
  - Ability to inherit views, services and models;
  - Modal and non-modal self-positioning windows;
  - Dynamic routing; it's enough to set the ''backstack: true'' parameter to enter transaction between views (new position of views on the screen) to the browser history;
  - Reuse of modules in other projects;
  - Module testing can be performed through external frameworks.

Dependencies:
---

  - BackboneJS;
  - UnderscoreJS;
  - JQuery;

***
License
---
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software under the following conditions:
Mobidev Corp. reserves the right to specify in any matter without any limitations
- the Publishers/Distributors which use "Software" in their products;
- products which contain "Software";
- sources containing "Software"
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHER WISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
