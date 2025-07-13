/**
 * 가상 돔 노드 생성
 * @param {*} type
 * @param {*} props
 * @param  {...any} children
 * @returns {Object} {type, props, children}
 */
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children
      .flat(Infinity)
      .filter(
        (child) =>
          child !== null &&
          child !== undefined &&
          child !== false &&
          child !== true,
      ),
  };
}
