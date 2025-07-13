export function createVNode(type, props, ...children) {
  // Helper to flatten deeply nested arrays
  function flatten(arr) {
    return arr.reduce((acc, val) => {
      if (Array.isArray(val)) {
        acc.push(...flatten(val));
      } else {
        acc.push(val);
      }
      return acc;
    }, []);
  }

  // Remove null, undefined, boolean (except 0/number)
  function filterValid(child) {
    return !(child === null || child === undefined || typeof child === "boolean");
  }

  // Flatten and filter children
  const flatChildren = flatten(children).filter(filterValid);

  return {
    type,
    props,
    children: flatChildren,
  };
}
