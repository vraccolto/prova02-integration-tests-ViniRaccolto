import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Booking - Consulta por ID', () => {
  const p = pactum;
  const baseUrl = 'https://restful-booker.herokuapp.com';
  let bookingId: number;

  const bookingData = {
    firstname: 'Marina',
    lastname: 'Souza',
    totalprice: 180,
    depositpaid: false,
    bookingdates: {
      checkin: '2026-12-05',
      checkout: '2026-12-12'
    },
    additionalneeds: 'Extra Bed'
  };

  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(SimpleReporter);
    bookingId = await p
      .spec()
      .post(`${baseUrl}/booking`)
      .withHeaders('Content-Type', 'application/json')
      .withHeaders('Accept', 'application/json')
      .withJson(bookingData)
      .expectStatus(StatusCodes.OK)
      .returns('bookingid');
  });

  afterAll(() => p.reporter.end());

  it('Deve retornar os detalhes da reserva pelo ID', async () => {
    await p
      .spec()
      .get(`${baseUrl}/booking/${bookingId}`)
      .withHeaders('Accept', 'application/json')
      .expectStatus(StatusCodes.OK)
      .expectJson(bookingData);
  });
});