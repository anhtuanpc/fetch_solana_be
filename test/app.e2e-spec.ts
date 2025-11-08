import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('(1) should return transaction count for a valid block', async () => {
    const blockId = '150000000'; // Replace with a valid block ID for testing
    const response = await request(app.getHttpServer())
      .get(`/txs-from-block/${blockId}`)
      .expect(200);

    expect(response.body).toHaveProperty('status', 200);
    expect(response.body).toHaveProperty('message', 'Success');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.data).toHaveProperty('transactionCount', 4388);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(typeof response.body.data.transactionCount).toBe('number');
  });

  it('(2) should return 404 for a non-existent block', async () => {
    const blockId = '999999999999'; // An unlikely block ID to exist
    const response = await request(app.getHttpServer())
      .get(`/txs-from-block/${blockId}`)
      .expect(200);

    expect(response.body).toHaveProperty('status', 404);
    expect(response.body).toHaveProperty('message', 'Block does not exist');
  });

  it('(3) should return 400 for an invalid block ID', async () => {
    const blockId = 'invalid-block-id';
    const response = await request(app.getHttpServer())
      .get(`/txs-from-block/${blockId}`)
      .expect(200);

    expect(response.body).toHaveProperty('status', 400);
    expect(response.body).toHaveProperty(
      'message',
      'Invalid block ID. Must be a valid number.',
    );
  });
});
