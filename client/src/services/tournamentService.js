import api from './api'

export const tournamentService = {
  list: (params) => api.get('/tournaments', { params }).then((r) => r.data),
  get: (id) => api.get(`/tournaments/${id}`).then((r) => r.data),
  create: (payload) => api.post('/tournaments', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/tournaments/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/tournaments/${id}`).then((r) => r.data),
}

export const registrationService = {
  list: (params) => api.get('/registrations', { params }).then((r) => r.data),
  register: (payload) => api.post('/registrations', payload).then((r) => r.data),
  decide: (id, status) => api.patch(`/registrations/${id}/decision`, { status }).then((r) => r.data),
  cancel: (id) => api.delete(`/registrations/${id}`).then((r) => r.data),
}

export const matchService = {
  listByTournament: (tournamentId) => api.get(`/matches/tournament/${tournamentId}`).then((r) => r.data),
  get: (id) => api.get(`/matches/${id}`).then((r) => r.data),
  create: (payload) => api.post('/matches', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/matches/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/matches/${id}`).then((r) => r.data),
}

export const resultService = {
  listByMatch: (matchId) => api.get(`/results/match/${matchId}`).then((r) => r.data),
  add: (payload) => api.post('/results', payload).then((r) => r.data),
  bulkAdd: (payload) => api.post('/results/bulk', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/results/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/results/${id}`).then((r) => r.data),
}

export const leaderboardService = {
  get: (tournamentId) => api.get(`/leaderboard/tournament/${tournamentId}`).then((r) => r.data),
  recalculate: (tournamentId) => api.post(`/leaderboard/tournament/${tournamentId}/recalculate`).then((r) => r.data),
  exportUrl: (tournamentId) => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    return `${base}/leaderboard/tournament/${tournamentId}/export`
  },
}

export const analyticsService = {
  summary: (params) => api.get('/analytics/summary', { params }).then((r) => r.data),
  registrationsOverTime: (params) => api.get('/analytics/registrations-over-time', { params }).then((r) => r.data),
  topTeams: (params) => api.get('/analytics/top-teams', { params }).then((r) => r.data),
  pointsBreakdown: (params) => api.get('/analytics/points-breakdown', { params }).then((r) => r.data),
  matchTrend: (params) => api.get('/analytics/match-trend', { params }).then((r) => r.data),
  topPlayers: (params) => api.get('/analytics/top-players', { params }).then((r) => r.data),
  mapPerformance: (params) => api.get('/analytics/map-performance', { params }).then((r) => r.data),
}

export const notificationService = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
}

export const userService = {
  list: (params) => api.get('/users', { params }).then((r) => r.data),
  toggleStatus: (id, isActive) => api.patch(`/users/${id}/status`, { is_active: isActive }).then((r) => r.data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }).then((r) => r.data),
}
