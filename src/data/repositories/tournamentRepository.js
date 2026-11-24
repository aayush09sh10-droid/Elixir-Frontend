import { TOURNAMENTS } from '../tournaments';
import { readDemo, readList, saveRecord, writeDemo } from '../../utils/demoStorage';

export function listTournaments() {
  return readList('elixir_tournaments', TOURNAMENTS).filter(
    (tournament) =>
      typeof tournament.name === 'string' &&
      typeof tournament.gameSlug === 'string' &&
      Number.isFinite(tournament.maxParticipants) &&
      Number.isFinite(tournament.currentParticipants),
  );
}

export function getTournament(id) {
  return listTournaments().find((tournament) => tournament.id === id);
}

export function addTournament(tournament) {
  return saveRecord('elixir_tournaments', TOURNAMENTS, tournament);
}

export function updateTournament(id, updates) {
  const tournament = getTournament(id);
  if (!tournament) return null;

  return saveRecord('elixir_tournaments', TOURNAMENTS, { ...tournament, ...updates });
}

export function listTournamentRegistrations(tournamentId) {
  const registrations = readDemo('elixir_tournament_registrations', {});
  const entries = registrations?.[tournamentId];
  return Array.isArray(entries) ? entries : [];
}

export function registerForTournament(tournamentId, user) {
  const registrations = readDemo('elixir_tournament_registrations', {});
  const entries = listTournamentRegistrations(tournamentId);

  if (entries.some((entry) => entry.userId === user.id)) {
    return { ok: false, reason: 'already-registered' };
  }

  const tournament = getTournament(tournamentId);
  if (!tournament) return { ok: false, reason: 'missing' };

  const registrationClosed =
    tournament.status !== 'upcoming' ||
    tournament.currentParticipants >= tournament.maxParticipants;
  if (registrationClosed) return { ok: false, reason: 'closed' };

  const userRestricted = user.status !== 'active' || user.gameBans?.includes(tournament.gameSlug);
  if (userRestricted) return { ok: false, reason: 'restricted' };

  writeDemo('elixir_tournament_registrations', {
    ...registrations,
    [tournamentId]: [
      ...entries,
      {
        userId: user.id,
        username: user.username,
        registeredAt: new Date().toISOString(),
      },
    ],
  });

  updateTournament(tournamentId, {
    currentParticipants: tournament.currentParticipants + 1,
  });

  return { ok: true };
}

export function getBracket(tournamentId) {
  const brackets = readDemo('elixir_brackets', {});
  const bracket = brackets?.[tournamentId];
  return bracket && Array.isArray(bracket.matches) ? bracket : { matches: [] };
}

export function setBracketWinner(tournamentId, matchId, winner, initialMatches = []) {
  const brackets = readDemo('elixir_brackets', {});
  const bracket = getBracket(tournamentId);
  const matches = bracket.matches.length ? bracket.matches : initialMatches;
  const updatedMatches = matches.map((match) =>
    match.id === matchId ? { ...match, winner } : match,
  );
  const updatedBracket = { ...bracket, matches: updatedMatches };

  writeDemo('elixir_brackets', { ...brackets, [tournamentId]: updatedBracket });
  return updatedBracket;
}
