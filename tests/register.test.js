const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // သင်၏ Express app လမ်းကြောင်း

let mongoServer;

// (A) Test အားလုံး မစတင်မီ In-memory DB ကို တည်ဆောက်ပြီး ချိတ်ဆက်ခြင်း
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // လက်ရှိ ရှိနေသော connection ရှိလျှင် ဖြုတ်ပြီး အသစ်ချိတ်ခြင်း
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
});

// (B) Test Case တစ်ခု ပြီးတိုင်း ကျန်ခဲ့သော Data များကို ရှင်းထုတ်ခြင်း
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// (C) Test အားလုံးပြီးလျှင် Connection ပိတ်ပြီး Server ကို ရပ်ခြင်း
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /register', () => {
  
  it('should register a new user successfully', async () => {
    const newUser = {
      username: 'testuser',
      email: 'test@gmail.com',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/hotels/register')
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should return 400 if email is missing', async () => {
    const invalidUser = {
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/hotels/register')
      .send(invalidUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

});