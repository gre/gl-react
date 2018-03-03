//@flow

declare module "lru" {
  declare class EventEmitter {
    addListener(event: string, listener: Function): EventEmitter;
    on(event: string, listener: Function): EventEmitter;
    once(event: string, listener: Function): EventEmitter;
    removeListener(event: string, listener: Function): EventEmitter;
    removeAllListeners(event?: string): EventEmitter;
    setMaxListeners(n: number): void;
    listeners(event: string): Function[];
    emit(event: string, ...args: any[]): boolean;
  }
  declare type Opts = number | { max?: number, maxAge?: number };
  declare class LRU<Key: string | number, Value> extends EventEmitter {
    constructor: (opts?: Opts) => void;
    keys: Array<Key>;
    clear: () => void;
    remove: (key: Key) => ?Value;
    peek: (key: Key) => ?Value;
    set: (key: Key, value: Value) => Value;
    get: (key: Key) => ?Value;
    evict: (key: Key) => void;
  }
  declare module.exports: <K, V>(opts?: Opts) => LRU<K, V>;
}
