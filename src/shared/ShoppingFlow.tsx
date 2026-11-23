import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { loadCatalog, productImage } from './catalog';
import type { CartItem, Product } from './types';

const CART_KEY = 'campus-cart-v1';
const money = (value: number) => `$${Number(value).toFixed(2)}`;

function getSavedCart(): CartItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function Header({ cartCount, onCart, variant }: { cartCount: number; onCart: () => void; variant: string }) {
  return (
    <header className={`shop-header ${variant}`}>
      <a className="shop-logo" href="#/" aria-label="Campus Cart home"><span className="brand-mark">C</span><span>campus<span className="logo-light">cart</span></span></a>
      <div className="header-location"><span aria-hidden="true">⌖</span><span>Deliver to<br /><strong>Tempe 85281</strong></span></div>
      <div className="header-search-label">ASU Store</div>
      <button className="header-cart" onClick={onCart} aria-label={`Open cart, ${cartCount} items`}>
        <span aria-hidden="true">▱</span><span>Cart</span>{cartCount > 0 && <b>{cartCount}</b>}
      </button>
    </header>
  );
}

function ProductTile({ product, onSelect, sponsored = false }: { product: Product; onSelect: (product: Product) => void; sponsored?: boolean }) {
  return (
    <button className="product-tile" onClick={() => onSelect(product)} type="button">
      <div className="product-picture">
        {sponsored && <span className="sponsored-tag">Sponsored</span>}
        <img src={productImage(product.image)} alt={product.imageAlt} />
      </div>
      <div className="tile-copy">
        <div className="rating"><span>★★★★★</span> <small>{product.reviews}</small></div>
        <strong>{product.name}</strong>
        <span className="tile-price">{money(product.price)} <small>({product.colors.length} colors)</small></span>
        <small className="delivery">FREE delivery</small>
      </div>
    </button>
  );
}

function SearchPage({ catalog, query, setQuery, onSelect, variant }: { catalog: Product[]; query: string; setQuery: (query: string) => void; onSelect: (product: Product) => void; variant: string }) {
  const asu = catalog.filter((product) => product.school === 'ASU');
  const other = catalog.filter((product) => product.school !== 'ASU');
  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = asu.filter((product) => {
    const searchable = `${product.name} ${product.category} ${product.school}`.toLowerCase();
    return searchTerms.every((term) => searchable.includes(term));
  });
  return (
    <>
      <div className="subnav"><span>☰ All</span><span>Gift cards</span><span>Best sellers</span><span>New releases</span><span>Customer service</span><span className="subnav-right">Welcome to the Sun Devil shop</span></div>
      <div className="search-layout">
        <aside className="filters">
          <p className="filter-heading">Department</p>
          <a>Clothing, Shoes & Jewelry</a><a>Men</a><a>Women</a><a>Sports & Outdoors</a>
          <p className="filter-heading">Customer reviews</p><a className="stars-filter">★★★★★ &amp; up</a><a>★★★★☆ &amp; up</a>
          <p className="filter-heading">Price</p><a>Under $25</a><a>$25 to $50</a><a>$50 &amp; above</a>
          <p className="filter-heading">Featured brands</p><a>Sun Devil Athletics</a><a>Campus Classics</a>
        </aside>
        <main className="results">
          <div className="result-search">
            <label htmlFor="shop-search">Search campus shop</label>
            <div className="search-box"><input id="shop-search" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button" aria-label="Search">⌕</button></div>
          </div>
          <div className="result-count">1-{filtered.length + other.length} of {filtered.length + other.length} results for <strong>“{query || 'all products'}”</strong></div>
          <section className="sponsored-panel">
            <div className="section-title"><h2>Inspired by your search</h2><span>Sponsored</span></div>
            <div className="featured-grid">{asu.slice(0, 2).map((product) => <ProductTile key={`s-${product.id}`} product={product} onSelect={onSelect} sponsored />)}</div>
          </section>
          <div className="sort-bar"><strong>Results</strong><span>Sort by: <b>Featured⌄</b></span></div>
          <div className="product-grid">{filtered.map((product) => <ProductTile key={product.id} product={product} onSelect={onSelect} />)}</div>
          {other.length > 0 && <section className="other-products"><h2>More campus favorites</h2><div className="product-grid">{other.map((product) => <ProductTile key={product.id} product={product} onSelect={onSelect} />)}</div></section>}
          {filtered.length === 0 && <p className="empty-results">No matching Sun Devil styles. Try “shirt”, “hoodie”, or “quarter zip”.</p>}
        </main>
      </div>
      <footer className="shop-footer"><a href="#/">Back to top</a><span>Prototype variant: {variant}</span><span>© Campus Cart demo</span></footer>
    </>
  );
}

