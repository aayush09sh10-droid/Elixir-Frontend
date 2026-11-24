import { CLUBS } from '../clubs';
import { readDemo, readList, saveRecord, writeDemo } from '../../utils/demoStorage';

export function listClubs() {
  return readList('elixir_clubs', CLUBS).filter(
    (club) =>
      typeof club.name === 'string' &&
      Array.isArray(club.tags) &&
      Array.isArray(club.recentPosts) &&
      Number.isFinite(club.members),
  );
}

export function getClub(id) {
  return listClubs().find((club) => club.id === id);
}

export function addClub(club) {
  return saveRecord('elixir_clubs', CLUBS, club);
}

export function clubMemberships(userId) {
  const memberships = readDemo('elixir_club_memberships', {});
  const clubIds = memberships?.[userId];
  return Array.isArray(clubIds) ? clubIds : [];
}

export function toggleClubMembership(userId, clubId) {
  const memberships = readDemo('elixir_club_memberships', {});
  const currentMemberships = clubMemberships(userId);
  const nextMemberships = currentMemberships.includes(clubId)
    ? currentMemberships.filter((id) => id !== clubId)
    : [...currentMemberships, clubId];

  writeDemo('elixir_club_memberships', {
    ...memberships,
    [userId]: nextMemberships,
  });
  return nextMemberships;
}

export function clubLikes(clubId) {
  const likes = readDemo('elixir_club_likes', {});
  return likes?.[clubId] || {};
}

export function toggleClubLike(clubId, postId, userId) {
  const allLikes = readDemo('elixir_club_likes', {});
  const clubLikesByPost = allLikes?.[clubId] || {};
  const postLikes = clubLikesByPost?.[postId] || [];
  const nextLikes = postLikes.includes(userId)
    ? postLikes.filter((id) => id !== userId)
    : [...postLikes, userId];

  writeDemo('elixir_club_likes', {
    ...allLikes,
    [clubId]: { ...clubLikesByPost, [postId]: nextLikes },
  });
  return nextLikes;
}
