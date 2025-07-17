/** @jsx createVNode */
import { ErrorContent, ProductDetail, PublicImage } from "../components";
import { createVNode } from "../lib";
import { router, withLifecycle } from "../router";
import { loadProductDetailForPage } from "../services";
import { productStore } from "../stores";
import { PageWrapper } from "./PageWrapper";
console.log(createVNode);

/**
 * 상품 상세 페이지 컴포넌트
 */
export const ProductDetailPage = withLifecycle(
  {
    onMount: () => {
      loadProductDetailForPage(router.params.id);
    },
    watches: [() => [router.params.id], () => loadProductDetailForPage(router.params.id)],
  },
  () => {
    const { currentProduct: product, relatedProducts = [], error, loading } = productStore.getState();

    return (
      <PageWrapper
        headerLeft={
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <PublicImage src="/back-icon.svg" alt="뒤로" className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">상품 상세</h1>
          </div>
        }
      >
        <div className="min-h-screen bg-gray-50 p-4">
          {loading ? (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">상품 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : error && !product ? (
            <ErrorContent error={error} />
          ) : (
            <ProductDetail product={product} relatedProducts={relatedProducts} />
          )}
        </div>
      </PageWrapper>
    );
  },
);
