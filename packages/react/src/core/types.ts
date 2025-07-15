export interface VNodeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  className?: string;
  style?: { [key: string]: string };
  children?: VNodeChild;
}

export type VNodeTagName = keyof HTMLElementTagNameMap;
export type VNodeType = VNodeTagName | ((props: VNodeProps) => VNodeChild);

export interface VNode {
  type: VNodeType;
  props: VNodeProps | null;
  children: VNodeChild[];
}

export type VNodeChild = string | number | boolean | null | undefined | VNode | VNodeChild[];

export type EventHandler = (event: Event) => void;
