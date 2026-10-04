import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Auth - Obtenção de Token', () => {
  const p = pactum;
  const baseUrl = 'https://restful-booker.herokuapp.com';

  p.request.setDefaultTimeout(30000);
  beforeAll(() => p.reporter.add(SimpleReporter));
  afterAll(() => p.reporter.end());

  it('Deve autenticar com credenciais válidas e retornar token', async () => {
    await p
      .spec()
      .post(`${baseUrl}/auth`)
      .withJson({
        username: 'admin',
        password: 'password123'
      })
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        token: /^[a-zA-Z0-9]+$/
      });
  });
});