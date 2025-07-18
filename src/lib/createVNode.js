export function createVNode(type, props, ...children) {
  // children은 배열이므로 flat을 통해 하나의 배열로 만들어준다. (평탄화 작업)
  // filter를 통해 null, undefined, false를 제거한다.
  return {
    type,
    props,
    children: children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false),
  };
}
