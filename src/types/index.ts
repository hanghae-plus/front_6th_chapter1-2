// VElement: Primitive가 아닌 VNode
export interface VElement {
  type: string | Function;
  props: VElementProps;
  children: any[];
}

export type VElementProps = Record<string, any> | null | undefined;

/**
 * (Prefix) Raw: JSX에서 전달되어 'normalize'되지 않은 값
 * - VNode: Element 또는 Primitive
 * - Primitive: Element가 아닌 값
 * - Child: 자녀 노드
 */

export type RawPrimitive = string | number | boolean | null | undefined;
export type RawVNode = VElement | RawPrimitive;
export type RawChild = VElement | string | number;

export type Primitive = string;
export type VNode = VElement | Primitive;
export type Child = VElement | string;
