import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GAMES } from '../data/games';
import {
  addTournament,
  getTournament,
  listTournaments,
  registerForTournament,
  listTournamentRegistrations,
  getBracket,
  setBracketWinner,
} from '../data/repositories/tournamentRepository';
import { listTeams, getTeam, addTeam } from '../data/repositories/teamRepository';
import { Button, Card, Badge } from '../components/common/ui';
import { Heading, NotFound } from '../app/layout';
import { TournamentGrid } from './competition/TournamentGrid';

const Btn = Button;

export function Tournaments() {
  const [game, setGame] = useState('all'),
    [status, setStatus] = useState('all'),
    [q, setQ] = useState('');
  let list = listTournaments().filter(
    (t) =>
      (game === 'all' || t.gameSlug === game) &&
      (status === 'all' || t.status === status) &&
      t.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <Heading
        title="Tournament discovery"
        subtitle="Find your next match."
        action={
          <Link className="btn-primary" to="/tournaments/create">
            Create tournament
          </Link>
        }
      />
      <div className="card mb-5 grid sm:grid-cols-3 gap-3">
        <label className="relative">
          <Search size={16} className="absolute left-3 top-3 text-ex-text-muted" />
          <input
            className="input pl-9"
            placeholder="Search tournaments"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <select className="input" value={game} onChange={(e) => setGame(e.target.value)}>
          <option value="all">All games</option>
          {GAMES.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Any status</option>
          {['upcoming', 'live', 'completed'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <TournamentGrid items={list} />
    </>
  );
}

export function TournamentDetail() {
  const { id } = useParams(),
    { user } = useAuth(),
    location = useLocation();
  const t = getTournament(id);
  const [joined, setJoined] = useState(() =>
    Boolean(user && listTournamentRegistrations(id).some((row) => row.userId === user.id)),
  );
  const [count, setCount] = useState(t?.currentParticipants || 0),
    [message, setMessage] = useState('');
  useEffect(() => {
    setJoined(
      Boolean(user && listTournamentRegistrations(id).some((row) => row.userId === user.id)),
    );
  }, [id, user?.id]);
  if (!t) return <NotFound />;
  const restricted = Boolean(
    user && (user.status !== 'active' || user.gameBans?.includes(t.gameSlug)),
  );
  const register = () => {
    if (!user) return;
    const result = registerForTournament(id, user);
    if (result.ok) {
      setJoined(true);
      setCount((value) => value + 1);
      setMessage('Registration saved on this device.');
    } else
      setMessage(
        result.reason === 'already-registered'
          ? 'You are already registered.'
          : result.reason === 'restricted'
            ? 'Your account cannot enter this tournament.'
            : 'Registration is closed or full.',
      );
  };
  return (
    <>
      <Heading title={t.name} subtitle={t.description} />
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <div className="flex gap-2">
            <Badge tone={t.status === 'live' ? 'success' : 'primary'}>{t.status}</Badge>
            <Badge tone="muted">{t.format}</Badge>
          </div>
          <p className="mt-6 text-ex-text-secondary">{t.rules}</p>
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {[
              ['Game', t.gameSlug],
              ['Prize pool', t.prizePool],
              ['Starts', t.startDate],
              ['Registration closes', t.registrationDeadline],
              ['Region', t.region],
              ['Entry', t.entryFee],
            ].map(([k, v]) => (
              <div key={k} className="p-3 rounded bg-white/5">
                <p className="text-xs text-ex-text-muted">{k}</p>
                <p className="font-semibold mt-1">{v}</p>
              </div>
            ))}
          </div>
          <Link className="btn-secondary mt-6 inline-flex" to={`/tournaments/${id}/bracket`}>
            View bracket / standings
          </Link>
        </Card>
        <Card>
          <h2 className="font-bold text-xl">Registration</h2>
          <p className="mt-2 text-ex-text-secondary">
            {count} of {t.maxParticipants} slots filled
          </p>
          <div className="mt-3 h-2 bg-white/10 rounded">
            <div
              className="h-2 rounded bg-elixir-accent"
              style={{
                width: `${Math.min(100, (count / t.maxParticipants) * 100)}%`,
              }}
            />
          </div>
          {user ? (
            <Btn
              className="w-full mt-6"
              disabled={
                joined || t.status !== 'upcoming' || count >= t.maxParticipants || restricted
              }
              onClick={register}
            >
              {joined ? 'Registered' : restricted ? 'Unavailable' : 'Register (demo)'}
            </Btn>
          ) : (
            <Link
              className="btn-primary w-full mt-6 justify-center"
              to="/login"
              state={{ from: location }}
            >
              Sign in to register
            </Link>
          )}
          <p role="status" className="text-xs text-ex-text-muted mt-3">
            {message ||
              (!user
                ? 'Sign in is required to register.'
                : restricted
                  ? 'Your account is restricted from entering this game tournament.'
                  : '')}
          </p>
        </Card>
      </div>
    </>
  );
}

export function CreateTournament() {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const row = {
      id: `t-${Date.now()}`,
      name: d.get('name'),
      gameSlug: d.get('game'),
      game: d.get('game'),
      description: d.get('description'),
      status: 'upcoming',
      featured: false,
      format: d.get('format'),
      prizePool: 'Mock prize',
      maxParticipants: +d.get('slots'),
      currentParticipants: 0,
      startDate: d.get('date'),
      registrationDeadline: d.get('date'),
      endDate: d.get('date'),
      region: 'Global',
      entryFee: 'Free',
      rules: 'Organizer provided rules will be announced before the event.',
      organizer: user.username,
      organizerId: user.id,
    };
    addTournament(row);
    setDone(true);
  };
  return (
    <>
      <Heading
        title="Create tournament"
        subtitle="Organizer tools · all data is stored in this browser session."
      />
      <Card>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          {[
            ['name', 'Tournament name'],
            ['description', 'Description'],
            ['slots', 'Team / player slots'],
            ['date', 'Start date'],
          ].map(([n, l]) => (
            <label key={n} className="text-sm">
              {l}
              <input
                name={n}
                className="input mt-1"
                required
                type={n === 'slots' ? 'number' : n === 'date' ? 'date' : 'text'}
                min={n === 'slots' ? 2 : undefined}
              />
            </label>
          ))}
          <label className="text-sm">
            Game
            <select className="input mt-1" name="game">
              {GAMES.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Format
            <select className="input mt-1" name="format">
              {['Single Elimination', 'Double Elimination', 'Round Robin', 'Group Stage'].map(
                (f) => (
                  <option key={f}>{f}</option>
                ),
              )}
            </select>
          </label>
          <Btn className="sm:col-span-2">Publish tournament</Btn>
          {done && (
            <p role="status" className="sm:col-span-2 text-green-400">
              Tournament added to discovery.
            </p>
          )}
        </form>
        <p className="text-xs text-ex-text-muted mt-4">
          Organizer: {user.username}. Mock creation only.
        </p>
      </Card>
    </>
  );
}

export function Bracket() {
  const { id } = useParams(),
    { isOrganizer } = useAuth();
  const t = getTournament(id);
  const [bracket, setBracket] = useState(() => getBracket(id));
  if (!t) return <NotFound />;
  const teams = listTeams().filter((team) => team.gameSlug === t.gameSlug);
  const registrations = listTournamentRegistrations(id);
  let matches = bracket.matches;
  if (!matches.length) {
    const entries = registrations.map((row) => row.username);
    const candidates = entries.length ? entries : teams.map((team) => team.name);
    matches =
      candidates.length >= 2
        ? [
            {
              id: 'match-final',
              round: 'Final',
              teamA: candidates[0],
              teamB: candidates[1],
              winner: null,
            },
          ]
        : [];
  }
  const choose = (matchId, winner) => setBracket(setBracketWinner(id, matchId, winner, matches));
  return (
    <>
      <Heading title={`${t.name} · Bracket`} subtitle={`${t.format} · persisted demo standings`} />
      {matches.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <Badge>{match.round}</Badge>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span>{match.teamA}</span>
                <span>VS</span>
                <span>{match.teamB}</span>
              </div>
              {match.winner && <p className="mt-4 text-green-400">Winner: {match.winner}</p>}
              {isOrganizer && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Btn
                    kind="secondary"
                    className="btn-sm"
                    onClick={() => choose(match.id, match.teamA)}
                  >
                    Select {match.teamA}
                  </Btn>
                  <Btn
                    kind="secondary"
                    className="btn-sm"
                    onClick={() => choose(match.id, match.teamB)}
                  >
                    Select {match.teamB}
                  </Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-ex-text-secondary">
            The bracket will appear after players or teams register.
          </p>
          <p className="text-sm text-ex-text-muted mt-2">
            Current registrations: {registrations.length}
          </p>
        </Card>
      )}
    </>
  );
}

export function CreateTeam() {
  const { user } = useAuth();
  const [created, setCreated] = useState(null);
  return (
    <>
      <Heading title="Create a team" subtitle="Bring your squad together." />
      <Card>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const d = Object.fromEntries(new FormData(e.currentTarget));
            const team = {
              id: `team-${Date.now()}`,
              name: d.name,
              tag: d.tag,
              gameSlug: d.game,
              game: d.game,
              captain: user.username,
              members: [{ username: user.username, role: 'Captain' }],
              description: d.description,
              matches: 0,
              wins: 0,
              losses: 0,
              winRate: 0,
              recruiting: true,
            };
            addTeam(team);
            setCreated(team.id);
          }}
        >
          <label className="block text-sm">
            Team name
            <input name="name" className="input mt-1" required />
          </label>
          <label className="block text-sm">
            Tag
            <input name="tag" className="input mt-1" maxLength="5" required />
          </label>
          <label className="block text-sm">
            Game
            <select name="game" className="input mt-1">
              {GAMES.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            About
            <input name="description" className="input mt-1" required />
          </label>
          <Btn>Create team</Btn>
          {created && (
            <p role="status" className="text-green-400">
              Team created. <Link to={`/teams/${created}`}>View team</Link>
            </p>
          )}
        </form>
      </Card>
    </>
  );
}

export function Teams() {
  return (
    <>
      <Heading
        title="Teams"
        action={
          <Link className="btn-primary" to="/teams/create">
            Create team
          </Link>
        }
      />
      <div className="grid md:grid-cols-2 gap-4">
        {listTeams().map((t) => (
          <Card key={t.id}>
            <Badge>{t.gameSlug}</Badge>
            <h2 className="font-bold text-xl mt-3">
              {t.name} <span className="text-ex-text-muted">[{t.tag}]</span>
            </h2>
            <p className="text-ex-text-secondary mt-2">{t.description}</p>
            <p className="mt-4 text-sm">
              {t.members.length} members · {t.wins} wins · {t.winRate}% win rate
            </p>
            <Link className="btn-secondary mt-4 inline-flex" to={`/teams/${t.id}`}>
              Team profile
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}

export function TeamDetail() {
  const { id } = useParams();
  const t = getTeam(id);
  if (!t) return <NotFound />;
  return (
    <>
      <Heading title={t.name} subtitle={t.description} />
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <b>{t.wins}</b>
          <p className="text-ex-text-muted">Wins</p>
        </Card>
        <Card>
          <b>{t.matches}</b>
          <p className="text-ex-text-muted">Matches</p>
        </Card>
        <Card>
          <b>{t.winRate}%</b>
          <p className="text-ex-text-muted">Win rate</p>
        </Card>
      </div>
      <Card className="mt-5">
        <h2 className="font-bold text-xl mb-4">Roster</h2>
        {t.members.map((m) => (
          <div key={m.username} className="flex justify-between py-3 border-b border-elixir-border">
            <Link to={`/profile/${m.username}`} className="text-elixir-accent-light">
              {m.username}
            </Link>
            <span>
              {m.role} · {m.position}
            </span>
          </div>
        ))}
      </Card>
    </>
  );
}
