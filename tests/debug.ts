import events, { EventEmitter } from '../src';

const listener1 = events.on('test-event', () => {
  debugger;
});
const myEvents = new EventEmitter();
myEvents.once('test-event', () => {
  console.log('custom event emitter event fired')
});
myEvents.emit('test-event');
events.off(listener1);
debugger;
events.off(listener1);
