import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SHOP_ITEMS, UPGRADE_PLANS } from '../data/shop';
import { readDemo, writeDemo } from '../utils/demoStorage';
import { Button, Card, Badge, Modal } from '../components/common/ui';
import { Heading } from '../app/layout';

const Btn = Button;
const cx = (...values) => values.filter(Boolean).join(' ');

export function Rewards() {
  const { user } = useAuth();
  return (
    <>
      <Heading
        title="Rewards & earnings"
        subtitle="Illustrative mock balances; no cash payout is available."
      />
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <p className="text-ex-text-muted">Available rewards</p>
          <p className="text-3xl font-bold mt-2">₹{user.rewards || 0}</p>
        </Card>
        <Card>
          <p className="text-ex-text-muted">Season points</p>
          <p className="text-3xl font-bold mt-2">2,450 XP</p>
        </Card>
        <Card>
          <p className="text-ex-text-muted">Next milestone</p>
          <p className="text-3xl font-bold mt-2">3,000 XP</p>
        </Card>
      </div>
      <Card className="mt-5">
        <h2 className="font-bold">How to earn</h2>
        <p className="text-ex-text-secondary mt-2">
          Compete in events, complete community challenges and keep improving your rank. These
          balances are mock data.
        </p>
      </Card>
    </>
  );
}