function DetailPage({ product, onBack, onAdd }: { product: Product; onBack: () => void; onAdd: (item: { product: Product; color: string; size: string }) => void }) {
  const availableColors = product.colors.filter((color) => color.available);
  const [color, setColor] = useState(availableColors[0]?.name || product.colors[0].name);
  const [size, setSize] = useState(product.sizes[0]);
  const selectedColor = product.colors.find((item) => item.name === color);
  const unavailable = !selectedColor?.available;
  return (
    <main className="detail-page">
      <button className="back-link" onClick={onBack}>‹ Back to search results</button>
      <div className="breadcrumbs">Clothing &amp; Accessories　›　Campus apparel　›　{product.name}</div>
      <div className="detail-layout">
        <div className="detail-image-wrap"><img src={productImage(product.image)} alt={product.imageAlt} /><span className="image-caption">Product image · color shown may vary</span></div>
        <section className="detail-info">
          <p className="seller-line">{product.school} Campus Store</p>
          <h1>{product.name}</h1>
          <div className="rating detail-rating"><span>★★★★★</span> <button className="text-link" type="button" onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}>{product.reviews} ratings</button></div>
          <div className="detail-price">{money(product.price)} <span>({product.school} shop price)</span></div>
          <p className="detail-description">{product.description}</p>
          <div className="option-group"><strong>Color: <span>{color}</span></strong><div className="swatches">
            {product.colors.map((item) => <button key={item.name} className={`swatch ${color === item.name ? 'selected' : ''} ${!item.available ? 'unavailable' : ''}`} onClick={() => setColor(item.name)} aria-label={`${item.name}${item.available ? '' : ', unavailable'}`} title={`${item.name}${item.available ? '' : ' (unavailable)'}`} style={{ '--swatch': item.hex } as CSSProperties}><span>{item.name}</span></button>)}
          </div></div>
          {product.sizes.length > 1 && <label className="size-select">Size<select value={size} onChange={(event) => setSize(event.target.value)}>{product.sizes.map((option) => <option key={option}>{option}</option>)}</select></label>}
          {unavailable && <p className="availability-note">That color is currently unavailable. Choose another color to continue.</p>}
          <button className="primary-button add-button" disabled={unavailable} onClick={() => onAdd({ product, color, size })}>Add to cart</button>
          <div className="delivery-card"><strong>Delivery</strong><span>FREE delivery on eligible orders</span><span>Ships from the campus shop</span></div>
          <p className="detail-subtext">This is a fictional product listing for a class prototype. No purchase will be made.</p>
        </section>
      </div>
      <section className="reviews" id="reviews"><h2>Customer reviews</h2><div className="rating"><span>★★★★★</span> 4.8 out of 5</div><p>“Comfortable fit and the colors look great on game day.”</p><small>Sample review · Reviews are illustrative only</small></section>
    </main>
  );
}

function CartPage({ cart, onQuantity, onRemove, onContinue, onBack }: { cart: CartItem[]; onQuantity: (key: string, quantity: number) => void; onRemove: (key: string) => void; onContinue: () => void; onBack: () => void }) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return (
    <main className="cart-page">
      <button className="back-link" onClick={onBack}>‹ Continue shopping</button>
      <h1>Shopping Cart</h1>
      <div className="cart-layout">
        <section className="cart-items">
          {cart.length === 0 ? <div className="empty-cart"><h2>Your cart is empty</h2><button className="primary-button" onClick={onBack}>Return to search</button></div> : cart.map((item) => <article className="cart-item" key={item.key}>
            <img src={productImage(item.product.image)} alt={item.product.imageAlt} />
            <div className="cart-item-info"><h2>{item.product.name}</h2><p>{item.color} · {item.size}</p><small>In stock · Eligible for free delivery</small><div className="cart-controls"><label>Qty <select value={item.quantity} onChange={(event) => onQuantity(item.key, Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option key={value}>{value}</option>)}</select></label><button onClick={() => onRemove(item.key)}>Delete</button></div></div>
            <strong className="cart-item-price">{money(item.product.price * item.quantity)}</strong>
          </article>)}
          <div className="subtotal">Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items): <strong>{money(subtotal)}</strong></div>
        </section>
        {cart.length > 0 && <aside className="checkout-card"><p className="free-delivery">✓ Your order qualifies for FREE delivery</p><p>Subtotal: <strong>{money(subtotal)}</strong></p><button className="primary-button" onClick={onContinue}>Proceed to checkout</button><small>Secure checkout · Demo only</small></aside>}
      </div>
    </main>
  );
}

