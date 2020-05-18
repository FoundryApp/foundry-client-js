interface ProxyTarget extends Object {
  [key: string]: any;
}
export class Proxied<T extends ProxyTarget> {
  /**
   * Gets a property from the original object.
   *
   * @param target
   * @param key
   */
  static getOriginal(target: any, key: string): any {
    const value = target[key];
    if (!Proxied.isExists(value)) {
      return undefined;
    } else if (Proxied.isConstructor(value) || typeof value !== 'function') {
      return value;
    } else {
      return value.bind(target);
    }
  }
  /**
   * Run the original target.
   *
   * @param target
   * @param thisArg
   * @param argArray
   */
  static applyOriginal(target: any, thisArg: any, argArray: any[]): any {
    return target.apply(thisArg, argArray);
  }
  private static isConstructor(obj: any): boolean {
    // Handle if obj is undefined or null
    if (!!obj) {
      return false;
    }

    return !!obj.prototype && !!obj.prototype.constructor.name;
  }
  private static isExists(obj: any): boolean {
    return obj !== undefined;
  }
  proxy: T;
  private anyValue?: (target: T, key: string) => any;
  private appliedValue?: () => any;
  private rewrites: {
    [key: string]: (target: T, key: string) => any;
  } = {};
  /**
   * When initialized an original object is passed. This object is supplied to both .when()
and .any() functions so the original value of the object is accessible. When no
.any() is provided, the original value of the object is returned when the field
key does not match any known rewrite.
   *
   * @param original
   */
  constructor(private original: T) {
    this.proxy = new Proxy(this.original, {
      get: (target, key) => {
        key = key.toString();

        if (this.rewrites[key]) {
          return this.rewrites[key](target, key);
        }
        if (Proxied.getOriginal(target, key) && this.anyValue) {
          return this.anyValue(target, key);
        }
        if (this.anyValue) {
          return this.anyValue(target, key);
        }
        return Proxied.getOriginal(target, key);
      },
      apply: (target, thisArg, argArray) => {
        if (this.appliedValue) {
          return this.appliedValue.apply(thisArg, argArray);
        } else {
          return Proxied.applyOriginal(target, thisArg, argArray);
        }
      },
    });
  }
  /**
   * Calling .when("a", () => "b") will rewrite obj["a"] to be equal to "b"
   *
   * @param key
   * @param value
   */
  when(key: string, value: (target: T, key: string) => any): Proxied<T> {
    this.rewrites[key] = value;
    return this as Proxied<T>;
  }
  /**
   * Calling .any(() => "b") will rewrite all fields on obj to be equal to "b"
   *
   * @param value
   */
  any(value: (target: T, key: string) => any): Proxied<T> {
    this.anyValue = value;
    return this as Proxied<T>;
  }
  /**
   * Calling .applied(() => "b") will make obj() equal to "b"
   *
   * @param value
   */
  applied(value: () => any): Proxied<T> {
    this.appliedValue = value;
    return this as Proxied<T>;
  }
  /**
   * Return the final proxied object.
   */
  finalize(): T {
    return this.proxy;
  }
}