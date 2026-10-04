import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Booking - Payload Incompleto', () => {
  const p = pactum;
  const baseUrl = 'https://restful-booker.herokuapp.com';

  p.request.setDefaultTimeout(30000);
  beforeAll(() => p.reporter.add(SimpleReporter));
  afterAll(() => p.reporter.end());

  it('Deve rejeitar requisição com schema incompleto', async () => {
    await p
      .spec()
      .post(`${baseUrl}/booking`)
      .withHeaders('Content-Type', 'application/json')
      .withHeaders('Accept', 'application/json')
      .withJson({
        firstname: 'PayloadSemDatasNemSobrenome'
      })
      .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});