import { isBoolean, isFunction, isVNode, isNullish, isNumber } from "../utils/typeCheck";

export function normalizeVNode(vNode) {
  if (isNullish(vNode) || isBoolean(vNode)) {
    return "";
  }

  if (isNumber(vNode)) {
    return vNode.toString();
  }

  if (isVNode(vNode)) {
    return normalizeJSX(vNode);
  }

  return vNode;
}

function normalizeJSX(vNode) {
  const { type, props, children } = vNode;

  if (isFunction(type)) {
    // 함수형 컴포넌트인 경우 컴포넌트를 호출하고 결과를 정규화 한다.
    return normalizeVNode(
      type({
        ...(props ?? {}),
        children: normalizeChildren(children),
      }),
    );
  }

  return {
    type,
    props,
    children: normalizeChildren(children),
  };
}

function normalizeChildren(children) {
  const result = [];

  const normalize = (value) => {
    for (let i = 0; i < value.length; i++) {
      // 자식 노드를 순회하면서 정규화 한다.
      const normalized = normalizeVNode(value[i]);

      if (normalized) {
        // 정규화 결과가 빈 문자열이 아닌 경우 배열에 추가한다.
        result.push(normalized);
      }
    }
  };

  normalize(children);
  return result;
}
