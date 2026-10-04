import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Restful Booker - Testes de Integração', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://restful-booker.herokuapp.com';

  let token = '';
  let bookingId = 0;

  const originalBookingPayload = {
    firstname: 'Carlos',
    lastname: 'Silva',
    totalprice: 250,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-11-01',
      checkout: '2026-11-10'
    },
    additionalneeds: 'Breakfast'
  };

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Fluxo Completo de Gestão de Reservas', () => {
    // Teste 1: Autenticação
    it('1. Autenticar usuário e obter token de acesso', async () => {
      token = await p
        .spec()
        .post(`${baseUrl}/auth`)
        .withJson({
          username: 'admin',
          password: 'password123'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          token: /^[a-zA-Z0-9]+$/
        })
        .returns('token');
    });

    // Teste 2: Criação de Reserva (POST)
    it('2. Criar uma nova reserva com sucesso', async () => {
      bookingId = await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withHeaders('Content-Type', 'application/json')
        .withHeaders('Accept', 'application/json')
        .withJson(originalBookingPayload)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          booking: {
            firstname: originalBookingPayload.firstname,
            lastname: originalBookingPayload.lastname,
            totalprice: originalBookingPayload.totalprice
          }
        })
        .returns('bookingid');
    });

    // Teste 3: Consulta por ID (GET)
    it('3. Buscar reserva pelo ID gerado e validar integridade dos dados', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.OK)
        .expectJson(originalBookingPayload);
    });

    // Teste 4: Filtro por Query Parameter (GET)
    it('4. Filtrar reservas pelo primeiro nome (firstname)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking`)
        .withQueryParams('firstname', originalBookingPayload.firstname)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike([
          {
            bookingid: bookingId
          }
        ]);
    });

    // Teste 5: Atualização Total com Autenticação (PUT)
    it('5. Atualizar todos os dados da reserva usando o token', async () => {
      const updatedPayload = {
        ...originalBookingPayload,
        firstname: 'Carlos Eduardo',
        totalprice: 320,
        additionalneeds: 'Late Checkout'
      };

      await p
        .spec()
        .put(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Content-Type', 'application/json')
        .withHeaders('Accept', 'application/json')
        .withHeaders('Cookie', `token=${token}`)
        .withJson(updatedPayload)
        .expectStatus(StatusCodes.OK)
        .expectJson(updatedPayload);
    });

    // Teste 6: Atualização Parcial com Autenticação (PATCH)
    it('6. Atualizar apenas campos específicos da reserva via PATCH', async () => {
      const patchPayload = {
        additionalneeds: 'Airport Shuttle'
      };

      await p
        .spec()
        .patch(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Content-Type', 'application/json')
        .withHeaders('Accept', 'application/json')
        .withHeaders('Cookie', `token=${token}`)
        .withJson(patchPayload)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          additionalneeds: 'Airport Shuttle'
        });
    });

    // Teste 7: Validação de Segurança / Autorização (PUT sem token)
    it('7. Rejeitar alteração da reserva quando o token não for fornecido', async () => {
      await p
        .spec()
        .put(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Content-Type', 'application/json')
        .withHeaders('Accept', 'application/json')
        .withJson(originalBookingPayload)
        .expectStatus(StatusCodes.FORBIDDEN);
    });

    // Teste 8: Validação de Payload Inválido (POST com corpo incorreto)
    it('8. Rejeitar criação de reserva com payload incompleto/inválido', async () => {
      await p
        .spec()
        .post(`${baseUrl}/booking`)
        .withHeaders('Content-Type', 'application/json')
        .withJson({
          firstname: 'Invalido'
          // Faltando lastname, totalprice, bookingdates, etc.
        })
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR); // A Restful-Booker responde 500 para schema quebrado
    });

    // Teste 9: Exclusão com Autenticação (DELETE)
    it('9. Deletar a reserva utilizando o token de autenticação', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Cookie', `token=${token}`)
        .expectStatus(StatusCodes.CREATED); // A Restful-Booker retorna 201 Created no DELETE
    });

    // Teste 10: Validação de Exclusão (GET em registro deletado)
    it('10. Confirmar que a reserva deletada não pode mais ser encontrada (404)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/booking/${bookingId}`)
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });
});