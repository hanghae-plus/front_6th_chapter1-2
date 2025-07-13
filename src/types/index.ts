export interface VNode {
  type: string | Function;
  props: Record<string, any> | null;
  children: any[];
}

// JSX에서 전달되는 child의 유형
export type Child = VNode | string | number;
