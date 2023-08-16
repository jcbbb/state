const SIGNAL = Symbol("SIGNAL");

let current = null;

function is_equal(a, b) {
  return (a === null || typeof a !== "object") && Object.is(a, b);
}

// Source: https://github.com/angular/angular/blob/6145cc1c0a54eaaf58539585130cd8dffa6ef892/packages/core/src/signals/src/signal.ts
class SignalNode {
  constructor(value) {
    this.subscribers = new Set();
    this.value = value;
  }

  set(new_val) {
    if (!is_equal(this.value, new_val)) {
      this.value = new_val;
      this.subscribers.forEach(fn => fn());
    }
  }

  update(update_fn) {
    this.set(update_fn(this.value));
  }

  mutate(mutate_fn) {
    mutate_fn(this.value);
    this.subscribers.forEach(fn => fn());
  }

  signal() {
    if (current && !this.subscribers.has(current)) this.subscribers.add(current);
    return this.value;
  }
}

function create_signal_fn(node) {
  let signal_fn = node.signal.bind(node);
  signal_fn[SIGNAL] = node;

  return Object.assign(signal_fn, {
    set: node.set.bind(node),
    update: node.update.bind(node),
    mutate: node.mutate.bind(node),
    value: node.value
  });
}

export function effect(fn) {
  current = fn;
  fn();
  current = null;
};

export function signal(initial) {
  let node = new SignalNode(initial);
  return create_signal_fn(node);
}

export function is_signal(value) {
  return typeof value === "function" && value[SIGNAL] !== undefined;
}
