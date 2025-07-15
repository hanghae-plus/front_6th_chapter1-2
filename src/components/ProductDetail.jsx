/** @jsx createVNode */
import { createVNode } from "../lib";
import { router } from "../router";
import { productStore } from "../stores";
import { addToCart as addToCartWithProduct } from "../services";

const goToHomeWithCategory = async (categories) => {
  const queryString = new URLSearchParams(categories).toString();
  router.push(`/?${queryString}`);
};

const goToHomeWithCurrentCategory = async () => {
  const product = productStore.getState().currentProduct;
  const query = {
    category1: product?.category1,
    category2: product?.category2,
    currentPage: 1,
  };
  const queryString = new URLSearchParams(query).toString();
  router.push(`/?${queryString}`);
};

// 상품 상세 페이지에서 수량 증가/감소
const incrementQuantity = () => {
  const input = document.getElementById("quantity-input");
  if (input) {
    const max = parseInt(input.getAttribute("max")) || 100;
    input.value = Math.min(max, parseInt(input.value) + 1);
  }
};

const decrementQuantity = () => {
  const input = document.getElementById("quantity-input");
  if (input) {
    input.value = Math.max(1, parseInt(input.value) - 1);
  }
};

const addToCart = () => {
  const quantityInput = document.getElementById("quantity-input");
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
  const productState = productStore.getState();
  const product = productState.currentProduct;

  if (product) {
    console.log("🛒 상품 상세 페이지에서 장바구니 추가:", product);
    addToCartWithProduct(product, quantity);
  }
};

export function ProductDetail({ product, relatedProducts = [] }) {
  const {
    productId,
    title,
    image,
    lprice,
    brand,
    description = "",
    rating = 0,
    reviewCount = 0,
    stock = 100,
    category1,
    category2,
  } = product;

  const price = Number(lprice);

  // 브레드크럼 생성
  const breadcrumbItems = [];
  if (category1)
    breadcrumbItems.push({
      name: category1,
      category: "category1",
      value: category1,
    });
  if (category2)
    breadcrumbItems.push({
      name: category2,
      category: "category2",
      value: category2,
    });

  return (
    <div>
      {/* 브레드크럼 */}
      {breadcrumbItems.length > 0 && (
        <nav className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" data-link className="hover:text-blue-600 transition-colors">
              홈
            </a>
            {breadcrumbItems
              .map((item, index) => [
                <img
                  key={`${item.category}-icon`}
                  src="/chevron-right-icon.svg"
                  alt="오른쪽 화살표"
                  className="w-4 h-4 text-gray-400"
                />,
                <button
                  key={`${item.category}-btn`}
                  className="breadcrumb-link"
                  {...{
                    [`data-${item.category}`]: item.value,
                  }}
                  onClick={() =>
                    goToHomeWithCategory(
                      index === 0
                        ? { category1: item.value }
                        : { category1: breadcrumbItems[index - 1].value, category2: item.value },
                    )
                  } // 카테고리 클릭 시 홈으로 이동
                >
                  {item.name}
                </button>,
              ])
              .flat()}
          </div>
        </nav>
      )}

      {/* 상품 상세 정보 */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        {/* 상품 이미지 */}
        <div className="p-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img src={image} alt={title} className="w-full h-full object-cover product-detail-image" />
          </div>

          {/* 상품 정보 */}
          <div>
            <p className="text-sm text-gray-600 mb-1">{brand}</p>
            <h1 className="text-xl font-bold text-gray-900 mb-3">{title}</h1>

            {/* 평점 및 리뷰 */}
            {rating > 0 && (
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <img
                        key={i}
                        src="/star-icon.svg"
                        alt="별점"
                        className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {rating}.0 ({reviewCount.toLocaleString()}개 리뷰)
                </span>
              </div>
            )}

            {/* 가격 */}
            <div className="mb-4">
              <span className="text-2xl font-bold text-blue-600">{price.toLocaleString()}원</span>
            </div>

            {/* 재고 */}
            <div className="text-sm text-gray-600 mb-4">재고 {stock.toLocaleString()}개</div>

            {/* 설명 */}
            {description && <div className="text-sm text-gray-700 leading-relaxed mb-6">{description}</div>}
          </div>
        </div>

        {/* 수량 선택 및 액션 */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900">수량</span>
            <div className="flex items-center">
              <button
                id="quantity-decrease"
                className="w-8 h-8 flex items-center justify-center border border-gray-300
                             rounded-l-md bg-gray-50 hover:bg-gray-100"
                onClick={decrementQuantity}
              >
                <img src="/quantity-minus-icon.svg" alt="수량 감소" className="w-4 h-4" />
              </button>

              <input
                type="number"
                id="quantity-input"
                value="1"
                min="1"
                max={stock}
                className="w-16 h-8 text-center text-sm border-t border-b border-gray-300
                            focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />

              <button
                id="quantity-increase"
                className="w-8 h-8 flex items-center justify-center border border-gray-300
                             rounded-r-md bg-gray-50 hover:bg-gray-100"
                onClick={incrementQuantity}
              >
                <img src="/quantity-plus-icon.svg" alt="수량 증가" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 액션 버튼 */}
          <button
            id="add-to-cart-btn"
            data-product-id={productId}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md
                         hover:bg-blue-700 transition-colors font-medium"
            onClick={addToCart}
          >
            장바구니 담기
          </button>
        </div>
      </div>

      {/* 상품 목록으로 이동 */}
      <div className="mb-6">
        <button
          className="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md
                  hover:bg-gray-200 transition-colors go-to-product-list"
          onClick={goToHomeWithCurrentCategory}
        >
          상품 목록으로 돌아가기
        </button>
      </div>

      {/* 관련 상품 */}
      {relatedProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">관련 상품</h2>
            <p className="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3 responsive-grid">
              {relatedProducts.slice(0, 20).map((relatedProduct) => (
                <div
                  key={relatedProduct.productId}
                  className="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer"
                  data-product-id={relatedProduct.productId}
                  onClick={() => router.push(`/product/${relatedProduct.productId}`)}
                >
                  <div className="aspect-square bg-white rounded-md overflow-hidden mb-2">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      data-link
                      href={`/product/${relatedProduct.productId}`}
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{relatedProduct.title}</h3>
                  <p className="text-sm font-bold text-blue-600">{Number(relatedProduct.lprice).toLocaleString()}원</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
