/** @jsx createVNode */
/** @jsxFrag Fragment */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createVNode, renderElement } from "../lib";

describe("Chapter1-2 > 심화과제 > Virtual DOM과 이벤트 관리", () => {
  let container;

  beforeEach(async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("renderElement > ", () => {
    it("초기 렌더링이 올바르게 수행되어야 한다", () => {
      const vNode = <div id="test">Hello</div>;
      renderElement(vNode, container);
      expect(container.innerHTML).toBe('<div id="test">Hello</div>');
    });

    it("diff 알고리즘을 통해 변경된 부분만 업데이트해야 한다", () => {
      const initialVNode = (
        <div>
          <h1>Title</h1>
          <p>Paragraph 1</p>
        </div>
      );
      renderElement(initialVNode, container);

      const originalH1 = container.querySelector("h1");
      const originalP = container.querySelector("p");

      const updatedVNode = (
        <div>
          <h1>Updated Title</h1>
          <p>Paragraph 1</p>
        </div>
      );
      renderElement(updatedVNode, container);

      expect(container.innerHTML).toBe("<div><h1>Updated Title</h1><p>Paragraph 1</p></div>");
      expect(container.querySelector("h1")).toBe(originalH1); // 같은 요소 참조 확인
      expect(container.querySelector("p")).toBe(originalP); // 같은 요소 참조 확인
      expect(container.querySelector("h1").textContent).toBe("Updated Title");
      expect(container.querySelector("p").textContent).toBe("Paragraph 1");
    });

    it("새로운 요소를 추가하고 불필요한 요소를 제거해야 한다", () => {
      const initialVNode = (
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      );
      renderElement(initialVNode, container);

      const originalFirstLi = container.querySelector("li:first-child");

      const updatedVNode = (
        <ul>
          <li>Item 1</li>
          <li>New Item</li>
          <li>Item 3</li>
        </ul>
      );
      renderElement(updatedVNode, container);

      expect(container.querySelectorAll("li").length).toBe(3);
      expect(container.querySelector("li:nth-child(2)").textContent).toBe("New Item");
      expect(container.querySelector("li:first-child")).toBe(originalFirstLi); // 같은 요소 참조 확인
    });

    it("요소의 속성만 변경되었을 때 요소를 재사용해야 한다", () => {
      const initialVNode = (
        <div id="test" className="old">
          Hello
        </div>
      );
      renderElement(initialVNode, container);

      const originalDiv = container.querySelector("div");

      const updatedVNode = (
        <div id="test" className="new">
          Hello
        </div>
      );
      renderElement(updatedVNode, container);

      expect(container.innerHTML).toBe('<div id="test" class="new">Hello</div>');
      expect(container.querySelector("div")).toBe(originalDiv); // 같은 요소 참조 확인
    });

    it("요소의 타입이 변경되었을 때 새로운 요소를 생성해야 한다", () => {
      const initialVNode = <div>Hello</div>;
      renderElement(initialVNode, container);

      const originalElement = container.firstChild;

      const updatedVNode = <span>Hello</span>;
      renderElement(updatedVNode, container);

      expect(container.innerHTML).toBe("<span>Hello</span>");
      expect(container.firstChild).not.toBe(originalElement); // 다른 요소 참조 확인
    });

    it("함수형 컴포넌트가 업데이트될 때 필요한 부분만 렌더링해야 한다", () => {
      const FuncComponent = ({ title, content }) => (
        <div>
          <h1>{title}</h1>
          <p>{content}</p>
        </div>
      );

      const initialVNode = <FuncComponent title="Initial Title" content="Initial Content" />;
      renderElement(initialVNode, container);

      const originalH1 = container.querySelector("h1");
      const originalP = container.querySelector("p");

      const updatedVNode = <FuncComponent title="Updated Title" content="Initial Content" />;
      renderElement(updatedVNode, container);

      expect(container.querySelector("h1")).toBe(originalH1);
      expect(container.querySelector("p")).toBe(originalP);
      expect(container.querySelector("h1").textContent).toBe("Updated Title");
      expect(container.querySelector("p").textContent).toBe("Initial Content");
    });

    it("중첩된 함수형 컴포넌트에서 깊은 레벨의 변경사항만 업데이트해야 한다", () => {
      const ChildComponent = ({ text }) => <p>{text}</p>;
      const ParentComponent = ({ title, childText }) => (
        <div>
          <h1>{title}</h1>
          <ChildComponent text={childText} />
        </div>
      );

      const initialVNode = <ParentComponent title="Parent Title" childText="Child Text" />;

      renderElement(initialVNode, container);

      const originalH1 = container.querySelector("h1");
      const originalP = container.querySelector("p");

      const updatedVNode = <ParentComponent title="Parent Title" childText="Updated Child Text" />;
      renderElement(updatedVNode, container);

      expect(container.querySelector("h1")).toBe(originalH1);
      expect(container.querySelector("p")).toBe(originalP);
      expect(container.querySelector("h1").textContent).toBe("Parent Title");
      expect(container.querySelector("p").textContent).toBe("Updated Child Text");
    });

    describe("특수한 속성 처리 > ", () => {
      it("className이 props에서 제거될 때 class 속성이 올바르게 제거되어야 한다", () => {
        // className이 있는 초기 요소
        const initialVNode = (
          <div className="initial-class another-class" id="test-element">
            Content
          </div>
        );

        renderElement(initialVNode, container);

        const element = container.querySelector("#test-element");
        expect(element.className).toBe("initial-class another-class");
        expect(element.hasAttribute("class")).toBe(true);
        expect(container.outerHTML).toBe(
          `<div><div class="initial-class another-class" id="test-element">Content</div></div>`,
        );

        // className을 제거한 업데이트된 요소
        const updatedVNode = <div id="test-element">Content</div>;

        renderElement(updatedVNode, container);

        const updatedElement = container.querySelector("#test-element");
        expect(updatedElement).toBe(element); // 같은 요소 재사용 확인
        expect(updatedElement.className).toBe("");
        expect(updatedElement.hasAttribute("class")).toBe(false);
        expect(updatedElement.textContent).toBe("Content");
        expect(container.outerHTML).toBe(`<div><div id="test-element">Content</div></div>`);
      });

      it("boolean type props가 property로 직접 업데이트되어야 한다 (checked)", () => {
        // checked가 false인 초기 체크박스
        const initialVNode = <input type="checkbox" id="test-checkbox" checked={false} />;

        renderElement(initialVNode, container);

        const checkbox = container.querySelector("#test-checkbox");
        expect(checkbox.checked).toBe(false);
        expect(checkbox.hasAttribute("checked")).toBe(false);

        // checked를 true로 업데이트
        const updatedVNode = <input type="checkbox" id="test-checkbox" checked={true} />;

        renderElement(updatedVNode, container);

        expect(container.querySelector("#test-checkbox")).toBe(checkbox); // 같은 요소 재사용
        expect(checkbox.checked).toBe(true); // property로 직접 업데이트
        expect(checkbox.getAttribute("checked")).toBe(null); // DOM에는 없어야 함
        expect(container.outerHTML).toBe(`<div><input type="checkbox" id="test-checkbox"></div>`);

        // 다시 false로 업데이트
        const uncheckedVNode = <input type="checkbox" id="test-checkbox" checked={false} />;

        renderElement(uncheckedVNode, container);

        expect(checkbox.checked).toBe(false);
        expect(checkbox.getAttribute("checked")).toBe(null); // DOM에는 없어야 함
        expect(container.outerHTML).toBe(`<div><input type="checkbox" id="test-checkbox"></div>`);
      });

      it("boolean type props가 property로 직접 업데이트되어야 한다 (disabled)", () => {
        // disabled가 false인 초기 버튼
        const initialVNode = (
          <button id="test-button" disabled={false}>
            Click me
          </button>
        );

        renderElement(initialVNode, container);

        const button = container.querySelector("#test-button");
        expect(button.disabled).toBe(false);
        expect(button.hasAttribute("disabled")).toBe(false);

        // disabled를 true로 업데이트
        const disabledVNode = (
          <button id="test-button" disabled={true}>
            Click me
          </button>
        );

        renderElement(disabledVNode, container);

        expect(container.querySelector("#test-button")).toBe(button); // 같은 요소 재사용
        expect(button.disabled).toBe(true); // property로 직접 업데이트
        expect(button.getAttribute("disabled")).toBe(""); // DOM에도 반영
        expect(container.outerHTML).toBe(`<div><button id="test-button" disabled="">Click me</button></div>`);

        // 다시 false로 업데이트
        const enabledVNode = (
          <button id="test-button" disabled={false}>
            Click me
          </button>
        );

        renderElement(enabledVNode, container);

        expect(button.disabled).toBe(false);
        expect(button.getAttribute("disabled")).toBe(null); // DOM에도 반영
        expect(container.outerHTML).toBe(`<div><button id="test-button">Click me</button></div>`);
      });

      it("boolean type props가 property로 직접 업데이트되어야 한다 (selected)", () => {
        // selected가 false인 초기 옵션들
        const initialVNode = (
          <select id="test-select">
            <option value="1" selected={false}>
              Option 1
            </option>
            <option value="2" selected={false}>
              Option 2
            </option>
            <option value="3" selected={false}>
              Option 3
            </option>
          </select>
        );

        renderElement(initialVNode, container);

        const select = container.querySelector("#test-select");
        const option1 = select.querySelector('option[value="1"]');
        const option2 = select.querySelector('option[value="2"]');
        const option3 = select.querySelector('option[value="3"]');

        expect(option1.selected).toBe(true);
        expect(option2.selected).toBe(false);
        expect(option3.selected).toBe(false);
        expect(option1.getAttribute("selected")).toBe(null);
        expect(option2.getAttribute("selected")).toBe(null);
        expect(option3.getAttribute("selected")).toBe(null);

        // 두 번째 옵션을 selected로 업데이트
        const updatedVNode = (
          <select id="test-select">
            <option value="1" selected={false}>
              Option 1
            </option>
            <option value="2" selected={true}>
              Option 2
            </option>
            <option value="3" selected={false}>
              Option 3
            </option>
          </select>
        );

        renderElement(updatedVNode, container);

        expect(container.querySelector("#test-select")).toBe(select); // 같은 요소 재사용
        expect(option1.selected).toBe(false);
        expect(option2.selected).toBe(true); // property로 직접 업데이트
        expect(option3.selected).toBe(false);
        expect(option1.getAttribute("selected")).toBe(null);
        expect(option2.getAttribute("selected")).toBe(null);
        expect(option3.getAttribute("selected")).toBe(null);

        // 세 번째 옵션으로 변경
        const thirdSelectedVNode = (
          <select id="test-select">
            <option value="1" selected={false}>
              Option 1
            </option>
            <option value="2" selected={false}>
              Option 2
            </option>
            <option value="3" selected={true}>
              Option 3
            </option>
          </select>
        );

        renderElement(thirdSelectedVNode, container);

        expect(option1.selected).toBe(false);
        expect(option2.selected).toBe(false);
        expect(option3.selected).toBe(true);
        expect(option1.getAttribute("selected")).toBe(null);
        expect(option2.getAttribute("selected")).toBe(null);
        expect(option3.getAttribute("selected")).toBe(null);
      });

      it("여러 boolean props가 동시에 올바르게 처리되어야 한다", () => {
        // 여러 boolean props가 있는 input
        const initialVNode = (
          <input type="checkbox" id="multi-props-input" checked={false} disabled={false} readOnly={false} />
        );

        renderElement(initialVNode, container);

        const input = container.querySelector("#multi-props-input");
        expect(input.checked).toBe(false);
        expect(input.disabled).toBe(false);
        expect(input.readOnly).toBe(false);
        expect(container.outerHTML).toBe('<div><input type="checkbox" id="multi-props-input"></div>');

        // 모든 boolean props를 true로 업데이트
        const allTrueVNode = (
          <input type="checkbox" id="multi-props-input" checked={true} disabled={true} readOnly={true} />
        );

        renderElement(allTrueVNode, container);

        expect(container.querySelector("#multi-props-input")).toBe(input); // 같은 요소 재사용
        expect(input.checked).toBe(true);
        expect(input.disabled).toBe(true);
        expect(input.readOnly).toBe(true);
        expect(container.outerHTML).toBe(
          '<div><input type="checkbox" id="multi-props-input" disabled="" readonly=""></div>',
        );

        // 일부만 false로 업데이트
        const partialFalseVNode = (
          <input type="checkbox" id="multi-props-input" checked={true} disabled={false} readOnly={true} />
        );

        renderElement(partialFalseVNode, container);

        expect(input.checked).toBe(true);
        expect(input.disabled).toBe(false);
        expect(input.readOnly).toBe(true);
        expect(container.outerHTML).toBe('<div><input type="checkbox" id="multi-props-input" readonly=""></div>');
      });
    });

    describe("updateElement 엣지케이스 > ", () => {
      it("oldChildren이 newChildren보다 많을 때 초과하는 자식들이 제거되어야 한다", () => {
        // 초기 상태: 5개의 자식
        const initialVNode = (
          <div>
            <span>First</span>
            <span>Second</span>
            <span>Third</span>
            <span>Fourth</span>
            <span>Fifth</span>
          </div>
        );

        renderElement(initialVNode, container);
        expect(container.firstChild.children.length).toBe(5);

        // 새 상태: 2개의 자식
        const updatedVNode = (
          <div>
            <span>First Updated</span>
            <span>Second Updated</span>
          </div>
        );

        renderElement(updatedVNode, container);

        // 결과 검증: 3개의 자식이 제거되어야 함
        expect(container.firstChild.children.length).toBe(2);
        expect(container.firstChild.children[0].textContent).toBe("First Updated");
        expect(container.firstChild.children[1].textContent).toBe("Second Updated");
      });

      it("빈 배열로 모든 자식이 제거되는 경우", () => {
        const initialVNode = (
          <div>
            <span>Item 1</span>
            <span>Item 2</span>
            <span>Item 3</span>
          </div>
        );

        renderElement(initialVNode, container);
        expect(container.firstChild.children.length).toBe(3);

        const emptyVNode = <div></div>;

        renderElement(emptyVNode, container);

        // 결과 검증: 모든 자식이 제거되어야 함
        expect(container.firstChild.children.length).toBe(0);
      });

      it("큰 차이가 있는 자식 배열 처리", () => {
        // 많은 자식을 가진 초기 상태
        const manyChildrenVNode = (
          <ul>
            {Array.from({ length: 20 }, (_, i) => (
              <li key={i}>Item {i + 1}</li>
            ))}
          </ul>
        );

        renderElement(manyChildrenVNode, container);
        expect(container.firstChild.children.length).toBe(20);

        // 적은 수의 자식으로 업데이트
        const fewChildrenVNode = (
          <ul>
            <li>New Item 1</li>
            <li>New Item 2</li>
            <li>New Item 3</li>
          </ul>
        );

        renderElement(fewChildrenVNode, container);

        // 결과 검증: 17개의 자식이 제거되어야 함
        expect(container.firstChild.children.length).toBe(3);
        expect(container.firstChild.children[0].textContent).toBe("New Item 1");
        expect(container.firstChild.children[1].textContent).toBe("New Item 2");
        expect(container.firstChild.children[2].textContent).toBe("New Item 3");
      });

      it("역순으로 자식 제거 로직이 올바르게 작동하는지 확인", () => {
        const initialVNode = (
          <div>
            <span id="first">First</span>
            <span id="second">Second</span>
            <span id="third">Third</span>
            <span id="fourth">Fourth</span>
          </div>
        );

        renderElement(initialVNode, container);

        const initialIds = Array.from(container.firstChild.children).map((child) => child.id);
        expect(initialIds).toEqual(["first", "second", "third", "fourth"]);

        const updatedVNode = (
          <div>
            <span id="first">First Updated</span>
          </div>
        );

        renderElement(updatedVNode, container);

        // 역순으로 제거되므로 "fourth", "third", "second" 순서로 제거
        expect(container.firstChild.children.length).toBe(1);
        expect(container.firstChild.children[0].id).toBe("first");
        expect(container.firstChild.children[0].textContent).toBe("First Updated");
      });

      it("중첩된 구조에서 자식 제거가 올바르게 동작해야 한다", () => {
        const initialVNode = (
          <div>
            <div>
              <span>Nested 1</span>
              <span>Nested 2</span>
            </div>
            <div>
              <span>Nested 3</span>
              <span>Nested 4</span>
            </div>
          </div>
        );

        renderElement(initialVNode, container);

        expect(container.firstChild.children.length).toBe(2);
        expect(container.firstChild.children[0].children.length).toBe(2);
        expect(container.firstChild.children[1].children.length).toBe(2);

        const updatedVNode = (
          <div>
            <div>
              <span>Updated Nested 1</span>
            </div>
          </div>
        );

        renderElement(updatedVNode, container);

        // 두 번째 div가 제거되고, 첫 번째 div의 두 번째 span이 제거되어야 함
        expect(container.firstChild.children.length).toBe(1);
        expect(container.firstChild.children[0].children.length).toBe(1);
        expect(container.firstChild.children[0].children[0].textContent).toBe("Updated Nested 1");
      });

      it("maxLength가 0인 경우 (둘 다 빈 배열)", () => {
        const initialVNode = <div></div>;
        const updatedVNode = <div></div>;

        renderElement(initialVNode, container);
        expect(container.firstChild.children.length).toBe(0);

        expect(() => {
          renderElement(updatedVNode, container);
        }).not.toThrow();

        expect(container.firstChild.children.length).toBe(0);
      });

      it("newChildren.length가 0이고 oldChildren.length가 1인 경우", () => {
        const initialVNode = (
          <div>
            <span>Remove me</span>
          </div>
        );

        renderElement(initialVNode, container);
        expect(container.firstChild.children.length).toBe(1);

        const emptyVNode = <div></div>;

        renderElement(emptyVNode, container);

        expect(container.firstChild.children.length).toBe(0);
      });

      it("복잡한 배열 변경 시나리오", () => {
        // 테이블 형태의 복잡한 구조
        const initialVNode = (
          <table>
            <tbody>
              <tr>
                <td>Cell 1</td>
                <td>Cell 2</td>
                <td>Cell 3</td>
              </tr>
              <tr>
                <td>Cell 4</td>
                <td>Cell 5</td>
                <td>Cell 6</td>
              </tr>
              <tr>
                <td>Cell 7</td>
                <td>Cell 8</td>
                <td>Cell 9</td>
              </tr>
            </tbody>
          </table>
        );

        renderElement(initialVNode, container);

        const tbody = container.querySelector("tbody");
        expect(tbody.children.length).toBe(3);
        expect(tbody.children[0].children.length).toBe(3);

        // 단일 행으로 축소
        const updatedVNode = (
          <table>
            <tbody>
              <tr>
                <td>Only Cell</td>
              </tr>
            </tbody>
          </table>
        );

        renderElement(updatedVNode, container);

        expect(tbody.children.length).toBe(1);
        expect(tbody.children[0].children.length).toBe(1);
        expect(tbody.children[0].children[0].textContent).toBe("Only Cell");
      });
    });
  });
});