function CheckoutPage({ cart, onPlaceOrder, onBack }: { cart: CartItem[]; onPlaceOrder: () => void; onBack: () => void }) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return (
    <main className="checkout-page">
      <button className="back-link" onClick={onBack}>‹ Back to cart</button>
      <h1>Checkout</h1>
      <div className="demo-banner"><strong>Demo checkout</strong> — use any sample details. No real order or payment will be processed.</div>
      <form className="checkout-layout" onSubmit={(event) => { event.preventDefault(); onPlaceOrder(); }}>
        <div className="checkout-fields">
          <section className="form-card"><h2>1. Shipping address</h2><div className="form-grid">
            <label>Full name<input name="name" autoComplete="name" defaultValue="Casey Demo" required /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" defaultValue="casey.demo@example.test" required /></label>
            <label className="wide">Street address<input name="address" autoComplete="street-address" defaultValue="123 Example Street" required /></label>
            <label>City<input name="city" autoComplete="address-level2" defaultValue="Tempe" required /></label>
            <label>State<input name="state" autoComplete="address-level1" defaultValue="AZ" required /></label>
            <label>ZIP code<input name="zip" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" defaultValue="85281" required /></label>
          </div></section>
          <section className="form-card"><h2>2. Payment method <span className="mock-label">MOCK ONLY</span></h2><div className="form-grid">
            <label className="wide">Name on card<input name="cardname" autoComplete="cc-name" defaultValue="Casey Demo" required /></label>
            <label className="wide">Card number<input name="cardnumber" autoComplete="cc-number" inputMode="numeric" pattern="[0-9]{12,19}" minLength={12} maxLength={19} placeholder="Any 12–19 digits" defaultValue="123456789012" required /></label>
            <label>Expiration<input name="expiry" autoComplete="cc-exp" placeholder="MM/YY" pattern="(0[1-9]|1[0-2])\/[0-9]{2}" defaultValue="12/30" required /></label>
            <label>Security code<input name="security" autoComplete="cc-csc" inputMode="numeric" pattern="[0-9]{3,4}" minLength={3} maxLength={4} defaultValue="123" required /></label>
          </div></section>
        </div>
        <aside className="checkout-card order-summary"><h2>Order summary</h2>{cart.map((item) => <div className="summary-item" key={item.key}><span>{item.product.name} · {item.color} × {item.quantity}</span><strong>{money(item.product.price * item.quantity)}</strong></div>)}<div className="summary-total"><span>Order total</span><strong>{money(total)}</strong></div><button className="primary-button" type="submit">Place demo order</button><small>Your entered payment details are not sent or stored.</small></aside>
      </form>
    </main>
  );
}

function SuccessPage({ onReturn }: { onReturn: () => void }) {
  return <main className="success-page"><div className="success-icon">✓</div><p className="eyebrow">DEMO COMPLETE</p><h1>Thanks for trying the shopping flow!</h1><p>Your mock order is complete. No order was submitted and no payment was processed.</p><button className="primary-button" onClick={onReturn}>Return to search</button></main>;
}

export default function ShoppingFlow({ variant }: { variant: 'original' | 'redesign' }) {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('ASU shirt');
  const [step, setStep] = useState<'search' | 'detail' | 'cart' | 'checkout' | 'success'>('search');
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(getSavedCart);

  useEffect(() => {
    loadCatalog().then(setCatalog).catch((error) => setLoadError(error.message));
  }, []);
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const addToCart = ({ product, color, size }: { product: Product; color: string; size: string }) => {
    const key = `${product.id}:${color}:${size}`;
    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      return existing
        ? current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { key, product, color, size, quantity: 1 }];
    });
    setStep('cart');
  };
  const updateQuantity = (key: string, quantity: number) => setCart((current) => current.map((item) => item.key === key ? { ...item, quantity } : item));
  const removeItem = (key: string) => setCart((current) => current.filter((item) => item.key !== key));
  const returnToSearch = () => { setStep('search'); setSelected(null); };

  return (
    <div className={`app-shell variant-${variant}`}>
      <Header cartCount={cartCount} onCart={() => setStep('cart')} variant={variant} />
      {step !== 'success' && <nav className="journey-nav" aria-label="Shopping journey">
        <a href="#/">‹ All experiences</a><div className="journey-progress"><span className={step === 'search' || step === 'detail' ? 'active' : ''}>1 Search</span><i>›</i><span className={step === 'cart' ? 'active' : ''}>2 Cart</span><i>›</i><span className={step === 'checkout' ? 'active' : ''}>3 Checkout</span></div>
      </nav>}
      {loadError ? <main className="load-error"><h1>Catalog unavailable</h1><p>{loadError}</p><button onClick={() => location.reload()}>Try again</button></main> : catalog.length === 0 ? <main className="loading-state">Loading campus shop…</main> : <>
        {step === 'search' && <SearchPage catalog={catalog} query={query} setQuery={setQuery} onSelect={(product) => { setSelected(product); setStep('detail'); }} variant={variant} />}
        {step === 'detail' && selected && <DetailPage product={selected} onBack={returnToSearch} onAdd={addToCart} />}
        {step === 'cart' && <CartPage cart={cart} onQuantity={updateQuantity} onRemove={removeItem} onContinue={() => setStep('checkout')} onBack={returnToSearch} />}
        {step === 'checkout' && <CheckoutPage cart={cart} onPlaceOrder={() => { setCart([]); setStep('success'); }} onBack={() => setStep('cart')} />}
        {step === 'success' && <SuccessPage onReturn={returnToSearch} />}
      </>}
    </div>
  );
}
