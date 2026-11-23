import { Link, Navigate, Route, Routes } from 'react-router-dom';
import OriginalApp from '../original/OriginalApp';
import RedesignApp from '../redesign/RedesignApp';

const CART_KEY = 'campus-cart-v1';
const RECENTLY_VIEWED_KEY = 'campus-recently-viewed-v1';

export default function App() {
  return <Routes>
    <Route path="/" element={
    <main className="menu-page">
      <header className="menu-brand">
        <span className="brand-mark">S</span>
        <span>Shamazon</span>
      </header>
      <section className="menu-card">
        <p className="eyebrow">SHOPPING FLOW PROTOTYPE</p>
        <h1>Choose your experience</h1>
        <p className="menu-intro">Explore three versions of an Amazon shopping experience. Both use a local demo catalog and mock checkout.</p>
        <Link className="variant-link" to="/original">
          <span><strong>Original experience</strong><small>Search, choose a product, and check out</small></span><b aria-hidden="true">→</b>
        </Link>
        <Link className="variant-link" to="/redesign">
          <span><strong>Redesign</strong><small>Three targeted improvements over the original</small></span><b aria-hidden="true">→</b>
        </Link>
        <div className="variant-link disabled" aria-disabled="true">
          <span><strong>Refined experience</strong><small>Coming later</small></span><span className="coming-pill">NOT AVAILABLE</span>
        </div>
        <p className="menu-note">Demo only · No real order or payment is processed</p>
        <button className="reset-button" type="button" onClick={() => {
          localStorage.removeItem(CART_KEY);
          localStorage.removeItem(RECENTLY_VIEWED_KEY);
          window.location.reload();
        }}>Reset cart & local state</button>
      </section>
    </main>
    } />
    <Route path="/original/*" element={<OriginalApp />} />
    <Route path="/redesign/*" element={<RedesignApp />} />
    <Route path="/refined" element={<Navigate to="/" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
