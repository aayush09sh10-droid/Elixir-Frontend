import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { Gate, NotFound, Shell } from './app/layout';
import { Landing } from './pages/Landing';
import { Login, Register } from './pages/AuthPages';
import { Dashboard, GameHub, GameSelect, Leaderboard, Profile, Track } from './pages/PlayerPages';
import {
  Bracket,
  CreateTeam,
  CreateTournament,
  TeamDetail,
  Teams,
  TournamentDetail,
  Tournaments,
} from './pages/CompetitionPages';
import { ClubDetail, Clubs, CreateClub } from './pages/CommunityPages';
import { Admin, Rewards, Settings, Shop, Upgrade } from './pages/AccountPages';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <Gate>
            <Dashboard />
          </Gate>
        }
      />
      <Route path="/league" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/select-game"
        element={
          <Shell>
            <GameSelect />
          </Shell>
        }
      />
      <Route path="/games" element={<Navigate to="/select-game" replace />} />
      <Route
        path="/games/:slug"
        element={
          <Shell>
            <GameHub />
          </Shell>
        }
      />
      <Route
        path="/tournaments"
        element={
          <Shell>
            <Tournaments />
          </Shell>
        }
      />
      <Route
        path="/tournaments/create"
        element={
          <Gate roles={['organizer', 'admin']}>
            <CreateTournament />
          </Gate>
        }
      />
      <Route
        path="/tournaments/:id/bracket"
        element={
          <Shell>
            <Bracket />
          </Shell>
        }
      />
      <Route
        path="/tournaments/:id"
        element={
          <Shell>
            <TournamentDetail />
          </Shell>
        }
      />
      <Route
        path="/teams"
        element={
          <Shell>
            <Teams />
          </Shell>
        }
      />
      <Route
        path="/teams/create"
        element={
          <Gate>
            <CreateTeam />
          </Gate>
        }
      />
      <Route
        path="/teams/:id"
        element={
          <Shell>
            <TeamDetail />
          </Shell>
        }
      />
      <Route
        path="/profile"
        element={
          user ? (
            <Navigate to={'/profile/' + user.username} replace />
          ) : (
            <Navigate to="/login" state={{ from: { pathname: '/profile' } }} replace />
          )
        }
      />
      <Route
        path="/profile/:username"
        element={
          <Gate>
            <Profile />
          </Gate>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <Gate>
            <Leaderboard />
          </Gate>
        }
      />
      <Route
        path="/track"
        element={
          <Gate>
            <Track />
          </Gate>
        }
      />
      <Route
        path="/clubs"
        element={
          <Shell>
            <Clubs />
          </Shell>
        }
      />
      <Route
        path="/clubs/create"
        element={
          <Gate>
            <CreateClub />
          </Gate>
        }
      />
      <Route
        path="/clubs/:id"
        element={
          <Shell>
            <ClubDetail />
          </Shell>
        }
      />
      <Route
        path="/rewards"
        element={
          <Gate>
            <Rewards />
          </Gate>
        }
      />
      <Route
        path="/shop"
        element={
          <Gate>
            <Shop />
          </Gate>
        }
      />
      <Route
        path="/upgrade"
        element={
          <Gate>
            <Upgrade />
          </Gate>
        }
      />
      <Route
        path="/settings"
        element={
          <Gate>
            <Settings />
          </Gate>
        }
      />
      <Route
        path="/admin"
        element={
          <Gate roles={['admin']}>
            <Admin />
          </Gate>
        }
      />
      <Route
        path="*"
        element={
          <Shell>
            <NotFound />
          </Shell>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <AppRoutes />
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
