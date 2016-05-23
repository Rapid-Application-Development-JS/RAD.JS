##service_locator.js

Implementation of the `service locator` pattern. 

Advantages:
- option of adding extra attributes and methods using `mixin` pattern to all objects registered in Service Locator;
- option of lazy instantiation;
- unregistering instances;
- unregistering objects.


###Methods

#### printLog
```javascript
printLog(flag);
```
	
Takes **true/false** values as a parameter. When **true**, writes information about events and channels into the browser console. 

#### setMixin
```javascript
setMixin(obj);
```

Takes an object as a parameter. The object contains a set of additional properties and/or methods, which have to contain all objects registered in Service Locator.

#### getLocator
```javascript
getLocator();
```
	
Returns the container that has all the objects registered in Service Locator.

#### register
```javascript	
register(value, obj, instantiate);
```
	
Registers an object **obj** under the name **value**. The flag **instantiate** shows, whether lazy instantiation is required to request the object from Service Locator. By default **instantiate** is **true**.

#### registerAll
```javascript		
registerAll(arrayOfServices);
```
	
Calls the **register** function for each element of **arrayOfServices**. Each element of the input array must contain one of the **radID**/**ID**/**id** properties for defining the object name, and **service**/**obj**/**object**/**creator** for defining the object under registration. There is optional **instantiate**.

#### get
```javascript	
get(id);
```
	
Returns the instance of a registered object with an indicated **id** or creates a new one in the case of lazy instantiation.

#### instantiateAll
```javascript	
instantiateAll(filter)
```

Instantiates and returns all registered objects. Can take the **filter** function as an argument. The **filter** function must return the logical value. In case **filter** is predefined, only the services that underwent the check will be instantiated. 

#### getAllInstantiate
```javascript	
getAllInstantiate(withConstructor)
```
	
Returns the array of instantiated objects.

#### removeInstance
```javascript	
removeInstance(id)
```

Deletes a service instance with an indicated **id**. Returns **false** in case the service with the indicated **id** is not found or has no instance.

#### unregister
```javascript	
unregister(value, removeMixin)
```

Deletes a service named **value** from Service Locator and returns its instance. The flag **removeMixin** points at the necessity to delete the added properties.

#### unregisterAll
```javascript	
unregisterAll(removeMixins)
```

Deletes all registered services from Service Locator, and returns the array of their instances. The flag **removeMixin** points at the necessity to delete the added properties in the services that will be deleted.