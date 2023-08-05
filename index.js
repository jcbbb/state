let current
let effect = (fn) => {
  current = fn;
  fn();
  current = fn;
};

let reactive = (initial) => {
  let val = initial;
  let subscribers = new Set();

  let getter = (modfn = (val) => val) => {
    if (current && !subscribers.has(current)) subscribers.add(current);
    return modfn(val);
  };

  let setter = (new_val) => {
    if (typeof new_val === "function") val = new_val(val);
    else val = new_val;
    subscribers.forEach(f => f());
  };

  return [getter, setter];
};