export function Shop() {
  const { user } = useAuth();
  const [category, setCategory] = useState('all'),
    [owned, setOwned] = useState(() => {
      const data = readDemo('elixir_shop_inventory', {});
      return Array.isArray(data?.[user.id]) ? data[user.id] : [];
    }),
    [msg, setMsg] = useState('');
  const categories = ['all', ...new Set(SHOP_ITEMS.map((x) => x.category))];
  const purchase = (item) => {
    const next = [...new Set([...owned, item.id])];
    setOwned(next);
    const all = readDemo('elixir_shop_inventory', {});
    writeDemo('elixir_shop_inventory', { ...all, [user.id]: next });
    setMsg(`${item.name} added to your demo inventory.`);
  };
  return (
    <>
      <Heading
        title="ELIXIR shop"
        subtitle="Cosmetics for your player identity. Mock purchases use no payment."
      />
      <div className="flex gap-2 flex-wrap mb-5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cx(
              'btn-secondary btn-sm capitalize',
              category === c && 'border-elixir-accent',
            )}
          >
            {c}
          </button>
        ))}
      </div>
      {msg && (
        <p className="mb-4 text-green-400" role="status">
          {msg}
        </p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHOP_ITEMS.filter((x) => category === 'all' || x.category === category).map((x) => (
          <Card key={x.id}>
            <Badge>{x.rarity}</Badge>
            <div className="text-4xl my-5" aria-hidden="true">
              ✦
            </div>
            <h2 className="font-bold">{x.name}</h2>
            <p className="text-sm text-ex-text-secondary mt-2">{x.description}</p>
            <div className="flex justify-between items-center mt-5">
              <b>₹{x.price}</b>
              <Btn disabled={owned.includes(x.id)} onClick={() => purchase(x)}>
                {owned.includes(x.id) ? 'Owned' : 'Get item'}
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function Upgrade() {
  const { user, updateUser } = useAuth();
  const [plan, setPlan] = useState(
    () => user.plan || readDemo('elixir_selected_plans', {})?.[user.id] || '',
  );
  const choose = (name) => {
    setPlan(name);
    updateUser({ plan: name });
    const all = readDemo('elixir_selected_plans', {});
    writeDemo('elixir_selected_plans', { ...all, [user.id]: name });
  };
  return (
    <>
      <Heading
        title="Upgrade ELIXIR"
        subtitle="Compare plans. Upgrades are simulated and do not process payments."
      />
      <div className="grid lg:grid-cols-3 gap-4">
        {UPGRADE_PLANS.map((p) => (
          <Card key={p.id} className={p.id === 'plan-premium' ? 'border-elixir-accent' : ''}>
            <Badge tone={p.id === 'plan-organizer' ? 'warning' : 'primary'}>
              {p.badge || p.billing}
            </Badge>
            <h2 className="text-2xl font-bold mt-4">{p.name}</h2>
            <p className="text-3xl font-black mt-2">
              ₹{p.price}
              <span className="text-sm text-ex-text-muted">/{p.billing}</span>
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {p.features.map((f) => (
                <li className="flex gap-2" key={f}>
                  <Check size={16} className="text-green-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Btn className="w-full mt-7" disabled={plan === p.name} onClick={() => choose(p.name)}>
              {plan === p.name ? 'Selected' : `Choose ${p.name}`}
            </Btn>
          </Card>
        ))}
      </div>
      {plan && (
        <p role="status" className="mt-4 text-green-400">
          {plan} selected in demo. No payment was taken.
        </p>
      )}
    </>
  );
}

export function Admin() {
  const { users, banUser, unbanUser, holdUser, gameBanUser, removeGameBan, getAuditLogs } =
    useAuth();
  const [pending, setPending] = useState(null),
    [reason, setReason] = useState(''),
    [msg, setMsg] = useState('');
  const perform = () => {
    if (!reason.trim()) return setMsg('Enter a reason before confirming.');
    try {
      if (pending.kind === 'ban') banUser(pending.id, reason.trim(), 'permanent');
      if (pending.kind === 'hold') holdUser(pending.id, reason.trim());
      if (pending.kind === 'unban') unbanUser(pending.id, reason.trim());
      if (pending.kind === 'gameban') gameBanUser(pending.id, pending.game, reason.trim());
      if (pending.kind === 'removegame') removeGameBan(pending.id, pending.game, reason.trim());
      setMsg('Moderation action recorded in the audit log.');
      setPending(null);
      setReason('');
    } catch (error) {
      setMsg(error.message);
    }
  };
  return (
    <>
      <Heading
        title="Admin control room"
        subtitle="Demo moderation panel. Client-side roles are not secure authorization."
      />
      <Card className="mb-5">
        <h2 className="font-bold text-xl mb-4">User moderation</h2>
        {users.map((u) => (
          <div
            key={u.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-elixir-border"
          >
            <div>
              <b>{u.username}</b>
              <p className="text-xs text-ex-text-muted">
                {u.email} · {u.role} · {u.status}
              </p>
              {u.gameBans?.length > 0 && (
                <p className="text-xs text-amber-300 mt-1">Game bans: {u.gameBans.join(', ')}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn
                kind="secondary"
                className="btn-sm"
                onClick={() => {
                  setPending({ id: u.id, kind: 'hold' });
                  setReason('');
                }}
              >
                Hold
              </Btn>
              {u.status === 'active' ? (
                <Btn
                  kind="danger"
                  className="btn-sm"
                  onClick={() => {
                    setPending({ id: u.id, kind: 'ban' });
                    setReason('');
                  }}
                >
                  Ban
                </Btn>
              ) : (
                <Btn
                  className="btn-sm"
                  onClick={() => {
                    setPending({ id: u.id, kind: 'unban' });
                    setReason('Restore account after review');
                  }}
                >
                  Restore
                </Btn>
              )}
              {(u.gameBans || []).includes('valorant') ? (
                <Btn
                  kind="secondary"
                  className="btn-sm"
                  onClick={() => {
                    setPending({
                      id: u.id,
                      kind: 'removegame',
                      game: 'valorant',
                    });
                    setReason('Restriction reviewed');
                  }}
                >
                  Remove Valorant ban
                </Btn>
              ) : (
                <Btn
                  kind="secondary"
                  className="btn-sm"
                  onClick={() => {
                    setPending({ id: u.id, kind: 'gameban', game: 'valorant' });
                    setReason('');
                  }}
                >
                  Ban Valorant
                </Btn>
              )}
            </div>
          </div>
        ))}
      </Card>
      {msg && (
        <p role="status" className="text-elixir-accent-light mb-4">
          {msg}
        </p>
      )}
      <Card>
        <h2 className="font-bold text-xl mb-4">Audit log</h2>
        {getAuditLogs().length ? (
          getAuditLogs().map((x) => (
            <div key={x.id} className="py-3 border-b border-elixir-border text-sm">
              <b>{x.action}</b> · {x.targetUsername} ·{' '}
              {x.reason || x.banReason || x.holdReason || x.lastGameBanReason || 'No reason'}{' '}
              <span className="block text-xs text-ex-text-muted">
                {new Date(x.timestamp).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-ex-text-secondary">No moderation actions recorded.</p>
        )}
      </Card>
      <Modal
        open={Boolean(pending)}
        title="Confirm moderation action"
        onClose={() => setPending(null)}
        actions={
          <>
            <Btn kind="secondary" onClick={() => setPending(null)}>
              Cancel
            </Btn>
            <Btn kind="danger" onClick={perform}>
              Confirm
            </Btn>
          </>
        }
      >
        <p>This action changes the demo account state and adds an audit entry.</p>
        <label className="block mt-4 text-sm">
          Reason
          <input
            autoFocus
            className="input mt-1"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for this action"
            required
          />
        </label>
      </Modal>
    </>
  );
}

export function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [message, setMessage] = useState('');
  return (
    <>
      <Heading title="Account settings" subtitle="Update your local demo profile." />
      <Card>
        <form
          className="space-y-4 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            updateUser({
              fullName: String(data.get('fullName')).trim(),
              bio: String(data.get('bio')).trim(),
            });
            setMessage('Profile settings saved on this device.');
          }}
        >
          <label className="block text-sm">
            Display name
            <input
              className="input mt-1"
              name="fullName"
              defaultValue={user.fullName || ''}
              required
            />
          </label>
          <label className="block text-sm">
            Bio
            <textarea
              className="input mt-1"
              name="bio"
              maxLength="240"
              defaultValue={user.bio || ''}
            />
          </label>
          <Btn>Save settings</Btn>
          {message && (
            <p role="status" className="text-green-400">
              {message}
            </p>
          )}
        </form>
        <hr className="divider my-6" />
        <Btn kind="secondary" onClick={logout}>
          Sign out
        </Btn>
        <p className="text-xs text-ex-text-muted mt-3">
          Demo profile information is stored in this browser only.
        </p>
      </Card>
    </>
  );
}
