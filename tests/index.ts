import events, { EventEmitter } from '../src';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

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
    events.off(listener);   // it's a once, already removed so this is a no-op
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

  @test('once')
  once(done: Function) {
    events.once('test-event', () => {
      done();
    });
    events.emit('test-event');
    events.emit('test-event');
  }

  @test('Private Event Emitter')
  private_emitter(done: Function) {
    const listener1 = events.on('test-event', () => {
      done(new Error('global emitter called for private event'));
    });
    const myEvents = new EventEmitter();
    myEvents.once('test-event', () => {
      done();
    });
    myEvents.emit('test-event');
    events.off(listener1);
  }

  @test('off inside on')
  off_inside_on(done: Function) {
    const listener1 = events.on('test-event', () => {
      events.off(listener1);
      assert(listener1.dead, "listener should be dead now");
      done();   // should only be called once
    });
    events.emit('test-event');
    events.emit('test-event');
    events.emit('test-event');
  }

  @test('dead listener')
  dead_listener(done: Function) {
    const listener1 = events.on('test-event', () => {
      done(new Error('should not be called'));
    });
    events.off(listener1);
    assert(listener1.dead, "listener should be dead now");
    events.off(listener1);    // no-op
    events.fire('test-event');  // no-op
    done();
  }

  @test('garbage collection')
  garbage_collection(done: Function) {

    for (let i = 0; i < 3; i++) {
      const listener1 = events.on('test-event', () => {});
      const listener2 = events.on('test-event', () => {});
      const listener3 = events.on('other-event', () => {});
      events.gc();
      events.off(listener1);
      events.gc();
      events.off(listener2);
      events.off(listener3);
      events.gc();
      events.emit('test-event');
    }

    done();
  }

  static after() {
    // should produce no output
    events.diagnostics();
  }

}
