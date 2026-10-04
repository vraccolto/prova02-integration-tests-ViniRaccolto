import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Booking - Filtro por Query Params', () => {
  const p = pactum;
  const baseUrl = 'https://restful-booker.herokuapp.com';
  let bookingId: number;
  const targetFirstName = 'TesteFiltroVinicius';

  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(SimpleReporter);

    bookingId = await p
      .spec()
      .post(`${baseUrl}/booking`)
      .withHeaders('Content-Type', 'application/json')
      .withHeaders('Accept', 'application/json')
      .withJson({
        firstname: targetFirstName,
        lastname: 'QA',
        totalprice: 300,
        depositpaid: true,
        bookingdates: {
          checkin: '2026-10-01',
          checkout: '2026-10-05'
        },
        additionalneeds: 'Late Checkout'
      })
      .expectStatus(StatusCodes.OK)
      .returns('bookingid');
  });

  afterAll(() => p.reporter.end());

  it('Deve listar o ID da reserva ao filtrar por firstname', async () => {
    await p
      .spec()
      .get(`${baseUrl}/booking`)
      .withHeaders('Accept', 'application/json')
      .withQueryParams('firstname', targetFirstName)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike([
        {
          bookingid: bookingId
        }
      ]);
  });
});