/** @jsx createVNode */
import { Logo, PublicImage } from "../components";
import { createVNode } from "../lib";
import { PageWrapper } from "./PageWrapper";
console.log(createVNode);

export const NotFoundPage = () =>
  PageWrapper({
    headerLeft: Logo(),
    children: (
      <div className="text-center my-4 py-20 shadow-md p-6 bg-white rounded-lg">
        <PublicImage src="/404.svg" alt="페이지를 찾을 수 없습니다" />

        <a
          href="/"
          data-link="/"
          className="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          홈으로
        </a>
      </div>
    ),
  });
