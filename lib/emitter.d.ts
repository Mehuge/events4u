declare class EventEmitter {
    private events;
    constructor();
    /**
     * addListener() is called to register a listener for a topic.
     *
     * @param topic {string}         Topic name
     * @param once {boolean}         Fire event only once (auto-unregister) [optional]
     * @param callback {function}    Handler to call when topic is fired
     */
    addListener(topic: string, once: boolean, callback: (...params: any[]) => void): any;
    /**
     * on() is called to register a listener for a topic.
     *
     * @param topic {string}         Topic name
     * @param callback {function}    Handler to call when topic is fired
     */
    on(topic: string, callback: (...params: any[]) => void): any;
    /**
     * once() is called to register a listener for a topic that will
     * fire only once before being auto-removed.
     *
     * @param topic {string}         Topic name
     * @param callback {function}    Handler to call when topic is fired
     */
    once(topic: string, callback: (...params: any[]) => void): any;
    /**
     * listenOnce() is an alias for once()
     */
    listenOnce(topic: string, callback: (...params: any[]) => void): any;
    /**
     * removeListener() is called to deregister an existing listener
     *
     * @param listener {any}   Handle returned by previous call to addListener()
     */
    removeListener(listener: any): void;
    /**
     * off() is an alias for removeListener
     *
     * @param listener {any}   Handle returned by previous call to addListener()
     */
    off(listener: any): void;
    private _killListener(listeners, i);
    /**
     * emit() is called to pass the supplied data to the registered handlers for the topic
     *
     * @param topic {string}         Topic name
     * @param data {any}  The data being passed (depends on topic)
     */
    emit(topic: string, ...params: any[]): void;
    /**
     * fire() is an alias for emit()
     */
    fire(topic: string, ...params: any[]): void;
    /**
     * diagnostics() - dump data to console.log
     */
    diagnostics: () => void;
    /**
     * Garbage collect.
     * Cleans up internal data structure removing unused entries.
     */
    gc(): void;
}
export default EventEmitter;
