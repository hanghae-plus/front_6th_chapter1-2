export function createVNode(type, props, ...children) {
  // props가 null 또는 undefined면 null로 통일
  props = props == null ? null : props;

  // children 평탄화 및 Falsy 값 제거
  const flatChildren = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false);

  return {
    type,
    props,
    children: flatChildren,
  };
}
