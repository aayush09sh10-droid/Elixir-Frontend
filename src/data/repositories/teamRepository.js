import { TEAMS } from '../teams';
import { readList, saveRecord } from '../../utils/demoStorage';

export function listTeams() {
  return readList('elixir_teams', TEAMS).filter(
    (team) => typeof team.name === 'string' && Array.isArray(team.members),
  );
}

export function getTeam(id) {
  return listTeams().find((team) => team.id === id);
}

export function addTeam(team) {
  return saveRecord('elixir_teams', TEAMS, team);
}
