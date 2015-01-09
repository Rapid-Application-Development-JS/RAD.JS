RAD.JS 2.0
======
***

Javascript framework for Rapid Application Development

---

[Tutorial](docs/tutorial.md)

<!--- [Developer Guide](guide.md) --->

[Command Line Interface](docs/cli.md)

[API Reference](docs/documentation.md)

[Tools API Reference](docs/tools.md)

<!--- [Examples](examples.md) --->

---

RAD.js 2.0:
---

MobiDev has finally released the long-awaited update of its open source multiplatform development toolkit – RAD.js Version 2.0. We designed it as the answer to the needs of business owners, software developers, and end users. Business owners and startuppers need profitable apps that work across many platforms. Software developers need to build these apps with more comfort and less effort and spent time. Target end users need apps of high quality and intuitiveness to solve their problems.

All of these demands can be handled with experienced developers and great tools. MobiDev has both. Our talented developers are under constant self-improvement, and as for RAD.js – here's the second version that opens new opportunities for software owners.

Every software owner wants to create the product faster, receive high quality, and reach across multiple platforms, with iOS and Android as the obvious must. The multiplatform may be the solution to various branded applications with unique user interfaces, PR and mass media apps (including blogs and portals), industry-specific apps that present certain products and/or services, online shops with strong backend, and many more. The exact opinion depends on the future app's functional requirements, and it should be voiced by a specialist in cross-platform development – and we are ready to help you with that.

We'd also like to tell about the main upgrades in our toolkit:
---

  1. What once was a framework, now has become a toolkit that consists of independent modules. All of them can be applied independently; they use CommonJS interface. In fact, RAD.js is compatible with other JS frameworks, which provides additional flexibility in making better software products faster.
  2. We achieved the flexibility by rewriting the core of the toolkit, separating visual and logical components. The independence of each module was a priority, and we optimized RAD.js so that each module can be used without the framework, in case of need.
  3. CLI (command line interface) was added.
  4. Basic view classes for popups were optimized; now developers don't have to use special classes. The standard view is shown as a dialogue, which contains embedded views.
  5. As for UI, we optimized it so that it works on low-power devices and older platform versions – even on Android 2.0. We rewrote transition animations and added several types.
  6. Crossbrowser events were renamed according to the spec.
  7. Examples were naturally changed and restyled.
  8. Along the way we encountered several non-critical bugs, which were quickly eliminated. Now the toolkit is ready and waiting, and cross-platform developers can unleash their creativity.

We are glad that RAD.js has been gathering a developer audience for quite a while, and we are willing to grow it by involving more people and expanding the functional filling (the nearest plans are adding a tutorial, infinite scroll, and drag-n-drop). But the real end goal is making great software for our Clients and their end users.

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

***
["rad-js.com"](http://rad-js.com/ "rad-js.com") 
