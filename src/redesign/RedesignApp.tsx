import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadCatalog, productImage } from '../shared/catalog';
import type { CartItem, Product } from '../shared/types';

type DeliverySpeed = 'next-day' | 'no-rush';
type DeliveryAddress = { name: string; street: string; city: string; state: string; zip: string };
type TrackingOrder = { items: CartItem[]; address: DeliveryAddress; deliverySpeed: DeliverySpeed };

const CART_KEY = 'campus-cart-v1';
const money = (value: number) => `$${Number(value).toFixed(2)}`;
const unitPrice = (product: Product) => product.dealPrice ?? product.price;
const dateFromNow = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};
const deliveryDate = (daysFromNow: number) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(dateFromNow(daysFromNow));
const deliveryWeekday = (daysFromNow: number) => new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateFromNow(daysFromNow));

function getSavedCart(): CartItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function Header({ cartCount, onCart }: { cartCount: number; onCart: () => void }) {
  return (
    <header className="shop-header original">
      <a className="shop-logo" href="#/" aria-label="Campus Cart home"><span className="brand-mark">C</span><span>campus<span className="logo-light">cart</span></span></a>
      <div className="header-location"><span aria-hidden="true">⌖</span><span>Deliver to<br /><strong>Tempe 85281</strong></span></div>
      <div className="header-search-label">My Account</div>
      <button className="header-cart" onClick={onCart} aria-label={`Open cart, ${cartCount} items`}>
        <span aria-hidden="true">▱</span><span>Cart</span>{cartCount > 0 && <b>{cartCount}</b>}
      </button>
    </header>
  );
}

function ProductTile({ product, onSelect, onQuickAdd, sponsored = false }: { product: Product; onSelect: (product: Product) => void; onQuickAdd: (product: Product, color: string, size: string) => void; sponsored?: boolean }) {
  const defaultSize = product.sizes.find((size) => size.colors.length > 0);
  const defaultColor = product.colors.find((color) => defaultSize?.colors.includes(color.name));
  const canPurchase = defaultColor !== undefined && defaultSize !== undefined;
  const handleProductLink = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (product.school === 'ASU') onSelect(product);
    else window.alert('This is the wrong product and is not implemented. Try again.');
  };
  const imageContent = <>{sponsored && <span className="sponsored-tag">Sponsored</span>}<img src={productImage(product.image)} alt={product.imageAlt} /></>;
  return (
    <article className="product-tile product-tile-original">
      <a className="product-picture" href="#/" onClick={handleProductLink} aria-label={`View ${product.name}`}>{imageContent}</a>
      <div className="tile-copy tile-copy-original">
        <strong className="tile-brand">{product.brand}</strong>
        <a className="tile-name-link" href="#/" onClick={handleProductLink}>{product.name}</a>
        <div className="rating"><span>★★★★★</span> <small>{product.reviews}</small></div>
        <div className="tile-price-original">
          {product.dealPrice !== undefined
            ? <><span className="deal-label">{product.dealLabel ?? 'Deal'}</span><span className="discount-percent">-{Math.round((1 - product.dealPrice / product.price) * 100)}%</span><strong>{money(product.dealPrice)}</strong><del>{money(product.price)}</del></>
            : <strong>{money(product.price)}</strong>}
        </div>
        <small className="delivery">FREE delivery on eligible orders</small>
        {canPurchase
          ? <button className="search-add-button" type="button" onClick={() => onQuickAdd(product, defaultColor.name, defaultSize.name)}>Add to cart</button>
          : <span className="tile-unavailable">Currently unavailable</span>}
      </div>
    </article>
  );
}

