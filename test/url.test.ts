import request from 'supertest';

import app from '../src/app';

describe('GET /api/v1/url', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/url/all')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('GET /api/v1/url/get_url/1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/url/get_url/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
