/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @Author: Mehuge (mehuge@sorcerer.co.uk)
 * @Date: 2017-04-16 19:53:47
 * @Last Modified by: Mehuge (mehuge@sorcerer.co.uk)
 * @Last Modified time: 2017-04-17 00:31:16
 */

let internalId = 0;

class Listener {
  public id: number;
  public topic: string;
  public once: boolean;
  public callback: (...params: any[]) => void;
  public fired: number = 0;
  public last: number = 0;
  public dead: number = 0;
  constructor(topic: string, once: boolean, callback: (...params: any[]) => void) {
    this.topic = topic;
    this.once = once;
    this.callback = callback;
    this.id = ++internalId;
  }
}

interface Topic {
  count: number;
  listeners: Listener[];
}

class EventEmitter {
  private events: any;
  constructor() {
    this.events = {};
  }

  /**
   * addListener() is called to register a listener for a topic.
   *
   * @param topic {string}         Topic name
   * @param once {boolean}         Fire event only once (auto-unregister) [optional]
   * @param callback {function}    Handler to call when topic is fired
   */
  public addListener(topic: string, once: boolean = false, callback: (...params: any[]) => void): any {
    const T: Topic = this.events[topic] = this.events[topic] || { count: 0, listeners: [] };
    const listeners: Listener[] = T.listeners;
    const listener: Listener = new Listener(topic, once, callback);
    const i: number = listeners.indexOf(null);
    if (i === -1) {
      listeners.push(listener);
    } else {
      listeners[i] = listener;
    }
    T.count ++;
    return listener;
  }

  /**
   * on() is called to register a listener for a topic.
   *
   * @param topic {string}         Topic name
   * @param callback {function}    Handler to call when topic is fired
   */
  public on(topic: string, callback: (...params: any[]) => void): any {
    return this.addListener(topic, false, callback);
  }

  /**
   * once() is called to register a listener for a topic that will
   * fire only once before being auto-removed.
   *
   * @param topic {string}         Topic name
   * @param callback {function}    Handler to call when topic is fired
   */
  public once(topic: string, callback: (...params: any[]) => void): any {
    return this.addListener(topic, true, callback);
  }

  /**
   * listenOnce() is an alias for once()
   */
  public listenOnce(topic: string, callback: (...params: any[]) => void): any {
    return this.addListener(topic, true, callback);
  }

  /**
   * removeListener() is called to deregister an existing listener
   *
   * @param listener {any}   Handle returned by previous call to addListener()
   */
  public removeListener(listener: any): void {
    if (!listener.dead) {
      const T: Topic = this.events[listener.topic];
      if (T) {
        const listeners: Listener[] = T.listeners;
        if (listeners && listeners.length) {
          for (let i = 0; i < listeners.length; i++) {
            if (listeners[i] && listeners[i].id === listener.id) {
              this._killListener(listeners, i);
              return;
            }
          }
        }
      }
    }
  }

  /**
   * off() is an alias for removeListener
   *
   * @param listener {any}   Handle returned by previous call to addListener()
   */
  public off(listener: any): void {
    this.removeListener(listener);
  }

  /* Called to kill a listener, and garbage collect */
  private _killListener(listeners: Listener[], i: number) {
    const listener = listeners[i];
    if (listener) {
      const T: Topic = this.events[listener.topic];
      listener.dead = Date.now();
      T.count --;
      if (T.count === 0) {
        this.events[listener.topic] = null;
      }
    }
    listeners[i] = null;
  }

  /**
   * emit() is called to pass the supplied data to the registered handlers for the topic
   *
   * @param topic {string}         Topic name
   * @param data {any}  The data being passed (depends on topic)
   */
  public emit(topic: string, ...params: any[]): void {
    const T: Topic = this.events[topic];
    if (T) {
      const listeners: Listener[] = T.listeners;
      if (listeners && listeners.length) {
        for (let i = 0; i < listeners.length; i++) {
          if (listeners[i]) {
            const listener: Listener = listeners[i];
            if (listener.once) {
              this._killListener(listeners, i);
            }
            listener.last = Date.now();
            listener.fired++;
            listener.callback(...params);
          }
        }
      }
    }
  }

  /**
   * fire() is an alias for emit()
   */
  public fire(topic: string, ...params: any[]): void {
    this.emit(topic, ...params);
  }

  /**
   * diagnostics() - dump data to console.log
   */
  public diagnostics = () : void => {
    for (const key in this.events) {
      if (this.events.hasOwnProperty(key)) {
        const T: Topic = this.events[key];
        if (T) {
          console.log('Topic ' + key + ' Listeners ' + T.count + ' Bucket ' + T.listeners.length)
          const listeners : Listener[] = T.listeners;
          listeners.forEach((listener: Listener, index: number) : void => {
            if (listener) {
              console.log(
                'Listener:'
                + ' topic ' + listener.topic
                + ' index ' + index
                + ' ID ' + listener.id
                + ' once ' + listener.once
                + ' callback ' + typeof(listener.callback)
                + ' fired ' + listener.fired
                + ' last ' + (new Date(listener.last)).toISOString(),
              );
            } else {
              console.log('Listener: topic ' + key + ' Index ' + index + ' is free (null)');
            }
          });
        }
      }
    }
  }

  /**
   * Garbage collect.
   * Cleans up internal data structure removing unused entries.
   */
  public gc(): void {
    const events: any = {};
    for (const key in this.events) {
      if (this.events.hasOwnProperty(key)) {
        const topic: Topic = this.events[key];
        if (topic) {
          events[key] = topic;
          if (topic.count < topic.listeners.length) {
            const listeners: Listener[] = [];
            topic.listeners.map((value: Listener) => {
              if (value) listeners.push(value);
            });
            topic.listeners = listeners;
          }
        }
      }
    }
    this.events = events;
  }
}

export default EventEmitter;
