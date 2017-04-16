import events, { EventEmitter } from '../src';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

let listener1, listener2, listener3;

function assert(test: boolean, message: string) {
  if (!test) throw new Error(message);
}

@suite class eventjs {

  @test("on, emit, off")
  on_emit_off() {
    let result;
    let count = 0;
    const listener = events.on('test-event', (a1: any) => {
      result = a1;
      count ++;
    });
    events.emit('test-event', 'hello world');
    events.emit('test-event', 'abc');
    events.emit('test-event', 123);
    events.off(listener);
    assert(result === 123, 'event did not fire properly, result=' + result);
    assert(count === 3, 'event fired incorrect number of times count=' + count);
  }

  @test("addListener, fire, removeListener")
  add_fire_remove() {
    let result;
    let count = 0;
    const listener = events.addListener('test-event', false, (a1: any) => {
      result = a1;
      count ++;
    });
    events.fire('test-event', 'hello world');
    events.fire('test-event', 'abc');
    events.fire('test-event', 123);
    events.emit('wrong-event', 456);    // this shouldn't trigger any handlers
    events.removeListener(listener);
    assert(result === 123, 'event did not fire properly, result=' + result);
    assert(count === 3, 'event fired incorrect number of times count=' + count);
  }

  @test("on, once, off")
  on_once_off() {
    let result;
    let count = 0;
    const listener = events.once('test-event', (a1: string) => {
      result = a1;
      count ++;
    });
    events.emit('test-event', 'hello world');
    events.emit('test-event', 'abc');
    events.emit('test-event', 123);
    events.off(listener);
    assert(result === 'hello world', 'event did not fire properly, result=' + result);
    assert(count === 1, 'event fired incorrect number of times count=' + count);
  }

  @test("Multiple Listeners")
  multiple_listeners() {
    let result;
    let count = 0;
    const listener1 = events.once('test-event', (a1: string) => {
      result = a1;
      count ++;
    });
    const listener2 = events.on('test-event', () => { count++; });
    const listener3 = events.on('test-event', () => { count++; });
    events.emit('test-event', 'hello world');
    events.emit('test-event', 'abc');
    events.emit('test-event', 123);
    events.off(listener1);
    events.off(listener2);
    events.off(listener3);
    assert(result === 'hello world', 'event did not fire properly, result=' + result);
    assert(count === 7, 'event fired incorrect number of times count=' + count);
  }
}
