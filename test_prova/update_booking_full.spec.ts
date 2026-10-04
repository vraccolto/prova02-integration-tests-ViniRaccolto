import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Booking - Atualização Completa (PUT)', () => {
  const p = pactum;
  const baseUrl = 'https://restful-booker.herokuapp.com';
  let token: string;
  let bookingId: number;

  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(SimpleReporter);

    token = await p
      .spec()
      .post(`${baseUrl}/auth`)
      .withHeaders('Content-Type', 'application/json')
      .withJson({ username: 'admin', password: 'password123' })
      .expectStatus(StatusCodes.OK)
      .returns('token');

    bookingId = await p
      .spec()
      .post(`${baseUrl}/booking`)
      .withHeaders('Content-Type', 'application/json')
      .withHeaders('Accept', 'application/json')
      .withJson({
        firstname: 'Original',
        lastname: 'User',
        totalprice: 100,
        depositpaid: true,
        bookingdates: { checkin: '2026-11-01', checkout: '2026-11-05' },
        additionalneeds: 'None'
      })
      .expectStatus(StatusCodes.OK)
      .returns('bookingid');
  });

  afterAll(() => p.reporter.end());

  it('Deve atualizar todos os campos da reserva com token', async () => {
    const updatedData = {
      firstname: 'Alterado',
      lastname: 'Completo',
      totalprice: 500,
      depositpaid: false,
      bookingdates: { checkin: '2026-11-02', checkout: '2026-11-06' },
      additionalneeds: 'Dinner Included'
    };

    await p
      .spec()
      .put(`${baseUrl}/booking/${bookingId}`)
      .withHeaders('Content-Type', 'application/json')
      .withHeaders('Accept', 'application/json')
      .withHeaders('Cookie', `token=${token}`)
      .withJson(updatedData)
      .expectStatus(StatusCodes.OK)
      .expectJson(updatedData);
  });
});