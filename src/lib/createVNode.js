export function createVNode(type, props, ...children) {
  const flatChildren = children
    .flat(Infinity)
    .filter((child) => !(child === null || child === undefined || child === false || child === true));

  const normalizedProps = props ?? null;

  return {
    type,
    props: normalizedProps,
    children: flatChildren,
  };
}
