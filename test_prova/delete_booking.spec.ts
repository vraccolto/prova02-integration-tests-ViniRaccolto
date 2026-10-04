import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Booking - Deleção de Registro', () => {
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
        firstname: 'ToDelete',
        lastname: 'Record',
        totalprice: 90,
        depositpaid: true,
        bookingdates: { checkin: '2026-12-01', checkout: '2026-12-03' },
        additionalneeds: 'None'
      })
      .expectStatus(StatusCodes.OK)
      .returns('bookingid');
  });

  afterAll(() => p.reporter.end());

  it('Deve excluir a reserva e retornar 201 Created', async () => {
    await p
      .spec()
      .delete(`${baseUrl}/booking/${bookingId}`)
      .withHeaders('Cookie', `token=${token}`)
      .expectStatus(StatusCodes.CREATED);
  });
});