/** @jsx createVNode */
import { ProductList, SearchBar } from "../components";
import { createVNode, renderElement } from "../lib";
import { router, withLifecycle } from "../router";
import {
  loadMoreProducts,
  loadProducts,
  loadProductsAndCategories,
} from "../services";
import { productStore } from "../stores";
import { isNearBottom } from "../utils";
import { PageWrapper } from "./PageWrapper";

const headerLeft = (
  <h1 className="text-xl font-bold text-gray-900">
    <a href="/" data-link="/">
      쇼핑몰
    </a>
  </h1>
);

// ! renderElement 테스트
const $container = document.createElement("div");
document.body.appendChild($container);

const clickHandler = () => {
  console.log("click");
};
const mouseOverHandler = () => {
  console.log("mouseOver");
};
const focusHandler = () => {
  console.log("focus");
};
const keyDownHandler = () => {
  console.log("keyDown");
};

const items = [
  { id: 1, children: <button onClick={clickHandler} /> },
  { id: 2, children: <div onMouseOver={mouseOverHandler} /> },
  { id: 3, children: <input onFocus={focusHandler} /> },
  { id: 4, children: <input onKeyDown={keyDownHandler} /> },
];

const UnorderedList = ({ children, ...props }) => (
  <ul {...props}>{children}</ul>
);
const ListItem = ({ children, className, ...props }) => (
  <li {...props} className={`list-item ${className ?? ""}`}>
    {children}
  </li>
);

const TestComponent = () => (
  <UnorderedList>
    {items.map((item, index) => (
      <ListItem
        id={`item-${item.id}`}
        className={`list-item ${items.length - 1 === index ? "last-item" : ""}`}
      >
        {item.children}
      </ListItem>
    ))}
  </UnorderedList>
);

renderElement(<TestComponent />, $container);

// ! renderElement 테스트

// 무한 스크롤 이벤트 등록
let scrollHandlerRegistered = false;

const loadNextProducts = async () => {
  // 현재 라우트가 홈이 아니면 무한 스크롤 비활성화
  if (router.route?.path !== "/") {
    return;
  }

  if (isNearBottom(200)) {
    const productState = productStore.getState();
    const hasMore = productState.products.length < productState.totalCount;

    // 로딩 중이거나 더 이상 로드할 데이터가 없으면 return
    if (productState.loading || !hasMore) {
      return;
    }

    try {
      await loadMoreProducts();
    } catch (error) {
      console.error("무한 스크롤 로드 실패:", error);
    }
  }
};

const registerScrollHandler = () => {
  if (scrollHandlerRegistered) return;

  window.addEventListener("scroll", loadNextProducts);
  scrollHandlerRegistered = true;
};

const unregisterScrollHandler = () => {
  if (!scrollHandlerRegistered) return;
  window.removeEventListener("scroll", loadNextProducts);
  scrollHandlerRegistered = false;
};

export const HomePage = withLifecycle(
  {
    onMount: () => {
      registerScrollHandler();
      loadProductsAndCategories();
    },
    onUnmount: () => {
      unregisterScrollHandler();
    },
    watches: [
      () => {
        const { search, limit, sort, category1, category2 } = router.query;
        return [search, limit, sort, category1, category2];
      },
      () => loadProducts(true),
    ],
  },
  () => {
    console.log("🏠 홈 페이지 로드");

    const productState = productStore.getState();
    const {
      search: searchQuery,
      limit,
      sort,
      category1,
      category2,
    } = router.query;
    const { products, loading, error, totalCount, categories } = productState;
    const category = { category1, category2 };
    const hasMore = products.length < totalCount;

    return (
      <PageWrapper headerLeft={headerLeft}>
        {/* 검색 및 필터 */}
        <SearchBar
          searchQuery={searchQuery}
          category={category}
          sort={sort}
          limit={limit}
          categories={categories}
        />

        {/* 상품 목록 */}
        <div className="mb-6">
          <ProductList
            products={products}
            loading={loading}
            error={error}
            totalCount={totalCount}
            hasMore={hasMore}
          />
        </div>
      </PageWrapper>
    );
  },
);
