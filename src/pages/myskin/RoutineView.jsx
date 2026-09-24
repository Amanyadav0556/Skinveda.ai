import { useApp } from '../../App';
import { Icon, Meter } from '../../components/ui';
import { RoutineStep, SafetyNotice } from '../../components/skin';
import { buildRoutine } from '../../lib/routine';
import { useRoutineLog } from '../../lib/skin';
import { CONCERNS } from '../../data/skincare';

function RoutineCard({ kind, steps, done, toggle }) {
  const count = steps.filter(s => done.includes(s.id)).length;
  return (
    <section className="card" aria-labelledby={`${kind}-h`}>
      <div className={`routine-head ${kind}`}>
        <span><Icon name={kind === 'am' ? 'sun' : 'moon'} size={20} /></span>
        <div style={{ flex: 1 }}>
          <h3 id={`${kind}-h`}>{kind === 'am' ? 'Morning routine' : 'Night routine'}</h3>
          <small>{steps.length} steps · {count} done today</small>
        </div>
      </div>
      <Meter value={(count / steps.length) * 100} thin />
      <ol className="mt-8">
        {steps.map((s, i) => <RoutineStep key={s.id} step={s} index={i} done={done.includes(s.id)} onToggle={toggle} />)}
      </ol>
    </section>
  );
}

export default function RoutineView({ skinType, concerns }) {
  const { navigate } = useApp();
  const [done, toggle] = useRoutineLog();
  const routine = buildRoutine(skinType, concerns);

  return (
    <div className="stack">
      <div className="callout callout-info">
        <Icon name="spark" size={18} />
        <div>
          <strong>Built for {skinType.toLowerCase()} skin{concerns.length ? ` with ${concerns.slice(0, 2).map(c => CONCERNS[c]?.label.toLowerCase() || c).join(' and ')}` : ''}</strong>
          Tick steps as you go — your checklist syncs across your devices.
        </div>
      </div>

      <div className="routine-cols">
        <RoutineCard kind="am" steps={routine.am} done={done} toggle={toggle} />
        <RoutineCard kind="pm" steps={routine.pm} done={done} toggle={toggle} />
      </div>

      <section className="card">
        <div className="card-head"><h3>Good to know</h3></div>
        <ul className="guide-list">
          {routine.tips.map(t => <li key={t}><span><Icon name="info" size={15} /></span><div>{t}</div></li>)}
        </ul>
      </section>

      <section className="card card-tint">
        <div className="row-between wrap">
          <div>
            <h3 className="h-card">You don't need to buy anything new</h3>
            <p className="t-small ink2 mt-8">Use what you already have if it matches the ingredient to look for. If you'd like ideas, explore products that may suit your routine.</p>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => navigate('my-skin/ingredients')}><Icon name="flask" size={16} /> Ingredients for you</button>
            <button className="btn btn-primary" onClick={() => navigate('products')}><Icon name="bag" size={16} /> Explore products</button>
          </div>
        </div>
      </section>

      <SafetyNotice />
    </div>
  );
}
