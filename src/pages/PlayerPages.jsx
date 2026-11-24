import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowRight, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { GAMES, getGameBySlug } from '../data/games';
import { MOCK_PLAYERS } from '../data/players';
import { listTournaments } from '../data/repositories/tournamentRepository';
import { Button, Card, Badge } from '../components/common/ui';
import { Heading, NotFound } from '../app/layout';
import { TournamentGrid } from './competition/TournamentGrid';

const Btn = Button;

export function Dashboard() {
  const { user } = useAuth();
  const { selectedGame } = useGame();
  return (
    <>
      <Heading
        title={`Welcome back, ${user.username}`}
        subtitle="Your competitive home base."
        action={
          <Link className="btn-primary" to="/select-game">
            {selectedGame?.name || 'Choose a game'} <Gamepad2 size={16} />
          </Link>
        }
      />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Tournaments', user.tournaments || 0],
          ['Wins', user.wins || 0],
          ['Rewards', `₹${user.rewards || 0}`],
          ['Followers', user.followers || 0],
        ].map(([k, v]) => (
          <Card key={k}>
            <p className="text-ex-text-muted text-sm">{k}</p>
            <p className="text-3xl font-bold mt-2">{v}</p>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Open tournaments</h2>
          <TournamentGrid
            items={listTournaments()
              .filter((t) => t.status !== 'completed')
              .slice(0, 2)}
          />
        </div>
        <Card>
          <h2 className="font-bold text-xl">Quick links</h2>
          <div className="mt-4 space-y-2">
            {[
              ['My profile', `/profile/${user.username}`],
              ['Create a team', '/teams/create'],
              ['Track performance', '/track'],
              ['Browse clubs', '/clubs'],
            ].map(([t, p]) => (
              <Link key={p} className="block nav-item" to={p}>
                {t} →
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

export function GameSelect() {
  const { selectGame, selectedGame } = useGame();
  return (
    <>
      <Heading
        title="Select your game"
        subtitle="Choose a title to personalize your ELIXIR experience."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((g) => (
          <Card key={g.slug} className="cursor-pointer hover:border-elixir-accent">
            <button className="w-full text-left" onClick={() => selectGame(g.slug)}>
              <div className="text-4xl">{g.icon}</div>
              <h2 className="mt-4 text-xl font-bold">{g.name}</h2>
              <p className="text-sm text-ex-text-secondary mt-1">
                {g.genre} · {g.developer}
              </p>
              <span className="mt-4 inline-flex text-elixir-accent-light">
                {selectedGame?.slug === g.slug ? 'Selected ✓' : 'Select game →'}
              </span>
            </button>
            <Link className="text-xs text-ex-text-muted mt-3 inline-block" to={`/games/${g.slug}`}>
              Open game hub
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}

export function GameHub() {
  const { slug } = useParams();
  const g = getGameBySlug(slug);
  const { user, updateUser } = useAuth();
  const ts = listTournaments().filter((t) => t.gameSlug === slug);
  const [msg, setMsg] = useState('');
  const location = useLocation();
  if (!g) return <NotFound />;
  const connect = () => {
    if (!user) return;
    const list = user.connectedGames || [];
    updateUser({
      connectedGames: list.includes(slug) ? list.filter((x) => x !== slug) : [...list, slug],
    });
    setMsg(
      list.includes(slug)
        ? 'Game account disconnected.'
        : 'Demo account connected. No external game service was contacted.',
    );
  };
  return (
    <>
      <div
        className="rounded-2xl p-8 md:p-12 border border-elixir-border"
        style={{
          background: `linear-gradient(120deg, ${g.gradientFrom}44, #0D0B12 75%)`,
        }}
      >
        <Badge>{g.genre}</Badge>
        <h1 className="text-4xl md:text-6xl font-black mt-4">
          {g.icon} {g.name}
        </h1>
        <p className="mt-4 max-w-2xl text-ex-text-secondary">{g.description}</p>
        <p className="mt-2 text-sm">
          {g.players} players · {g.tournaments} tournaments
        </p>
        {user ? (
          <Btn className="mt-6" onClick={connect}>
            {user.connectedGames?.includes(slug)
              ? 'Disconnect demo account'
              : 'Connect game account'}
          </Btn>
        ) : (
          <Link className="btn-secondary mt-6 inline-flex" to="/login" state={{ from: location }}>
            Sign in to connect a game
          </Link>
        )}
        {msg && (
          <p role="status" className="mt-3 text-sm text-elixir-accent-light">
            {msg}
          </p>
        )}
      </div>
      <div className="mt-8">
        <Heading title="Tournaments" subtitle={`Compete in ${g.name} events.`} />
        <TournamentGrid items={ts} />
      </div>
    </>
  );
}

export function Profile() {
  const { username } = useParams();
  const { user, users } = useAuth();
  const name = username || user.username;
  const player = users.find((u) => u.username.toLowerCase() === name.toLowerCase());
  const rank = MOCK_PLAYERS.find((p) => p.username.toLowerCase() === name.toLowerCase());
  return (
    <>
      <Heading
        title={name}
        subtitle={player?.bio || 'ELIXIR player profile'}
        action={<Badge>{player?.role || 'player'}</Badge>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Rank points', rank?.points || '—'],
          ['Wins', player?.wins || rank?.wins || 0],
          ['Tournaments', player?.tournaments || 0],
          ['Followers', player?.followers || 0],
        ].map(([k, v]) => (
          <Card key={k}>
            <p className="text-sm text-ex-text-muted">{k}</p>
            <p className="text-3xl font-bold mt-2">{v}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-5">
        <h2 className="font-bold text-xl">Recent activity</h2>
        <p className="text-ex-text-secondary mt-3">
          Competitive activity and stats shown here are mock data.
        </p>
      </Card>
    </>
  );
}

export function Leaderboard() {
  const [game, setGame] = useState('all');
  const list = MOCK_PLAYERS.filter((p) => game === 'all' || p.games === game).sort(
    (a, b) => b.points - a.points,
  );
  return (
    <>
      <Heading title="Leaderboard" subtitle="Mock competitive rankings." />
      <select
        className="input max-w-sm mb-5"
        value={game}
        onChange={(e) => setGame(e.target.value)}
      >
        <option value="all">All games</option>
        {GAMES.map((g) => (
          <option key={g.slug} value={g.slug}>
            {g.name}
          </option>
        ))}
      </select>
      <Card>
        <div className="grid grid-cols-4 text-xs uppercase text-ex-text-muted border-b border-elixir-border pb-3">
          <span>Rank · player</span>
          <span>Game</span>
          <span>Wins</span>
          <span>Points</span>
        </div>
        {list.map((p, i) => (
          <div key={p.id} className="grid grid-cols-4 py-4 border-b border-elixir-border/60">
            <span>
              <b className="text-elixir-accent-light mr-3">#{i + 1}</b>
              <Link to={`/profile/${p.username}`}>{p.username}</Link>
            </span>
            <span>{p.games}</span>
            <span>{p.wins}</span>
            <b>{p.points.toLocaleString()}</b>
          </div>
        ))}
      </Card>
    </>
  );
}

export function Track() {
  return (
    <>
      <Heading
        title="Performance tracking"
        subtitle="A readable view of your recent mock match history."
      />
      <div className="grid md:grid-cols-3 gap-4">
        {[
          ['Win rate', '68%'],
          ['Matches this month', '24'],
          ['Average rating', '1.42'],
        ].map(([l, v]) => (
          <Card key={l}>
            <p className="text-ex-text-secondary">{l}</p>
            <p className="text-3xl font-bold mt-3">{v}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-5">
        <h2 className="font-bold">Weekly performance · mock data</h2>
        <div className="h-48 mt-6 flex items-end gap-3">
          {[42, 61, 55, 78, 66, 90, 73].map((n, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-elixir-secondary to-elixir-accent-light"
              style={{ height: `${n}%` }}
              title={`${n}%`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-ex-text-muted mt-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </Card>
    </>
  );
}
