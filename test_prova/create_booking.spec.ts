import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Booking - Criação', () => {
  const p = pactum;
  const baseUrl = 'https://restful-booker.herokuapp.com';

  p.request.setDefaultTimeout(30000);
  beforeAll(() => p.reporter.add(SimpleReporter));
  afterAll(() => p.reporter.end());

  it('Deve criar uma reserva com sucesso', async () => {
    await p
      .spec()
      .post(`${baseUrl}/booking`)
      .withHeaders('Content-Type', 'application/json')
      .withHeaders('Accept', 'application/json')
      .withJson({
        firstname: 'Carlos',
        lastname: 'Silva',
        totalprice: 250,
        depositpaid: true,
        bookingdates: {
          checkin: '2026-11-01',
          checkout: '2026-11-10'
        },
        additionalneeds: 'Breakfast'
      })
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        bookingid: /^[0-9]+$/,
        booking: {
          firstname: 'Carlos',
          lastname: 'Silva'
        }
      });
  });
});