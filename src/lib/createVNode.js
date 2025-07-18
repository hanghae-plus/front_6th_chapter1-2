export function createVNode(type, props, ...children) {
  const normalizedProps = !props || (typeof props === "object" && Object.keys(props).length === 0) ? null : props;
  const flatChildren = children
    .flat(Infinity)
    .filter((child) => child !== null && child !== undefined && child !== false);
  return {
    type,
    props: normalizedProps,
    children: flatChildren,
  };
}
