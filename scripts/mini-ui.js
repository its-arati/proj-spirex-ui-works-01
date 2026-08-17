function createWatchable(initialValue, watchFields = null) {
  const effects = new Set();
  const shouldTrigger = (path) => !watchFields || watchFields.includes(path);

  const handler = (currentPath = "") => ({
    get(target, prop, receiver) {
      // Expose the registration hook on the root proxy
      if (!currentPath && prop === "on") {
        return (callback) => { effects.add(callback); return () => effects.delete(callback); };
      }

      const value = Reflect.get(target, prop, receiver);
      
      // Intercept mutating array methods
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

      // Lazy deep proxying
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
          effects.forEach(cb => setTimeout(() => cb(currentPath, value), 0));
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

class WatchableComponent extends HTMLElement {
  constructor() {
    super();
    // this.attachShadow({ mode: "closed"});
    this._renderFn = null;
    this._state = null;
    this._unhook = null;
    this._renderPending = false;
  }

  // Registers the state and the HTML template literal renderer
  initComponent(watchableState, renderTemplateFn) {
    this._state = watchableState;
    this._renderFn = renderTemplateFn;

    // Hook into the proxy's side-effect system
    if (this._state && typeof this._state.on === "function") {
      this._unhook = this._state.on(() => this.requestUpdate());
    }

    this.requestUpdate(); // Initial render
  }

  // Batches updates using setTimeout to run on the next event loop tick
  requestUpdate() {
    if (this._renderPending) return;
    this._renderPending = true;

    setTimeout(() => {
      this._renderPending = false;
      this.render();
    }, 0);
  }

  // Executes the render function and safely mutates the shadow DOM
  render() {
    if (!this._renderFn || !this._state) return;
    // Pass the state directly to the user's template function
    this.innerHTML = this._renderFn(this._state);
  }

  // Cleanup memory hooks if the element is removed from the DOM
  disconnectedCallback() {
    if (this._unhook) {
      this._unhook();
    }
  }
}
class FakeDatastore extends EventTarget {
  constructor(storageKey, jsonFilename) {
    super();
    this.storageKey = storageKey;
    this.jsonFilename = jsonFilename;
    this.data = null;
  }

  _emitMutation(type, path, value) {
        this.dispatchEvent(
            new CustomEvent("mutation", {
                detail: {
                    type,
                    path,
                    value,
                    data: this.data
                }
            })
        );
    }

  // Resolves local cache, falls back to static JSON engine, filters by URI Query, returns final data state
  async defaultValue() {
    const cached = localStorage.getItem(this.storageKey);
    
    if (cached) {
      this.data = JSON.parse(cached);
    } else {
      const response = await fetch(this.jsonFilename);
      this.data = await response.json();
      this._save();
    }

    // Capture search parameters natively out of the URL context
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length === 0) return this.data;

    // Apply strict key filtering over target collections
    if (Array.isArray(this.data)) {
      return this.data.filter(item => 
        [...params.entries()].every(([key, val]) => String(item[key]) === val)
      );
    }
    return this.data;
  }

  // Traverses nested objects along a string path to resolve properties safely
  get(path) {
    if (!path) return this.data;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, this.data);
  }

  // Upserts nested entities or pushes entries into nested structural arrays
  create(path, payload) {
    if (!path) {
      this.data = Array.isArray(this.data) ? [...this.data, payload] : payload;
    } else {
      const parts = path.split('.');
      const lastKey = parts.pop();
      const parent = parts.reduce((acc, part) => acc[part] = acc[part] || {}, this.data);

      if (Array.isArray(parent[lastKey])) {
        parent[lastKey].push(payload);
      } else {
        parent[lastKey] = payload;
      }
    }
    this._save();
    this._emitMutation("create", path, payload);
    return this.get(path);
  }

  // Updates properties or deeply merges targeted structural delta changes (patches)
  update(path, payload) {
    if (!path) {
      this.data = this._isObject(this.data) && this._isObject(payload) ? { ...this.data, ...payload } : payload;
    } else {
      const parts = path.split('.');
      const lastKey = parts.pop();
      const parent = parts.reduce((acc, part) => acc[part] = acc[part] || {}, this.data);

      if (this._isObject(parent[lastKey]) && this._isObject(payload)) {
        parent[lastKey] = { ...parent[lastKey], ...payload };
      } else {
        parent[lastKey] = payload;
      }
    }
    this._save();
    this._emitMutation("update", path, payload);
    return this.get(path);
  }

  // Deletes properties from objects or slices elements out of target arrays
  delete(path, indexOrKey = null) {
    if (!path) {
      if (indexOrKey !== null && Array.isArray(this.data)) this.data.splice(indexOrKey, 1);
      else this.data = null;
    } else {
      const parts = path.split('.');
      const lastKey = parts.pop();
      const parent = parts.reduce((acc, part) => acc[part] || {}, this.data);
      const target = parent[lastKey];

      if (indexOrKey !== null && Array.isArray(target)) {
        target.splice(indexOrKey, 1);
      } else if (this._isObject(parent)) {
        delete parent[lastKey];
      }
    }
    this._save();
    this._emitMutation("delete", path, indexOrKey);
    return this.data;
  }

  _save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  _isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}
