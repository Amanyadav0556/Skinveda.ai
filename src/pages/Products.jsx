import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../App';
import { Icon, PageHeader, EmptyState } from '../components/ui';
import { SampleBanner, SkeletonCard, SafetyNotice } from '../components/skin';
import { ProductCard, ProductVisual, RecommendationExplanation } from '../components/commerce';
import { listProducts, getProduct, recommendProducts, sponsoredProducts, alternativesFor, brandsOf, explainMatch } from '../lib/catalog';
import { PRODUCT_CATEGORIES } from '../data/products';
import { CONCERNS, INGREDIENTS, SKIN_TYPES } from '../data/skincare';

const PRICE_OPTIONS = [{ v: '', l: 'Any price' }, { v: '400', l: 'Under ₹400' }, { v: '600', l: 'Under ₹600' }, { v: '800', l: 'Under ₹800' }];
const inr = n => `₹${Number(n).toLocaleString('en-IN')}`;

function useSkinContext() {
  const { scans, user } = useApp();
  const latest = scans[0];
  return {
    skinType: latest?.skinType || (SKIN_TYPES.includes(user?.skinType) ? user.skinType : undefined),
    concerns: latest ? latest.concerns.map(c => c.id) : [],
    hasScan: !!latest,
  };
}

function ProductList() {
  const { navigate } = useApp();
  const { skinType, concerns, hasScan } = useSkinContext();
  const [filters, setFilters] = useState({ query: '', skinType: '', concern: '', category: '', ingredient: '', maxPrice: '', brand: '' });
  const [items, setItems] = useState(null);
  const [recs, setRecs] = useState([]);
  const [sponsored, setSponsored] = useState([]);

  useEffect(() => {
    let live = true;
    listProducts({ ...filters, maxPrice: Number(filters.maxPrice) || undefined }).then(r => live && setItems(r));
    return () => { live = false; };
  }, [filters]);

  useEffect(() => {
    recommendProducts({ skinType, concerns, limit: 4 }).then(setRecs);
    sponsoredProducts({ skinType, concerns }).then(setSponsored);
  }, [skinType, concerns.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const active = Object.values(filters).some(Boolean);
  const open = id => navigate(`products/${id}`);

  return (
    <div className="stack">
      <SampleBanner>
        Sample catalogue: brands and prices are placeholders for this demo. Buying through SkinVeda is optional — you can follow your routine without purchasing anything.
      </SampleBanner>

      {recs.length > 0 && (
        <section aria-labelledby="recs-h">
          <h2 className="h-section" id="recs-h">Suggested for your skin</h2>
          <p className="t-small ink2" style={{ margin: '4px 0 14px' }}>
            {hasScan ? 'Picked using your latest scan. Each card explains why.' : 'Picked using your profile. Scan your face for more personal suggestions.'}
          </p>
          <div className="product-grid">
            {recs.map(r => <ProductCard key={r.product.id} product={r.product} reason={r.reason} onOpen={open} />)}
          </div>
        </section>
      )}

      {sponsored.length > 0 && (
        <section aria-labelledby="sp-h">
          <div className="row" style={{ gap: 10 }}>
            <h2 className="h-section" id="sp-h">Sponsored</h2>
            <span className="pill pill-sponsored">Paid placement</span>
          </div>
          <p className="t-small ink2" style={{ margin: '4px 0 14px' }}>Brands pay for these placements. They are never ranked by SkinVeda's recommendations.</p>
          <div className="product-grid">
            {sponsored.map(p => <ProductCard key={p.id} product={p} onOpen={open} />)}
          </div>
        </section>
      )}

      <section className="card" aria-labelledby="all-h">
        <div className="card-head" style={{ flexWrap: 'wrap' }}>
          <h2 className="h-section" id="all-h">All products</h2>
          <span className="t-small muted">{items ? `${items.length} product${items.length === 1 ? '' : 's'}` : 'Loading…'}</span>
        </div>
        <div className="filters" role="search">
          <div className="input-wrap">
            <Icon name="filter" size={16} />
            <input className="input" placeholder="Search products, brands, ingredients" value={filters.query} onChange={e => set('query', e.target.value)} aria-label="Search products" />
          </div>
          <select className="select select-sm" value={filters.skinType} onChange={e => set('skinType', e.target.value)} aria-label="Skin type">
            <option value="">Any skin type</option>{SKIN_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="select select-sm" value={filters.concern} onChange={e => set('concern', e.target.value)} aria-label="Concern">
            <option value="">Any concern</option>{Object.entries(CONCERNS).map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}
          </select>
          <select className="select select-sm" value={filters.category} onChange={e => set('category', e.target.value)} aria-label="Category">
            <option value="">All categories</option>{PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="select select-sm" value={filters.ingredient} onChange={e => set('ingredient', e.target.value)} aria-label="Ingredient">
            <option value="">Any ingredient</option>{Object.entries(INGREDIENTS).map(([id, i]) => <option key={id} value={id}>{i.name}</option>)}
          </select>
          <select className="select select-sm" value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} aria-label="Price range">
            {PRICE_OPTIONS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
          <select className="select select-sm" value={filters.brand} onChange={e => set('brand', e.target.value)} aria-label="Brand">
            <option value="">All brands</option>{brandsOf().map(b => <option key={b}>{b}</option>)}
          </select>
          {active && <button className="btn btn-sm btn-text" onClick={() => setFilters({ query: '', skinType: '', concern: '', category: '', ingredient: '', maxPrice: '', brand: '' })}>Clear filters</button>}
        </div>
        <div className="mt-24">
          {!items ? (
            <div className="product-grid">{[0, 1, 2].map(i => <SkeletonCard key={i} lines={4} />)}</div>
          ) : items.length === 0 ? (
            <EmptyState icon="bag" title="No products match these filters" text="Try removing a filter or searching for an ingredient instead." />
          ) : (
            <div className="product-grid">
              {items.map(p => <ProductCard key={p.id} product={p} matches={!!explainMatch(p, skinType, concerns)} onOpen={open} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductDetail({ id }) {
  const { navigate, showToast } = useApp();
  const { skinType, concerns } = useSkinContext();
  const [product, setProduct] = useState(undefined);
  const [alts, setAlts] = useState([]);

  useEffect(() => {
    let live = true;
    getProduct(id).then(p => {
      if (!live) return;
      setProduct(p);
      if (p) alternativesFor(p).then(a => live && setAlts(a));
    });
    return () => { live = false; };
  }, [id]);

  const reason = useMemo(() => product && explainMatch(product, skinType, concerns), [product, skinType, concerns]);

  if (product === undefined) return <SkeletonCard lines={6} />;
  if (!product) return <div className="card"><EmptyState icon="bag" title="Product not found" action={<button className="btn btn-ghost" onClick={() => navigate('products')}>Back to products</button>} /></div>;

  return (
    <div className="stack">
      <button className="btn-text row" style={{ gap: 6 }} onClick={() => navigate('products')}><Icon name="back" size={16} /> All products</button>
      <article className="card">
        <div className="pd-layout">
          <ProductVisual product={product} large />
          <div className="stack-sm">
            <div className="row wrap" style={{ gap: 8 }}>
              <span className="pill">{product.category}</span>
              {product.sponsored && <span className="pill pill-sponsored">Sponsored</span>}
              <span className="pill pill-info">Sample data</span>
            </div>
            <span className="product-brand">{product.brand}</span>
            <h1 className="h-page">{product.name}</h1>
            <div className="row" style={{ gap: 10 }}><span className="product-price" style={{ fontSize: 22 }}>{inr(product.price)}</span><span className="muted">{product.size}</span></div>
            <p className="ink2">{product.benefit}</p>
            {reason
              ? <RecommendationExplanation title="Why SkinVeda suggested it:" reason={reason} />
              : <div className="callout callout-warn"><Icon name="info" size={18} /><div>This product doesn't closely match your latest scan. It may still suit you — check the skin types below.</div></div>}
            <div className="row wrap mt-8" style={{ gap: 8 }}>
              <button className="btn btn-primary" onClick={() => showToast('Purchasing is not available in this demo. Buying is always optional.', 'info')}>
                <Icon name="external" size={16} /> View at retailer
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('my-skin/routine')}><Icon name="list" size={16} /> See where it fits in my routine</button>
            </div>
            <p className="t-help">Buying is optional. You can follow your routine with any product that contains the right ingredients.</p>
          </div>
        </div>
      </article>

      <div className="grid g-2">
        <section className="card">
          <div className="card-head"><h3>Key ingredients</h3></div>
          <ul className="rows soft">
            {product.keyIngredients.map(i => <li key={i}><span>{INGREDIENTS[i].name}</span><b style={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }} className="t-small ink2">{INGREDIENTS[i].mayHelp}</b></li>)}
          </ul>
        </section>
        <section className="card">
          <div className="card-head"><h3>Suits</h3></div>
          <ul className="rows soft">
            <li><span>Skin types</span><b>{product.skinTypes.join(', ')}</b></li>
            <li><span>Concerns</span><b>{product.concerns.map(c => CONCERNS[c].label).join(', ')}</b></li>
          </ul>
        </section>
        <section className="card">
          <div className="card-head"><h3>How to use</h3></div>
          <p className="ink2">{product.howToUse}</p>
        </section>
        <section className="card">
          <div className="card-head"><h3>Precautions</h3></div>
          <p className="ink2">{product.precautions}</p>
          <p className="t-help mt-8">Patch-test new products for 48 hours. Skincare products support your skin; they do not treat medical conditions.</p>
        </section>
      </div>

      {alts.length > 0 && (
        <section>
          <h2 className="h-section" style={{ marginBottom: 14 }}>Similar alternatives</h2>
          <div className="product-grid">{alts.map(p => <ProductCard key={p.id} product={p} onOpen={pid => navigate(`products/${pid}`)} />)}</div>
        </section>
      )}
      <SafetyNotice />
    </div>
  );
}

export default function Products() {
  const { routeParam } = useApp();
  return (
    <>
      {!routeParam && (
        <PageHeader eyebrow="Products" title="Explore products that may suit your routine"
          subtitle="Suggestions are based on your skin and explained in plain language. Purchasing is always optional." />
      )}
      {routeParam ? <ProductDetail id={routeParam} /> : <ProductList />}
    </>
  );
}
