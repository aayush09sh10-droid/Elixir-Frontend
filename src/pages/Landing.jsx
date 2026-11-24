import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Trophy, Users } from 'lucide-react';
import { GAMES } from '../data/games';
import { listTournaments } from '../data/repositories/tournamentRepository';
import heroArt from '../assets/hero.png';
import { Badge, Card } from '../components/common/ui';
import { Shell } from '../app/layout';
import { TournamentGrid } from './competition/TournamentGrid';

export function Landing() {
  return (
    <Shell>
      <section className="relative overflow-hidden rounded-3xl border border-elixir-border bg-hero-gradient px-6 py-16 md:px-14 md:py-24">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroArt})` }}
        />
        <div className="relative max-w-3xl">
          <Badge>THE GAMING ECOSYSTEM</Badge>
          <h1 className="mt-5 text-5xl md:text-7xl font-black leading-tight">
            PLAY.
            <br />
            <span className="gradient-text">EVOLVE. EARN.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ex-text-secondary">
            Your next tournament, squad and community starts here. Compete across your favorite
            games and make every match count.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary btn-lg" to="/register">
              Join ELIXIR <ArrowRight size={18} />
            </Link>
            <Link className="btn-secondary btn-lg" to="/tournaments">
              Explore tournaments
            </Link>
          </div>
          <p className="mt-4 text-xs text-ex-text-muted">
            Free to join · Demo experience · No real payments or game account connections
          </p>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-4 mt-8">
        {[
          [Trophy, 'Compete', 'Find tournaments built for every rank and region.'],
          [Users, 'Connect', 'Build teams and join game-focused communities.'],
          [BarChart3, 'Improve', 'Track your progress with clear performance insights.'],
        ].map(([I, t, d]) => (
          <Card key={t}>
            <I className="text-elixir-accent-light" />
            <h2 className="mt-4 text-xl font-bold">{t}</h2>
            <p className="mt-2 text-ex-text-secondary">{d}</p>
          </Card>
        ))}
      </section>
      <section className="mt-14">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="section-heading">Choose your arena</h2>
            <p className="section-subheading">Six games. One competitive home.</p>
          </div>
          <Link to="/select-game" className="text-elixir-accent-light">
            All games →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((g) => (
            <Link
              to={`/games/${g.slug}`}
              className="card-hover p-5 rounded-xl border border-elixir-border bg-card-gradient"
              key={g.slug}
            >
              <div className="text-3xl">{g.icon}</div>
              <h3 className="mt-3 font-bold text-lg">{g.name}</h3>
              <p className="text-sm text-ex-text-secondary">
                {g.genre} · {g.players} players
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-14">
        <div className="flex justify-between items-center mb-5">
          <h2 className="section-heading">Featured tournaments</h2>
          <Link to="/tournaments" className="text-elixir-accent-light">
            View all →
          </Link>
        </div>
        <TournamentGrid
          items={listTournaments()
            .filter((t) => t.featured)
            .slice(0, 3)}
        />
      </section>
      <section className="mt-14 grid md:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-2xl font-bold">Find your people</h2>
          <p className="mt-2 text-ex-text-secondary">
            Meet players, share strategies and grow with your community.
          </p>
          <Link className="btn-secondary mt-5 inline-flex" to="/clubs">
            Explore clubs
          </Link>
        </Card>
        <Card>
          <h2 className="text-2xl font-bold">Every match moves you forward</h2>
          <p className="mt-2 text-ex-text-secondary">
            Celebrate achievements and turn progress into rewards.
          </p>
          <Link className="btn-secondary mt-5 inline-flex" to="/rewards">
            See rewards
          </Link>
        </Card>
      </section>
      <section id="how-it-works" className="mt-14">
        <h2 className="section-heading">How ELIXIR works</h2>
        <p className="section-subheading">
          Choose your game, find a squad, then compete and improve.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-5">
          {[
            ['01', 'Choose a game'],
            ['02', 'Join a team or tournament'],
            ['03', 'Track your growth'],
          ].map(([n, label]) => (
            <Card key={n}>
              <span className="gradient-text text-3xl font-black">{n}</span>
              <h3 className="font-bold mt-3">{label}</h3>
            </Card>
          ))}
        </div>
      </section>
      <section id="achievements" className="mt-14">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Make every match count</h2>
              <p className="text-ex-text-secondary mt-2">
                Achievements and reward balances are demo data designed to showcase your progress.
              </p>
            </div>
            <Link className="btn-secondary" to="/rewards">
              Explore rewards
            </Link>
          </div>
        </Card>
      </section>
      <section id="about" className="mt-14 scroll-mt-24">
        <Card>
          <h2 className="text-2xl font-bold">About ELIXIR</h2>
          <p className="text-ex-text-secondary mt-3">
            ELIXIR brings tournament discovery, team building, player profiles and gaming
            communities into one competitive home. The app currently uses simulated data; no game
            APIs, OAuth providers or payments are connected.
          </p>
        </Card>
      </section>
      <section className="mt-14">
        <h2 className="section-heading">Frequently asked questions</h2>
        <div className="mt-5 space-y-3">
          {[
            ['Is ELIXIR free to use?', 'The demo is free to explore.'],
            ['Are game accounts connected?', 'No, game connections are simulated locally.'],
            ['Do shop items cost real money?', 'No. Shop actions only add demo inventory.'],
            ['Are tournament prizes paid out?', 'No. Prize pools are illustrative mock data.'],
          ].map(([question, answer]) => (
            <details key={question} className="card group">
              <summary className="cursor-pointer font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-elixir-accent">
                {question}
              </summary>
              <p className="text-ex-text-secondary mt-3">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </Shell>
  );
}
