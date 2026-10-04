import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Booking - Falha de Autorização', () => {
  const p = pactum;
  const baseUrl = 'https://restful-booker.herokuapp.com';
  let bookingId: number;

  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(SimpleReporter);

    bookingId = await p
      .spec()
      .post(`${baseUrl}/booking`)
      .withHeaders('Content-Type', 'application/json')
      .withHeaders('Accept', 'application/json')
      .withJson({
        firstname: 'Safe',
        lastname: 'User',
        totalprice: 200,
        depositpaid: true,
        bookingdates: { checkin: '2026-11-01', checkout: '2026-11-05' },
        additionalneeds: 'None'
      })
      .expectStatus(StatusCodes.OK)
      .returns('bookingid');
  });

  afterAll(() => p.reporter.end());

  it('Deve retornar 403 Forbidden ao tentar atualizar sem cookie de token', async () => {
    await p
      .spec()
      .put(`${baseUrl}/booking/${bookingId}`)
      .withHeaders('Content-Type', 'application/json')
      .withHeaders('Accept', 'application/json')
      .withJson({
        firstname: 'TentativaInvalida',
        lastname: 'SemToken',
        totalprice: 300,
        depositpaid: true,
        bookingdates: { checkin: '2026-11-01', checkout: '2026-11-05' },
        additionalneeds: 'None'
      })
      .expectStatus(StatusCodes.FORBIDDEN);
  });
});