import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Badge, Card } from '../../components/common/ui';

export function TournamentGrid({ items }) {
  if (!items.length) return <Card>No tournaments match those filters.</Card>;
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((t) => (
        <Card key={t.id}>
          <div className="flex justify-between gap-2">
            <Badge tone={t.status === 'live' ? 'success' : 'primary'}>{t.status}</Badge>
            <span className="text-sm text-ex-text-muted">{t.gameSlug}</span>
          </div>
          <h3 className="font-bold text-lg mt-4">{t.name}</h3>
          <p className="text-sm text-ex-text-secondary mt-2 line-clamp-2">{t.description}</p>
          <div className="flex justify-between mt-5 text-sm">
            <span>Prize pool</span>
            <b>{t.prizePool}</b>
          </div>
          <div className="flex justify-between mt-1 text-sm text-ex-text-secondary">
            <span>{t.format}</span>
            <span>
              {t.currentParticipants}/{t.maxParticipants}
            </span>
          </div>
          <Link className="btn-secondary w-full mt-5 justify-center" to={`/tournaments/${t.id}`}>
            View tournament <ArrowRight size={15} />
          </Link>
        </Card>
      ))}
    </div>
  );
}
