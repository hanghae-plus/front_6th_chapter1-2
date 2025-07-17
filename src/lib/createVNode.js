export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: flattenChildren(children),
  };
}

function flattenChildren(children) {
  return children.flat(Infinity).filter((value) => value === 0 || Boolean(value));
}
