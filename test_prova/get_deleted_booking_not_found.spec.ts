import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Booking - Validação de Recurso Não Encontrado', () => {
  const p = pactum;
  const baseUrl = 'https://restful-booker.herokuapp.com';
  let bookingId: number;

  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(SimpleReporter);

    const token = await p
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
        firstname: 'Gone',
        lastname: 'Entity',
        totalprice: 50,
        depositpaid: true,
        bookingdates: { checkin: '2026-12-01', checkout: '2026-12-02' },
        additionalneeds: 'None'
      })
      .expectStatus(StatusCodes.OK)
      .returns('bookingid');

    await p
      .spec()
      .delete(`${baseUrl}/booking/${bookingId}`)
      .withHeaders('Cookie', `token=${token}`)
      .expectStatus(StatusCodes.CREATED);
  });

  afterAll(() => p.reporter.end());

  it('Deve retornar 404 Not Found ao consultar reserva excluída', async () => {
    await p
      .spec()
      .get(`${baseUrl}/booking/${bookingId}`)
      .withHeaders('Accept', 'application/json')
      .expectStatus(StatusCodes.NOT_FOUND);
  });
});