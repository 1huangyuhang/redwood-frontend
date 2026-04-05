import request from 'supertest';
import app from '../../src/app';

/**
 * 契约向回归：关键读接口形态稳定即可；需 DATABASE_URL 与 API_KEY（默认 default-api-key）。
 */
const apiKey = process.env.API_KEY || 'default-api-key';

describe('Regression: HTTP contract', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  test('GET /api/stats/summary returns { data } with counters', async () => {
    const res = await request(app)
      .get('/api/stats/summary')
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    const d = res.body.data;
    expect(d).toHaveProperty('productCount');
    expect(d).toHaveProperty('activityCount');
    expect(d).toHaveProperty('newsCount');
    expect(d).toHaveProperty('siteAssetCount');
    expect(d).toHaveProperty('courseCount');
    expect(d).toHaveProperty('pricingPlanCount');
    expect(d).toHaveProperty('contactMessageCount');
    expect(d).toHaveProperty('supportTicketCount');
  });

  test('GET /api/products returns paginated list', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ page: 1, pageSize: 5 })
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      pageSize: 5,
    });
    expect(typeof res.body.pagination.total).toBe('number');
  });

  test('GET /api/categories returns { data } list', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const row = res.body.data[0];
      expect(row).toHaveProperty('id');
      expect(row).toHaveProperty('slug');
      expect(row).toHaveProperty('name');
    }
  });

  test('GET /api/products item shape includes categoryId when list non-empty', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ page: 1, pageSize: 1 })
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    if (res.body.data.length > 0) {
      const p = res.body.data[0];
      expect(p).toHaveProperty('categoryId');
      expect(p).toHaveProperty('category');
      expect(p).toHaveProperty('image');
      expect(p).toHaveProperty('imageUrl');
    }
  });
});
