/**
 * 가상 DOM 생성
 * 실제 DOM으로 렌더링 할 때 필요한 모든 정보를 담고 있어야 함
 * */
export function createVNode(type, props, ...children) {
  const falsey = [null, undefined, "", false];
  return { type, props, children: children.flat(Infinity).filter((child) => !falsey.includes(child)) };
}
