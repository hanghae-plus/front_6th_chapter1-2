/** @jsx createVNode */
import { createVNode, normalizeVNode } from "../lib";
import { ProductList, SearchBar } from "../components";
import { productStore } from "../stores";
import { router, withLifecycle } from "../router";
import {
  loadProducts,
  loadProductsAndCategories,
  loadMoreProducts,
} from "../services";
import { isNearBottom } from "../utils";
import { PageWrapper } from "./PageWrapper";

const headerLeft = (
  <h1 className="text-xl font-bold text-gray-900">
    <a href="/" data-link="/">
      쇼핑몰
    </a>
  </h1>
);

// ! normalizeVNode 테스트
const UnorderedList = ({ children, ...props }) => (
  <ul {...props}>{children}</ul>
);
const ListItem = ({ children, className, ...props }) => (
  <li {...props} className={`list-item ${className ?? ""}`}>
    - {children}
  </li>
);

const TestComponent = () => (
  <UnorderedList>
    <ListItem id="item-1">Item 1</ListItem>
    <ListItem id="item-2">Item 2</ListItem>
    <ListItem id="item-3" className="last-item">
      Item 3
    </ListItem>
  </UnorderedList>
);

// * 컴포넌트를 실행하면 vNode로 출력된다.
console.log("TestComponent:", <TestComponent />);

const normalized = normalizeVNode(<TestComponent />);
console.log("normalized: ", normalized);

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
