import api from './api'

export const teamService = {
  list: (params) => api.get('/teams', { params }).then((r) => r.data),
  get: (id) => api.get(`/teams/${id}`).then((r) => r.data),
  myTeam: () => api.get('/teams/my-team').then((r) => r.data),
  create: (payload) => api.post('/teams', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/teams/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/teams/${id}`).then((r) => r.data),
  addPlayer: (payload) => api.post('/players', payload).then((r) => r.data),
  updatePlayer: (id, payload) => api.put(`/players/${id}`, payload).then((r) => r.data),
  removePlayer: (id) => api.delete(`/players/${id}`).then((r) => r.data),
}
