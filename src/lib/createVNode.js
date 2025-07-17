export function createVNode(type, props, ...children) {
  return {
    type: type,
    props: props,
    children: children.flat(Infinity).filter((elem) => elem !== false && elem !== null && elem !== undefined),
  };
}
