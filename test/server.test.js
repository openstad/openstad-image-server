jest.mock('../lib/imageServer');

const spyReturns = returnValue => jest.fn(() => returnValue);

const mockedFunctions =  {
  getImageServer: spyReturns({
    getHandler: spyReturns(true),
    on: spyReturns(true)
  })
};

// Mock imageServer because it's not working with superagent
jest.doMock('../lib/imageServer', () => mockedFunctions);

const knex = require('../knex/knex.js');
const mockKnex = require('mock-knex');
const tracker = require('mock-knex').getTracker();

const app = require('../app');
const request = require('supertest');
const agent = request.agent(app);

describe('Test image server', () => {

  beforeEach(() => {
    tracker.install();
  });

  afterEach(() => {
    tracker.uninstall();
  });

  beforeAll(() => {
    mockKnex.mock(knex);
  });

  afterAll(() => {
    mockKnex.unmock(knex);
  });

  it('Should upload an image', async () => {

    tracker.on('query', (query) => {
      query.response({id: '1', clientName: 'test', token: '123'});
    });

    const testImage = `${__dirname}/image/test-image.jpg`;

    const res = await agent
      .post('/image?access_token=123')
      .attach('image', testImage)
    ;

    expect(res.statusCode).toEqual(200)
  });

});


