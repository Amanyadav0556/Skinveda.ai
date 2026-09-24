import { useApp } from '../../App';
import { Icon } from '../../components/ui';
import { IngredientCard, SafetyNotice } from '../../components/skin';
import { ingredientPlan } from '../../lib/routine';

export default function IngredientsView({ skinType, concerns }) {
  const { navigate } = useApp();
  const { recommended, careful } = ingredientPlan(skinType, concerns);

  return (
    <div className="stack">
      <section aria-labelledby="ing-h">
        <div className="row-between wrap" style={{ marginBottom: 14 }}>
          <div>
            <h2 className="h-section" id="ing-h">Ingredients for you</h2>
            <p className="t-small ink2 mt-8">Based on your {skinType.toLowerCase()} skin and the concerns visible in your latest scan. Look for these on any label — brand doesn't matter.</p>
          </div>
        </div>
        <div className="ingredient-grid">
          {recommended.map(id => <IngredientCard key={id} id={id} skinType={skinType} />)}
        </div>
      </section>

      {careful.length > 0 && (
        <section aria-labelledby="careful-h">
          <h2 className="h-section" id="careful-h" style={{ marginBottom: 6 }}>Ingredients to use carefully</h2>
          <p className="t-small ink2" style={{ marginBottom: 14 }}>
            These can be helpful but may irritate {skinType.toLowerCase()} skin. Start slowly, patch-test first, and stop if your skin stings for more than a few minutes.
          </p>
          <div className="ingredient-grid">
            {careful.map(id => <IngredientCard key={id} id={id} skinType={skinType} careful />)}
          </div>
        </section>
      )}

      <section className="card">
        <div className="card-head"><h3>Combining ingredients</h3></div>
        <ul className="guide-list">
          <li><span><Icon name="check" size={15} /></span><div>Niacinamide, hyaluronic acid and ceramides pair well with almost everything.</div></li>
          <li><span><Icon name="alert" size={15} /></span><div>Avoid using exfoliating acids (AHA/BHA) and retinoids on the same night.</div></li>
          <li><span><Icon name="sun" size={15} /></span><div>Acids, retinoids and vitamin C make daily sunscreen even more important.</div></li>
        </ul>
        <div className="row wrap mt-24" style={{ gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => navigate('my-skin/routine')}><Icon name="list" size={16} /> See my routine</button>
          <button className="btn btn-ghost" onClick={() => navigate('products')}><Icon name="bag" size={16} /> Explore products</button>
        </div>
      </section>

      <SafetyNotice />
    </div>
  );
}
