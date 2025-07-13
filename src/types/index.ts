export interface VNode {
  type: string | Function;
  props: Record<string, any> | null;
  children: any[];
}

// JSX에서 전달되는 child의 유형
export type Child = VNode | string | number;

// Primitive 값: 렌더링 가능한 기본 타입 또는 무시할 falsy 값
export type Primitive = string | number | boolean | null | undefined;

// normalizeVNode가 반환할 수 있는 타입
export type NormalizedVNode = VNode | string;
