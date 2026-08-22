function createWatchable(initialValue, watchFields = null) {
  const effects = new Set();
  const shouldTrigger = (path) => !watchFields || watchFields.includes(path);

  const handler = (currentPath = "") => ({
    get(target, prop, receiver) {
      if (!currentPath && prop === "on") {
        return (callback) => { effects.add(callback); return () => effects.delete(callback); };
      }

      const value = Reflect.get(target, prop, receiver);
      
      if (typeof value === "function" && Array.isArray(target)) {
        return (...args) => {
          const oldLength = target.length;
          const result = value.apply(target, args);
          if (shouldTrigger(currentPath) && (target.length !== oldLength || ["sort", "reverse"].includes(prop))) {
            effects.forEach(cb => setTimeout(() => cb(currentPath, value), 0));
          }
          return result;
        };
      }

      if (value !== null && typeof value === "object") {
        const nextPath = currentPath ? `${currentPath}.${String(prop)}` : String(prop);
        return new Proxy(value, handler(nextPath));
      }
      return value;
    },

    set(target, prop, value, receiver) {
      const oldValue = Reflect.get(target, prop, receiver);
      const nextPath = currentPath ? `${currentPath}.${String(prop)}` : String(prop);

      if (oldValue !== value) {
        const success = Reflect.set(target, prop, value, receiver);
        if (success && shouldTrigger(nextPath)) {
          effects.forEach(cb => cb(nextPath, value));
        }
        return success;
      }
      return Reflect.set(target, prop, value, receiver);
    }
  });

  const rootTarget = (initialValue === null || typeof initialValue !== "object") 
    ? { value: initialValue } 
    : initialValue;

  return new Proxy(rootTarget, handler(""));
}
