export function createVNode(type, props, ...children) {
  const flatChildren = children.flat(Infinity).filter((child) => {
    if (child === null) return false;
    if (child === undefined) return false;
    if (child === false) return false;

    return true;
  });

  return {
    type,
    props: props ?? null, // nullish한 값이 들어오는 경우 null 처리
    children: flatChildren,
  };
}
