import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Booking - Atualização Parcial (PATCH)', () => {
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
        firstname: 'Rodrigo',
        lastname: 'Mendes',
        totalprice: 150,
        depositpaid: true,
        bookingdates: { checkin: '2026-11-10', checkout: '2026-11-12' },
        additionalneeds: 'Towels'
      })
      .expectStatus(StatusCodes.OK)
      .returns('bookingid');
  });

  afterAll(() => p.reporter.end());

  it('Deve atualizar somente o campo additionalneeds via PATCH', async () => {
    await p
      .spec()
      .patch(`${baseUrl}/booking/${bookingId}`)
      .withHeaders('Content-Type', 'application/json')
      .withHeaders('Accept', 'application/json')
      .withHeaders('Cookie', `token=${token}`)
      .withJson({ additionalneeds: 'Airport Shuttle Service' })
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        firstname: 'Rodrigo',
        additionalneeds: 'Airport Shuttle Service'
      });
  });
});