import { ASSETS } from '../data/productThumbs';

export default function StoreLogo({ className = '' }) {
  return (
    <div className={`store-logo ${className}`}>
      <img src={ASSETS.logo} alt="Chiikawa Merch Store" className="logo-image" width={160} height={80} />
    </div>
  );
}