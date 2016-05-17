##pub_sub.js

Implementation of **event bus** of the architecture, based on the `publisher-subscriber` pattern. The differences are as follows:
- possibility of implementation of tree-structured events (subchannels) of any nesting. For example, module A can be subscribed to the channel `navigation`; module B - to `navigation.dialog`. When a message will be sent to the `navigation.dialog` channel, module A will receive it as well, since it is subscribed to the root channel.
- `sticky` events. It is possible to send and event of this type, and  **event bus** will deliver it to all subscribers. Whenever a new subscriber registers, a `sticky` event will be delievered anyway.

### Methods

#### printLog
```javascript
printLog(flag);
```
	
Takes **true/false** as the parameter. If set 'true', it writes the info about events and channels in the browser console. 
	
#### channels
```javascript
channels();
```

Returns the existing message channels, to which listeners are subscribed.
	
#### setSeparator
```javascript
setSeparator(sprtr);
```
	
Sets the character, conveyed in the parameter **sprtr** for use as the separator of event subchannels.
	
#### publish
```javascript
publish(channel, data, type);
```
	
Publishes the message on **channel**, delivering the object **data** to subscribers. It is possible to use the message type **type**.

Supported message types:

- `sticky` - the message will be delivered to all modules subscribed to events in the actual channel, then 'sticked' for delivering it to new subscribers later on.
	
#### subscribe
```javascript
subscribe(channel, fn, context);
```
	
Subscribes the callback fuction **fn** to execution in **context** upon receiving the message by **channel**.

#### unsubscribe
```javascript
unsubscribe(channel, fn, context);
```

Unsubscribes from **channel**; valid for subscribers that are registered with the callback function **fn** in **context**.
```javascript
unsubscribe('some.channel', callback);
```
	
Unsubscribes from **channel**; valid for subscribers that are registered with the callback function **fn** without defined context.
```javascript
unsubscribe('some.channel', context);
```

Unsubscribes from a selected channel; valid for subscribers registered in **context**.
```javascript 
unsubscribe(context);
```
	
Unsubscribes from all channels; valid for all subscribers registered in **context**.