function SearchPage({ catalog, query, setQuery, onSelect, onQuickAdd }: { catalog: Product[]; query: string; setQuery: (query: string) => void; onSelect: (product: Product) => void; onQuickAdd: (product: Product, color: string, size: string) => void }) {
  const asu = catalog.filter((product) => product.school === 'ASU');
  const other = catalog.filter((product) => product.school !== 'ASU');
  const sponsored = catalog.filter((product) => product.sponsored);
  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = asu.filter((product) => {
    const searchable = `${product.name} ${product.category} ${product.school}`.toLowerCase();
    return searchTerms.every((term) => searchable.includes(term));
  });
  const results: Product[] = [];
  if (filtered[0]) results.push(filtered[0]);
  for (let index = 0; index < Math.max(filtered.length - 1, other.length); index += 1) {
    if (other[index]) results.push(other[index]);
    if (filtered[index + 1]) results.push(filtered[index + 1]);
  }
  return (
    <>
      <div className="subnav"><span>☰ All</span><span>Gift cards</span><span>Best sellers</span><span>New releases</span><span>Customer service</span></div>
      <div className="search-layout">
        <aside className="filters">
          <p className="filter-heading">Department</p>
          <a>Clothing, Shoes & Jewelry</a><a>Men</a><a>Women</a><a>Sports & Outdoors</a>
          <p className="filter-heading">Customer reviews</p><a className="stars-filter">★★★★★ &amp; up</a><a>★★★★☆ &amp; up</a>
          <p className="filter-heading">Price</p><a>Under $25</a><a>$25 to $50</a><a>$50 &amp; above</a>
          <p className="filter-heading">School / brand</p><a>Arizona State</a><a>University of Arizona</a><a>USC</a><a>UCLA</a><a>Oregon</a>
        </aside>
        <main className="results">
          <div className="result-search">
            <label htmlFor="shop-search">Search campus shop</label>
            <div className="search-box"><input id="shop-search" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button" aria-label="Search">⌕</button></div>
          </div>
          <div className="result-count">1-{filtered.length + other.length} of {filtered.length + other.length} results for <strong>“{query || 'all products'}”</strong></div>
          <section className="sponsored-panel">
            <div className="section-title"><h2>Inspired by your search</h2><span>Sponsored</span></div>
            <div className="featured-grid">{sponsored.map((product) => <ProductTile key={`s-${product.id}`} product={product} onSelect={onSelect} onQuickAdd={onQuickAdd} sponsored />)}</div>
          </section>
          <div className="sort-bar"><strong>Results</strong><span>Sort by: <b>Featured⌄</b></span></div>
          <div className="product-grid">{results.map((product) => <ProductTile key={product.id} product={product} onSelect={onSelect} onQuickAdd={onQuickAdd} />)}</div>
          {filtered.length === 0 && <p className="empty-results">No matching Sun Devil styles. Try “shirt”, “hoodie”, or “quarter zip”.</p>}
        </main>
      </div>
      <footer className="shop-footer"><a href="#/">Back to top</a><span>Prototype variant: redesign</span><span>© Campus Cart demo</span></footer>
    </>
  );
}

