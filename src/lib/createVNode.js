export function createVNode(type, props, ...children) {
  console.log("여기");
  console.log(children);
  return {
    type,
    props,
    children: children.flat(Infinity),
  };
}
