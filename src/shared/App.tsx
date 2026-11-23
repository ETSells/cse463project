import { Link, Navigate, Route, Routes } from 'react-router-dom';
import OriginalApp from '../original/OriginalApp';
import RedesignApp from '../redesign/RedesignApp';

export default function App() {
  return <Routes>
    <Route path="/" element={
    <main className="menu-page">
      <header className="menu-brand">
        <span className="brand-mark">C</span>
        <span>Campus Cart</span>
      </header>
      <section className="menu-card">
        <p className="eyebrow">SHOPPING FLOW PROTOTYPE</p>
        <h1>Choose your experience</h1>
        <p className="menu-intro">Explore two versions of an ASU shopping journey. Both use a local demo catalog and mock checkout.</p>
        <Link className="variant-link" to="/original">
          <span><strong>Original experience</strong><small>Search, choose a product, and check out</small></span><b aria-hidden="true">→</b>
        </Link>
        <Link className="variant-link" to="/redesign">
          <span><strong>Redesign</strong><small>Same shopping behavior in a refreshed layout</small></span><b aria-hidden="true">→</b>
        </Link>
        <div className="variant-link disabled" aria-disabled="true">
          <span><strong>Refined experience</strong><small>Coming later</small></span><span className="coming-pill">NOT AVAILABLE</span>
        </div>
        <p className="menu-note">Demo only · No real order or payment is processed</p>
      </section>
    </main>
    } />
    <Route path="/original" element={<OriginalApp />} />
    <Route path="/redesign" element={<RedesignApp />} />
    <Route path="/refined" element={<Navigate to="/" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
