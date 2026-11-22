import api from '../api';
import { useAuth } from '../context/AuthContext';
import { getProductVisual } from '../data/productThumbs';

export default function ProductCard({ product, cartQty, onCartChange }) {
  const { refreshCartCount } = useAuth();
  const visual = getProductVisual(product.name);
  const imageSrc = product.imageUrl || visual.image;

  const addOrPlus = async () => {
    if (cartQty > 0) {
      await api.patch('/cart/quantity', { productId: product._id, delta: 1 });
    } else {
      await api.post('/cart/add', { productId: product._id });
    }
    await onCartChange();
    await refreshCartCount();
  };

  const minus = async () => {
    await api.patch('/cart/quantity', { productId: product._id, delta: -1 });
    await onCartChange();
    await refreshCartCount();
  };

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  return (
    <div className="product-card-wrap">
      <article className="product-card mockup">
        <h3>{product.name}</h3>
        <p className="product-price-mockup">{formatPrice(product.price)} PHP</p>
        <div className="product-image-frame">
          <img src={imageSrc} alt={product.name} className="product-photo" loading="lazy" />
        </div>
        {cartQty > 0 ? (
          <div className="qty-stepper mockup-stepper">
            <button type="button" aria-label="Decrease" onClick={minus}>
              −
            </button>
            <span>{cartQty}</span>
            <button
              type="button"
              aria-label="Increase"
              onClick={addOrPlus}
              disabled={cartQty >= product.stock}
            >
              +
            </button>
          </div>
        ) : null}
      </article>
      {cartQty < 1 && (
        <button
          type="button"
          className="add-to-cart-mockup"
          onClick={addOrPlus}
          disabled={product.stock < 1}
        >
          ADD TO CART
        </button>
      )}
    </div>
  );
}