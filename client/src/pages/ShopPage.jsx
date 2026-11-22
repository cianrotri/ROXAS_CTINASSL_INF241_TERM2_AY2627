import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import ChiikawaHeader from '../components/ChiikawaHeader';
import ProductCard from '../components/ProductCard';
import { ASSETS } from '../data/productThumbs';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [cartMap, setCartMap] = useState({});
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoadError('');
      const [prodRes, cartRes] = await Promise.all([api.get('/products'), api.get('/cart')]);
      setProducts(prodRes.data);
      const map = {};
      cartRes.data.items.forEach((i) => {
        map[i.productId] = i.quantity;
      });
      setCartMap(map);
    } catch {
      setLoadError('Could not load products. Is the server running?');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="shop-shell" style={{ backgroundImage: `url(${ASSETS.background})` }}>
      <ChiikawaHeader />
      <main className="shop-main">
        {loadError && <p className="form-error shop-error">{loadError}</p>}
        <div className="product-grid mockup-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} cartQty={cartMap[p._id] || 0} onCartChange={load} />
          ))}
        </div>
      </main>
    </div>
  );
}