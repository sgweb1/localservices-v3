import { http, HttpResponse } from 'msw'

/**
 * MSW Handlers dla testów integracyjnych Dashboard
 * 
 * Mockują realne API responses z danymi
 */

const baseURL = '/api/v1'

export const dashboardHandlers = [
  // GET /provider/dashboard/widgets
  http.get(`${baseURL}/provider/dashboard/widgets`, () => {
    return HttpResponse.json({
      pipeline: {
        bookings: {
          pending: 5,
          confirmed: 12,
          completed: 48,
          cancelled: 2,
        },
        requests: {
          incoming: 8,
          quoted: 6,
          converted: 4,
        },
      },
      insights: {
        trust_score: 87,
      },
      performance: {
        trust_score: 87,
        response_minutes: 35,
      },
      messages: {
        unread_count: 3,
      },
    })
  }),

  // GET /provider/dashboard/bookings
  http.get(`${baseURL}/provider/dashboard/bookings`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          customer_name: 'Jan Kowalski',
          service: 'Malowanie ścian',
          date: '2025-01-15',
          time: '10:00',
          status: 'confirmed',
          location: 'Warszawa, Mokotów',
        },
        {
          id: 2,
          customer_name: 'Anna Nowak',
          service: 'Remont łazienki',
          date: '2025-01-18',
          time: '14:00',
          status: 'pending',
          location: 'Kraków, Podgórze',
        },
        {
          id: 3,
          customer_name: 'Piotr Wiśniewski',
          service: 'Instalacja AGD',
          date: '2025-01-20',
          time: '09:00',
          status: 'confirmed',
          location: 'Gdańsk, Wrzeszcz',
        },
      ],
    })
  }),

  // GET /provider/dashboard/conversations
  http.get(`${baseURL}/provider/dashboard/conversations`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          customer_name: 'Maria Kowalczyk',
          last_message: 'Dzień dobry, czy możemy przełożyć termin?',
          time: '2 godz. temu',
          unread: 2,
        },
        {
          id: 2,
          customer_name: 'Tomasz Lewandowski',
          last_message: 'Dziękuję za szybką odpowiedź!',
          time: '5 godz. temu',
          unread: 0,
        },
        {
          id: 3,
          customer_name: 'Katarzyna Zielińska',
          last_message: 'Ile będzie kosztować dodatkowa usługa?',
          time: 'wczoraj',
          unread: 1,
        },
      ],
    })
  }),

  // GET /provider/dashboard/reviews
  http.get(`${baseURL}/provider/dashboard/reviews`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          customer_name: 'Adam Nowicki',
          rating: 5,
          comment: 'Świetna robota! Bardzo profesjonalnie.',
          date: '2025-01-10',
        },
        {
          id: 2,
          customer_name: 'Ewa Kowalska',
          rating: 4,
          comment: 'Dobra jakość, polecam.',
          date: '2025-01-08',
        },
        {
          id: 3,
          customer_name: 'Michał Dąbrowski',
          rating: 5,
          comment: 'Bardzo zadowolony z usługi.',
          date: '2025-01-05',
        },
      ],
    })
  }),

  // GET /provider/dashboard/performance
  http.get(`${baseURL}/provider/dashboard/performance`, () => {
    return HttpResponse.json({
      views: 342,
      favorited: 28,
      avg_response_time: '1.8h',
      rating: 4.8,
      period_label: 'Ostatnie 7 dni',
    })
  }),
]
