(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var internalId = 0;

var Listener = function Listener(topic, once, callback) {
    _classCallCheck(this, Listener);

    this.fired = 0;
    this.last = 0;
    this.dead = 0;
    this.topic = topic;
    this.once = once;
    this.callback = callback;
    this.id = ++internalId;
};

var EventEmitter = function () {
    function EventEmitter() {
        var _this = this;

        _classCallCheck(this, EventEmitter);

        /**
         * diagnostics() - dump data to console.log
         */
        this.diagnostics = function () {
            var _loop = function _loop(key) {
                if (_this.events.hasOwnProperty(key)) {
                    var T = _this.events[key];
                    if (T) {
                        console.log('Topic ' + key + ' Listeners ' + T.count + ' Bucket ' + T.listeners.length);
                        var listeners = T.listeners;
                        listeners.forEach(function (listener, index) {
                            if (listener) {
                                console.log('Listener:' + ' topic ' + listener.topic + ' index ' + index + ' ID ' + listener.id + ' once ' + listener.once + ' callback ' + _typeof(listener.callback) + ' fired ' + listener.fired + ' last ' + new Date(listener.last).toISOString());
                            } else {
                                console.log('Listener: topic ' + key + ' Index ' + index + ' is free (null)');
                            }
                        });
                    }
                }
            };

            for (var key in _this.events) {
                _loop(key);
            }
        };
        this.events = {};
    }
    /**
     * addListener() is called to register a listener for a topic.
     *
     * @param topic {string}         Topic name
     * @param once {boolean}         Fire event only once (auto-unregister) [optional]
     * @param callback {function}    Handler to call when topic is fired
     */


    _createClass(EventEmitter, [{
        key: "addListener",
        value: function addListener(topic) {
            var once = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var callback = arguments[2];

            var T = this.events[topic] = this.events[topic] || { count: 0, listeners: [] };
            var listeners = T.listeners;
            var listener = new Listener(topic, once, callback);
            var i = listeners.indexOf(null);
            if (i === -1) {
                listeners.push(listener);
            } else {
                listeners[i] = listener;
            }
            T.count++;
            return listener;
        }
        /**
         * on() is called to register a listener for a topic.
         *
         * @param topic {string}         Topic name
         * @param callback {function}    Handler to call when topic is fired
         */

    }, {
        key: "on",
        value: function on(topic, callback) {
            return this.addListener(topic, false, callback);
        }
        /**
         * once() is called to register a listener for a topic that will
         * fire only once before being auto-removed.
         *
         * @param topic {string}         Topic name
         * @param callback {function}    Handler to call when topic is fired
         */

    }, {
        key: "once",
        value: function once(topic, callback) {
            return this.addListener(topic, true, callback);
        }
        /**
         * listenOnce() is an alias for once()
         */

    }, {
        key: "listenOnce",
        value: function listenOnce(topic, callback) {
            return this.addListener(topic, true, callback);
        }
        /**
         * removeListener() is called to deregister an existing listener
         *
         * @param listener {any}   Handle returned by previous call to addListener()
         */

    }, {
        key: "removeListener",
        value: function removeListener(listener) {
            if (!listener.dead) {
                var T = this.events[listener.topic];
                if (T) {
                    var listeners = T.listeners;
                    if (listeners && listeners.length) {
                        for (var i = 0; i < listeners.length; i++) {
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

    }, {
        key: "off",
        value: function off(listener) {
            this.removeListener(listener);
        }
        /* Called to kill a listener, and garbage collect */

    }, {
        key: "_killListener",
        value: function _killListener(listeners, i) {
            var listener = listeners[i];
            if (listener) {
                var T = this.events[listener.topic];
                listener.dead = Date.now();
                T.count--;
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

    }, {
        key: "emit",
        value: function emit(topic) {
            var T = this.events[topic];
            if (T) {
                var listeners = T.listeners;
                if (listeners && listeners.length) {
                    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        params[_key - 1] = arguments[_key];
                    }

                    for (var i = 0; i < listeners.length; i++) {
                        if (listeners[i]) {
                            var listener = listeners[i];
                            if (listener.once) {
                                this._killListener(listeners, i);
                            }
                            listener.last = Date.now();
                            listener.fired++;
                            listener.callback.apply(listener, params);
                        }
                    }
                }
            }
        }
        /**
         * fire() is an alias for emit()
         */

    }, {
        key: "fire",
        value: function fire(topic) {
            for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                params[_key2 - 1] = arguments[_key2];
            }

            this.emit.apply(this, [topic].concat(params));
        }
        /**
         * Garbage collect.
         * Cleans up internal data structure removing unused entries.
         */

    }, {
        key: "gc",
        value: function gc() {
            var events = {};
            for (var key in this.events) {
                if (this.events.hasOwnProperty(key)) {
                    var topic = this.events[key];
                    if (topic) {
                        events[key] = topic;
                        if (topic.count < topic.listeners.length) {
                            (function () {
                                var listeners = [];
                                topic.listeners.map(function (value) {
                                    if (value) listeners.push(value);
                                });
                                topic.listeners = listeners;
                            })();
                        }
                    }
                }
            }
            this.events = events;
        }
    }]);

    return EventEmitter;
}();

exports.default = EventEmitter;
},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var emitter_1 = require("./emitter");
exports.EventEmitter = emitter_1.default;
var events = new emitter_1.default();
exports.default = events;
},{"./emitter":1}]},{},[2]);
