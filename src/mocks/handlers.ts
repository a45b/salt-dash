import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/kpi', () =>
    HttpResponse.json({
      data: [{ revenue: 253400, trend: 12.5 }],
    }),
  ),
]