function DetailPage({ product, onBack, onAdd }: { product: Product; onBack: () => void; onAdd: (item: { product: Product; color: string; size: string }, quantity: number) => void }) {
  const initialSize = product.sizes[0];
  const initialColor = product.colors.find((item) => initialSize?.colors.includes(item.name)) ?? product.colors[0];
  const [color, setColor] = useState(initialColor?.name ?? '');
  const [size, setSize] = useState(initialSize?.name ?? '');
  const [quantity, setQuantity] = useState(1);
  const swatchesRef = useRef<HTMLDivElement>(null);
  const [canScrollColorsLeft, setCanScrollColorsLeft] = useState(false);
  const [canScrollColorsRight, setCanScrollColorsRight] = useState(false);
  const selectedColor = product.colors.find((item) => item.name === color);
  const availableColors = product.sizes.find((item) => item.name === size)?.colors ?? [];
  const unavailable = !selectedColor || !availableColors.includes(selectedColor.name);
  useEffect(() => {
    const swatches = swatchesRef.current;
    if (!swatches) return;
    const updateScrollButtons = () => {
      setCanScrollColorsLeft(swatches.scrollLeft > 1);
      setCanScrollColorsRight(swatches.scrollLeft + swatches.clientWidth < swatches.scrollWidth - 1);
    };
    updateScrollButtons();
    swatches.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      swatches.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [product.colors.length]);
  const scrollColors = (direction: -1 | 1) => {
    swatchesRef.current?.scrollBy({ left: direction * (swatchesRef.current.clientWidth * 0.75), behavior: 'smooth' });
  };
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
          <hr className="detail-separator" />
          <div className="detail-price">{money(unitPrice(product))} {product.dealPrice !== undefined && <del>{money(product.price)}</del>} <span>({product.school} shop price)</span></div>
          <p className="detail-description">{product.description}</p>
          <div className="option-group"><strong>Color: <span>{color}</span></strong><div className="swatch-carousel">
            <button type="button" className="swatch-scroll-button" aria-label="Scroll colors left" disabled={!canScrollColorsLeft} onClick={() => scrollColors(-1)}>‹</button>
            <div className="swatches" ref={swatchesRef}>
              {product.colors.map((item) => {
              const isAvailable = availableColors.includes(item.name);
              return <div key={item.name} className={`swatch-option ${color === item.name ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}>
                <button type="button" className="swatch" onClick={() => isAvailable && setColor(item.name)} disabled={!isAvailable} aria-label={`${item.name}, ${money(unitPrice(product))}${isAvailable ? '' : `, unavailable in ${size}`}`} title={`${item.name}${isAvailable ? '' : ` (unavailable in ${size})`}`} style={{ '--swatch': item.hex } as CSSProperties} />
                <span className="swatch-name">{item.name}</span>
                <strong className="swatch-price">{money(unitPrice(product))}</strong>
              </div>;
              })}
            </div>
            <button type="button" className="swatch-scroll-button" aria-label="Scroll colors right" disabled={!canScrollColorsRight} onClick={() => scrollColors(1)}>›</button>
          </div></div>
          {product.sizes.length > 1 && <label className="size-select">Size<select value={size} onChange={(event) => {
            const nextSize = event.target.value;
            const nextColors = product.sizes.find((item) => item.name === nextSize)?.colors ?? [];
            setSize(nextSize);
            if (!nextColors.includes(color)) setColor(nextColors[0] ?? '');
          }}>{product.sizes.map((option) => <option key={option.name} value={option.name}>{option.name}</option>)}</select></label>}
          {unavailable && <p className="availability-note">That color is unavailable for the selected size. Choose another option to continue.</p>}
        </section>
        <aside className="buy-box" aria-label="Purchase options">
          <div className="buy-box-price"><strong>{money(unitPrice(product))}</strong>{product.dealPrice !== undefined && <del>{money(product.price)}</del>}</div>
          {product.dealPrice !== undefined && <p className="buy-box-deal">{product.dealLabel ?? 'Limited-time deal'}</p>}
          <p className="buy-box-delivery">FREE delivery <strong>in 3–5 business days</strong></p>
          <p className="buy-box-destination">Deliver to User - Tempe 85281</p>
          <p className="stock-status">In Stock</p>
          <label className="quantity-select">Quantity
            <select aria-label="Quantity" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <button className="primary-button add-button" disabled={unavailable} onClick={() => onAdd({ product, color, size }, quantity)}>Add to cart</button>
          <dl className="buy-box-details">
            <div><dt>Ships from</dt><dd>Amazon</dd></div>
            <div><dt>Sold by</dt><dd>{product.school} Campus Store</dd></div>
            <div><dt>Returns</dt><dd>Free 30-day returns</dd></div>
            <div><dt>Packaging</dt><dd>Ships in Amazon packaging</dd></div>
          </dl>
          <p className="detail-subtext">This is a fictional product listing for a class prototype. No purchase will be made.</p>
        </aside>
      </div>
      <section className="reviews" id="reviews"><h2>Customer reviews</h2><div className="rating"><span>★★★★★</span> 4.8 out of 5</div><p>“Comfortable fit and the colors look great on game day.”</p><small>Sample review · Reviews are illustrative only</small></section>
    </main>
  );
}

function CartPage({ cart, onQuantity, onRemove, onContinue, onBack }: { cart: CartItem[]; onQuantity: (key: string, quantity: number) => void; onRemove: (key: string) => void; onContinue: () => void; onBack: () => void }) {
  const subtotal = cart.reduce((sum, item) => sum + unitPrice(item.product) * item.quantity, 0);
  return (
    <main className="cart-page">
      <button className="back-link" onClick={onBack}>‹ Continue shopping</button>
      <h1>Shopping Cart</h1>
      <div className="cart-layout">
        <section className="cart-items">
          {cart.length === 0 ? <div className="empty-cart"><h2>Your cart is empty</h2><button className="primary-button" onClick={onBack}>Return to search</button></div> : cart.map((item) => <article className="cart-item" key={item.key}>
            <img src={productImage(item.product.image)} alt={item.product.imageAlt} />
            <div className="cart-item-info"><h2>{item.product.name}</h2><p>{item.color} · {item.size}</p><small>In stock · Eligible for free delivery</small><div className="cart-controls"><label>Qty <select value={item.quantity} onChange={(event) => onQuantity(item.key, Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option key={value}>{value}</option>)}</select></label><button onClick={() => onRemove(item.key)}>Delete</button></div></div>
            <strong className="cart-item-price">{money(unitPrice(item.product) * item.quantity)}</strong>
          </article>)}
          <div className="subtotal">Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items): <strong>{money(subtotal)}</strong></div>
        </section>
        {cart.length > 0 && <aside className="checkout-card"><p className="free-delivery">✓ Your order qualifies for FREE delivery</p><p>Subtotal: <strong>{money(subtotal)}</strong></p><button className="primary-button" onClick={onContinue}>Proceed to checkout</button><small>Secure checkout · Demo only</small></aside>}
      </div>
    </main>
  );
}

function CheckoutPage({ cart, onPlaceOrder, onBack }: { cart: CartItem[]; onPlaceOrder: (shipping: Pick<TrackingOrder, 'address' | 'deliverySpeed'>) => void; onBack: () => void }) {
  const total = cart.reduce((sum, item) => sum + unitPrice(item.product) * item.quantity, 0);
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>('no-rush');
  const [address, setAddress] = useState<DeliveryAddress>({ name: 'Casey Demo', street: '123 Example Street', city: 'Tempe', state: 'AZ', zip: '85281' });
  const [addressDraft, setAddressDraft] = useState(address);
  const [editingAddress, setEditingAddress] = useState(false);
  return (
    <main className="checkout-page">
      <button className="back-link" onClick={onBack}>‹ Back to cart</button>
      <h1>Checkout</h1>
      <div className="demo-banner"><strong>Demo checkout</strong> — use any sample details. No real order or payment will be processed.</div>
      <form className="checkout-layout" onSubmit={(event) => { event.preventDefault(); onPlaceOrder({ address, deliverySpeed }); }}>
        <div className="checkout-fields">
          <section className="form-card shipping-address-card">
            <div className="checkout-section-heading"><h2>Delivering to {address.name}</h2>
              {!editingAddress && <button type="button" className="text-link" onClick={() => { setAddressDraft(address); setEditingAddress(true); }}>Change</button>}
            </div>
            {editingAddress ? <div className="address-edit-grid">
              <label>Full name<input value={addressDraft.name} onChange={(event) => setAddressDraft({ ...addressDraft, name: event.target.value })} /></label>
              <label className="wide">Street address<input value={addressDraft.street} onChange={(event) => setAddressDraft({ ...addressDraft, street: event.target.value })} /></label>
              <label>City<input value={addressDraft.city} onChange={(event) => setAddressDraft({ ...addressDraft, city: event.target.value })} /></label>
              <label>State<input value={addressDraft.state} onChange={(event) => setAddressDraft({ ...addressDraft, state: event.target.value })} /></label>
              <label>ZIP code<input value={addressDraft.zip} onChange={(event) => setAddressDraft({ ...addressDraft, zip: event.target.value })} /></label>
              <div className="address-edit-actions">
                <button type="button" className="primary-button" onClick={() => { setAddress(addressDraft); setEditingAddress(false); }}>Save address</button>
                <button type="button" className="text-link" onClick={() => setEditingAddress(false)}>Cancel</button>
              </div>
            </div> : <address className="shipping-address">
              <span>{address.street}</span>
              <span>{address.city}, {address.state} {address.zip}</span>
            </address>}
          </section>
          <section className="form-card delivery-choice-card">
            <h2>Choose your delivery speed</h2>
            <label className={`delivery-choice ${deliverySpeed === 'next-day' ? 'selected' : ''}`}>
              <input type="radio" name="delivery-speed" value="next-day" checked={deliverySpeed === 'next-day'} onChange={() => setDeliverySpeed('next-day')} />
              <span><strong>Next-day delivery</strong><small>Arrives {deliveryDate(1)}</small></span>
            </label>
            <label className={`delivery-choice ${deliverySpeed === 'no-rush' ? 'selected' : ''}`}>
              <input type="radio" name="delivery-speed" value="no-rush" checked={deliverySpeed === 'no-rush'} onChange={() => setDeliverySpeed('no-rush')} />
              <span><strong>No-rush delivery</strong><small>Arrives {deliveryDate(3)}</small></span>
            </label>
            <div className="delivery-items">
              <h3>Items arriving {deliveryDate(deliverySpeed === 'next-day' ? 1 : 3)}</h3>
            {cart.map((item) => <article className="checkout-item" key={item.key}>
              <img src={productImage(item.product.image)} alt={item.product.imageAlt} />
              <div className="checkout-item-info">
                <strong>{item.product.name}</strong>
                <span>{item.color} · {item.size} · Quantity: {item.quantity}</span>
              </div>
              <strong className="checkout-item-price">{money(unitPrice(item.product) * item.quantity)}</strong>
            </article>)}
            </div>
          </section>
          <section className="form-card payment-method-card">
            <h2>Payment method <span className="mock-label">MOCK ONLY</span></h2>
            <p className="payment-method-summary"><span className="visa-mark">VISA</span><strong>Paying with Visa 0000</strong></p>
          </section>
        </div>
        <aside className="checkout-card order-summary"><h2>Order summary</h2>{cart.map((item) => <div className="summary-item" key={item.key}><span>{item.product.name} · {item.color} × {item.quantity}</span><strong>{money(unitPrice(item.product) * item.quantity)}</strong></div>)}<div className="summary-total"><span>Order total</span><strong>{money(total)}</strong></div><button className="primary-button" type="submit">Place demo order</button><small>Your entered payment details are not sent or stored.</small></aside>
      </form>
    </main>
  );
}

function OrderTrackingPage({ order }: { order: TrackingOrder }) {
  const arrivalDays = order.deliverySpeed === 'next-day' ? 1 : 3;
  return (
    <main className="tracking-page">
      <div className="tracking-map">
        <img className="tracking-map-image" src={productImage('product-imgs/asu-campus-map.png')} alt="Map of ASU Tempe campus with a pin on Old Main" />
        <section className="tracking-pane" aria-label="Order tracking">
          <h1>Arriving {deliveryWeekday(arrivalDays)}</h1>
          <p className="tracking-address"><strong>Delivering to {order.address.name}</strong><br />{order.address.street}<br />{order.address.city}, {order.address.state} {order.address.zip}</p>
          <div className="tracking-product-images">
            {order.items.map((item) => <div className="tracking-product" key={item.key}>
              <img src={productImage(item.product.image)} alt={`${item.product.name}, quantity ${item.quantity}`} />
              <span>Qty {item.quantity}</span>
            </div>)}
          </div>
          <hr />
          <div className="tracking-status">
            <strong>Ordered</strong>
            <div className="tracking-progress" role="progressbar" aria-label="Order status: Ordered" aria-valuemin={0} aria-valuemax={3} aria-valuenow={1}>
              <span />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function RedesignApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('ASU shirt');
  const [step, setStep] = useState<'search' | 'detail' | 'cart' | 'checkout' | 'tracking'>('search');
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(getSavedCart);
  const [completedOrder, setCompletedOrder] = useState<TrackingOrder | null>(null);

  useEffect(() => {
    loadCatalog().then(setCatalog).catch((error) => setLoadError(error.message));
  }, []);
  useEffect(() => {
    const productId = location.pathname.match(/^\/redesign\/product\/([^/]+)$/)?.[1];
    if (!productId) {
      setStep('search');
      setSelected(null);
      return;
    }
    if (catalog.length === 0) return;
    const product = catalog.find((item) => item.id === decodeURIComponent(productId));
    if (!product || product.school !== 'ASU') {
      navigate('/redesign', { replace: true });
      return;
    }
    setSelected(product);
    setStep('detail');
  }, [catalog, location.pathname, navigate]);
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const addToCart = ({ product, color, size }: { product: Product; color: string; size: string }, quantity = 1) => {
    const key = `${product.id}:${color}:${size}`;
    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      return existing
        ? current.map((item) => item.key === key ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { key, product, color, size, quantity }];
    });
    setStep('cart');
  };
  const updateQuantity = (key: string, quantity: number) => setCart((current) => current.map((item) => item.key === key ? { ...item, quantity } : item));
  const removeItem = (key: string) => setCart((current) => current.filter((item) => item.key !== key));
  const returnToSearch = () => {
    setStep('search');
    setSelected(null);
    setCompletedOrder(null);
    if (location.pathname !== '/redesign') navigate('/redesign', { replace: true });
  };

  return (
    <div className="app-shell variant-redesign">
      <Header cartCount={cartCount} onCart={() => setStep('cart')} />
      
      {loadError ? <main className="load-error"><h1>Catalog unavailable</h1><p>{loadError}</p><button onClick={() => window.location.reload()}>Try again</button></main> : catalog.length === 0 ? <main className="loading-state">Loading campus shop…</main> : <>
        {step === 'search' && <SearchPage catalog={catalog} query={query} setQuery={setQuery} onSelect={(product) => { setSelected(product); setStep('detail'); navigate(`/redesign/product/${encodeURIComponent(product.id)}`); }} onQuickAdd={(product, color, size) => addToCart({ product, color, size })} />}
        {step === 'detail' && selected && <DetailPage product={selected} onBack={returnToSearch} onAdd={addToCart} />}
        {step === 'cart' && <CartPage cart={cart} onQuantity={updateQuantity} onRemove={removeItem} onContinue={() => setStep('checkout')} onBack={returnToSearch} />}
        {step === 'checkout' && <CheckoutPage cart={cart} onPlaceOrder={(shipping) => { setCompletedOrder({ items: cart.map((item) => ({ ...item })), ...shipping }); setCart([]); setStep('tracking'); }} onBack={() => setStep('cart')} />}
        {step === 'tracking' && completedOrder && <OrderTrackingPage order={completedOrder} />}
      </>}
    </div>
  );
}
