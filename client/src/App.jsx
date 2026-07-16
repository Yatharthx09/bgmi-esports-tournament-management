import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'

import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import CaptainLayout from './layouts/CaptainLayout'

import LandingPage from './pages/public/LandingPage'
import TournamentsListPage from './pages/public/TournamentsListPage'
import TournamentDetailsPage from './pages/public/TournamentDetailsPage'
import PublicLeaderboardPage from './pages/public/PublicLeaderboardPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import NotFoundPage from './pages/public/NotFoundPage'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminTournamentsPage from './pages/admin/AdminTournamentsPage'
import AdminTeamApprovalsPage from './pages/admin/AdminTeamApprovalsPage'
import AdminMatchesPage from './pages/admin/AdminMatchesPage'
import AdminResultsPage from './pages/admin/AdminResultsPage'
import AdminLeaderboardPage from './pages/admin/AdminLeaderboardPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

import CaptainOverviewPage from './pages/captain/CaptainOverviewPage'
import CaptainMyTeamPage from './pages/captain/CaptainMyTeamPage'
import CaptainTournamentsPage from './pages/captain/CaptainTournamentsPage'
import CaptainRegistrationsPage from './pages/captain/CaptainRegistrationsPage'
import CaptainRoomsPage from './pages/captain/CaptainRoomsPage'
import CaptainLeaderboardPage from './pages/captain/CaptainLeaderboardPage'
import CaptainProfilePage from './pages/captain/CaptainProfilePage'

export default function App() {
  return (
    <>
      <ToastProvider />
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tournaments" element={<TournamentsListPage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailsPage />} />
          <Route path="/leaderboard" element={<PublicLeaderboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="tournaments" element={<AdminTournamentsPage />} />
          <Route path="teams" element={<AdminTeamApprovalsPage />} />
          <Route path="matches" element={<AdminMatchesPage />} />
          <Route path="results" element={<AdminResultsPage />} />
          <Route path="leaderboard" element={<AdminLeaderboardPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Captain dashboard */}
        <Route
          path="/captain"
          element={
            <ProtectedRoute roles={['captain']}>
              <CaptainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CaptainOverviewPage />} />
          <Route path="team" element={<CaptainMyTeamPage />} />
          <Route path="tournaments" element={<CaptainTournamentsPage />} />
          <Route path="registrations" element={<CaptainRegistrationsPage />} />
          <Route path="rooms" element={<CaptainRoomsPage />} />
          <Route path="leaderboard" element={<CaptainLeaderboardPage />} />
          <Route path="profile" element={<CaptainProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
