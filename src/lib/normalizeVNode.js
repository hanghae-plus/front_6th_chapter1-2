export function normalizeVNode(vNode) {
  if (isNullish(vNode) || isBoolean(vNode)) {
    return "";
  }

  if (isNumber(vNode)) {
    return vNode.toString();
  }

  if (isJSX(vNode)) {
    return normalizeJSX(vNode);
  }

  return vNode;
}

function isNullish(value) {
  return value == null;
}

function isBoolean(value) {
  return typeof value === "boolean";
}

function isNumber(value) {
  return typeof value === "number";
}

function isString(value) {
  return typeof value === "string";
}

function isFunction(value) {
  return typeof value === "function";
}

function isJSX(value) {
  if (typeof value !== "object" || value === null) {
    // 객체 형태가 아니면 JSX 가 아니다.
    return false;
  }

  if (!("type" in value) || !("props" in value) || !("children" in value)) {
    // 객체 형태이지만 필수 프로퍼티가 없으면 JSX 가 아니다.
    return false;
  }

  if (!(isString(value.type) || isFunction(value.type))) {
    // type 값이 문자열 또는 함수가 아니면 JSX 가 아니다.
    // 현재는 함수형 컴포넌트만 고려
    return false;
  }

  if (typeof value.props !== "object") {
    // props 값이 객체가 아니면 JSX 가 아니다.
    return false;
  }

  if (!Array.isArray(value.children)) {
    // children 값이 배열이 아니면 JSX 가 아니다.
    return false;
  }

  return true;
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
