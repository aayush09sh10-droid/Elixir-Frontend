import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GAMES } from '../data/games';
import {
  addClub,
  listClubs,
  getClub,
  clubMemberships,
  toggleClubMembership,
  clubLikes,
  toggleClubLike,
} from '../data/repositories/clubRepository';
import { Button, Card, Badge } from '../components/common/ui';
import { Heading } from '../app/layout';

const Btn = Button;

export function Clubs() {
  const [q, setQ] = useState('');
  return (
    <>
      <Heading
        title="Clubs"
        subtitle="Communities organized around the games you love."
        action={
          <Link className="btn-primary" to="/clubs/create">
            Create a club
          </Link>
        }
      />
      <input
        className="input mb-5 max-w-md"
        placeholder="Search clubs"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="grid md:grid-cols-2 gap-4">
        {listClubs()
          .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
          .map((c) => (
            <Card key={c.id}>
              <Badge>{c.game}</Badge>
              <h2 className="text-xl font-bold mt-3">{c.name}</h2>
              <p className="text-ex-text-secondary mt-2">{c.description}</p>
              <p className="mt-4 text-sm">
                {c.members.toLocaleString()} members · {c.posts} posts
              </p>
              <Link className="btn-secondary mt-4 inline-flex" to={`/clubs/${c.id}`}>
                Visit club
              </Link>
            </Card>
          ))}
      </div>
    </>
  );
}

export function ClubDetail() {
  const { id } = useParams(),
    { user } = useAuth(),
    location = useLocation();
  const c = getClub(id);
  const [joined, setJoined] = useState(() =>
    Boolean(user && clubMemberships(user.id).includes(id)),
  );
  const [likes, setLikes] = useState(() => clubLikes(id));
  useEffect(
    () => setJoined(Boolean(user && clubMemberships(user.id).includes(id))),
    [id, user?.id],
  );
  if (!c) return <NotFound />;
  const join = () => {
    if (!user) return;
    const next = toggleClubMembership(user.id, id);
    setJoined(next.includes(id));
  };
  const like = (postId) => {
    if (!user) return;
    const next = toggleClubLike(id, postId, user.id);
    setLikes({ ...likes, [postId]: next });
  };
  return (
    <>
      <Heading
        title={c.name}
        subtitle={c.description}
        action={
          user ? (
            <Btn onClick={join}>{joined ? 'Leave club' : 'Join club'}</Btn>
          ) : (
            <Link className="btn-primary" to="/login" state={{ from: location }}>
              Sign in to join
            </Link>
          )
        }
      />
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <h2 className="font-bold text-xl mb-4">Community feed</h2>
          {c.recentPosts.length ? (
            c.recentPosts.map((p) => {
              const postLikes = likes[p.id] || [];
              return (
                <article key={p.id} className="py-4 border-b border-elixir-border">
                  <div className="flex justify-between">
                    <b>{p.author}</b>
                    <span className="text-xs text-ex-text-muted">{p.timestamp}</span>
                  </div>
                  <p className="mt-2 text-ex-text-secondary">{p.content}</p>
                  {user ? (
                    <button
                      aria-pressed={postLikes.includes(user.id)}
                      className="mt-2 text-sm text-elixir-accent-light"
                      onClick={() => like(p.id)}
                    >
                      Like · {p.likes + postLikes.length}
                    </button>
                  ) : (
                    <Link
                      className="mt-2 inline-block text-sm text-elixir-accent-light"
                      to="/login"
                      state={{ from: location }}
                    >
                      Sign in to like · {p.likes + postLikes.length}
                    </Link>
                  )}
                </article>
              );
            })
          ) : (
            <p className="text-ex-text-secondary">
              No posts yet. Start the conversation after joining.
            </p>
          )}
        </Card>
        <Card>
          <h2 className="font-bold">About this club</h2>
          <p className="mt-3 text-ex-text-secondary">{c.members.toLocaleString()} members</p>
          <p className="mt-1 text-ex-text-secondary">Founded by {c.founder}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {c.tags.map((t) => (
              <Badge key={t} tone="muted">
                {t}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

export function CreateClub() {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  return (
    <>
      <Heading title="Create a club" />
      <Card>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const d = Object.fromEntries(new FormData(e.currentTarget));
            addClub({
              id: `club-${Date.now()}`,
              name: d.name,
              slug: d.name.toLowerCase().replaceAll(' ', '-'),
              game: d.game,
              description: d.description,
              members: 1,
              posts: 0,
              founder: user.username,
              isPublic: true,
              tags: [d.game],
              recentPosts: [],
            });
            setDone(true);
          }}
        >
          <label className="block text-sm">
            Name
            <input className="input mt-1" name="name" required />
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
            Description
            <textarea className="input mt-1" name="description" required />
          </label>
          <Btn>Create club</Btn>
          {done && (
            <p role="status" className="text-green-400">
              Club created and available in discovery.
            </p>
          )}
        </form>
      </Card>
    </>
  );
}
