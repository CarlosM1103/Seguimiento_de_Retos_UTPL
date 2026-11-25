// Angular uses Object.hasOwn, which the Android 11 emulator's WebView lacks.
if (!Object.hasOwn) {
  Object.defineProperty(Object, 'hasOwn', {
    configurable: true,
    writable: true,
    value(object: object, key: PropertyKey): boolean {
      return Object.prototype.hasOwnProperty.call(object, key);
    },
  });
}
