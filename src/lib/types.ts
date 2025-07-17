export const HtmlElementTypes = [
  "div",
  "span",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "img",
] as const;

export type HtmlElementType = (typeof HtmlElementTypes)[number];

export type ChildrenType = VNodeType;
export type NormalizeChildrenType = NormalizeVNodeType;

export type ElementType = ((props: PropsType) => VNodeType) | HtmlElementType;
export type PropsType = Record<string, any>;

export type CreateVNodeArgsType = [ElementType, PropsType, ...Array<ChildrenType>];

export type VNodeType =
  | {
      type: HtmlElementType | ((props: PropsType) => VNodeType);
      props: Record<string, any>; //TODO: 각 Type별로 props 타입 정의
      children?: Array<ChildrenType>;
    }
  | string
  | number
  | boolean
  | null
  | undefined;

export type NormalizeVNodeType =
  | {
      type: HtmlElementType | ((props: PropsType) => VNodeType);
      props: Record<string, any>; //TODO: 각 Type별로 props 타입 정의
      children?: Array<NormalizeChildrenType>;
    }
  | string;

export function isVNodeType(obj: any): obj is VNodeType {
  return obj && typeof obj === "object" && "type" in obj && "props" in obj && "children" in obj;
}
