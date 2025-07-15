console.log(createVNode("div", { id: "test" }, "Hello"));

export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: [...children].flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false),
  };
}
