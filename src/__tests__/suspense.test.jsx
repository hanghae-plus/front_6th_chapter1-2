/** @jsx createVNode */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SuspenseWrapper } from "../components";
import { createVNode, renderElement } from "../lib";
import { clearCache } from "../lib/suspenseContext";

describe("Suspense 패턴 테스트", () => {
  let container;

  beforeEach(async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    clearCache(); // 각 테스트 전에 캐시 초기화
  });

  afterEach(() => {
    document.body.removeChild(container);
    clearCache();
  });

  it("동기 컴포넌트는 정상적으로 렌더링되어야 한다", async () => {
    const SyncComponent = ({ message }) => <div>{message}</div>;

    const vNode = (
      <SuspenseWrapper fallback={<div>Loading...</div>}>
        <SyncComponent message="Hello World" />
      </SuspenseWrapper>
    );

    await renderElement(vNode, container);

    expect(container.innerHTML).toContain("Hello World");
    expect(container.innerHTML).not.toContain("Loading...");
    expect(container.querySelector('[data-suspense="resolved"]')).toBeTruthy();
  });

  it("비동기 컴포넌트는 먼저 fallback을 보여주고 나중에 실제 내용을 렌더링해야 한다", async () => {
    const AsyncComponent = async ({ message }) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return <div>{message}</div>;
    };

    const vNode = (
      <SuspenseWrapper fallback={<div>Loading...</div>}>
        <AsyncComponent message="Async Hello" />
      </SuspenseWrapper>
    );

    await renderElement(vNode, container);

    // 처음에는 fallback이 렌더링되어야 함
    expect(container.innerHTML).toContain("Loading...");
    expect(container.innerHTML).not.toContain("Async Hello");
    expect(container.querySelector('[data-suspense="pending"]')).toBeTruthy();
  });

  it("여러 비동기 컴포넌트가 있을 때 모두 완료될 때까지 fallback을 보여줘야 한다", async () => {
    const AsyncComponent1 = async ({ message }) => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return <div>{message}</div>;
    };

    const AsyncComponent2 = async ({ message }) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return <span>{message}</span>;
    };

    const vNode = (
      <SuspenseWrapper fallback={<div>Loading multiple...</div>}>
        <div>
          <AsyncComponent1 message="First" />
          <AsyncComponent2 message="Second" />
        </div>
      </SuspenseWrapper>
    );

    await renderElement(vNode, container);

    // 처음에는 fallback이 렌더링되어야 함
    expect(container.innerHTML).toContain("Loading multiple...");
    expect(container.innerHTML).not.toContain("First");
    expect(container.innerHTML).not.toContain("Second");
  });

  it("중첩된 Suspense 경계가 올바르게 작동해야 한다", async () => {
    const AsyncComponent = async ({ message }) => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return <div>{message}</div>;
    };

    const SyncComponent = ({ message }) => <span>{message}</span>;

    const vNode = (
      <SuspenseWrapper fallback={<div>Outer Loading...</div>}>
        <div>
          <SyncComponent message="Sync content" />
          <SuspenseWrapper fallback={<div>Inner Loading...</div>}>
            <AsyncComponent message="Async content" />
          </SuspenseWrapper>
        </div>
      </SuspenseWrapper>
    );

    await renderElement(vNode, container);

    // 외부 Suspense는 해결되고, 내부 Suspense는 대기 중이어야 함
    expect(container.innerHTML).toContain("Sync content");
    expect(container.innerHTML).toContain("Inner Loading...");
    expect(container.innerHTML).not.toContain("Outer Loading...");
    expect(container.innerHTML).not.toContain("Async content");
  });

  it("에러가 발생한 비동기 컴포넌트는 적절히 처리되어야 한다", async () => {
    const ErrorAsyncComponent = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      throw new Error("Async component error");
    };

    const vNode = (
      <SuspenseWrapper fallback={<div>Loading...</div>}>
        <ErrorAsyncComponent />
      </SuspenseWrapper>
    );

    await renderElement(vNode, container);

    // 처음에는 fallback이 렌더링되어야 함
    expect(container.innerHTML).toContain("Loading...");
  });
});
