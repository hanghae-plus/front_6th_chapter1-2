/** @jsx createVNode */
import { createVNode } from "../lib";
import { addToCart } from "../services";
import { productStore } from "../stores";

const addToCartWithId = async (id) => {
  const productState = productStore.getState();
  const product = productState.products.find((p) => p.productId === id);

  if (product) {
    addToCart(product, 1);
  }
};

/**
 * 개별 상품 카드 컴포넌트
 */
export function ProductCard({ productId, title, image, lprice, brand, onClick }) {
  const price = Number(lprice);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("ProductCard clicked:", productId); // 디버깅용
    onClick(productId);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
      data-product-id={productId}
    >
      {/* 상품 이미지 */}
      <div className="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          loading="lazy"
          onClick={handleClick}
        />
      </div>

      {/* 상품 정보 */}
      <div className="p-3">
        <div className="cursor-pointer product-info mb-3" onClick={handleClick}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{title}</h3>
          <p className="text-xs text-gray-500 mb-2">{brand}</p>
          <p className="text-lg font-bold text-gray-900">{price.toLocaleString()}원</p>
        </div>

        {/* 장바구니 버튼 */}
        <button
          className="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                       hover:bg-blue-700 transition-colors add-to-cart-btn"
          data-product-id={productId}
          onClick={() => addToCartWithId(productId)}
        >
          장바구니 담기
        </button>
      </div>
    </div>
  );
}

/**
 * 상품 로딩 스켈레톤 컴포넌트 (로딩 중에 보여줄 더미 UI)
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-3">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
