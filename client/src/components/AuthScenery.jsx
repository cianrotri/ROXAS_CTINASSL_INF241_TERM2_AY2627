import { ASSETS } from '../data/productThumbs';

/**
 * Meadow is the page background. This layer only places logo + character art
 * (not a full-screen mockup paste).
 */
export default function AuthScenery() {
  return (
    <div className="auth-scenery" aria-hidden>
      <img src={ASSETS.logo} alt="" className="auth-scenery-logo" />
      <img src={ASSETS.loginDecoration} alt="" className="auth-scenery-characters" />
    </div>
  );
}