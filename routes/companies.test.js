// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
	const result = await db.query(
		`INSERT INTO companies (code, name, description) VALUES ('star', 'Stardust', 'Event Entertainment') RETURNING code, name, description`
	);
	testCompany = result.rows[0];
});

afterEach(async () => {
	await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
	await db.end();
});

describe('GET /companies', () => {
	test('Get a list with one company', async () => {
		const res = await request(app).get('/companies');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ companies: [ testCompany ] });
	});
});

describe('GET /companies/:code', () => {
	test('Get a specific company', async () => {
		const res = await request(app).get(`/companies/${testCompany.code}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ company: testCompany });
	});

	test('Get 404 for invalid company code', async () => {
		const res = await request(app).get('/companies/*');
		expect(res.statusCode).toBe(404);
	});
});

describe('POST /companies/', () => {
	test('Create a new company', async () => {
		const res = await request(app)
			.post(`/companies/`)
			.send({ code: 'spring', name: 'Springboard', description: 'IT e-learning' });
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ company: { code: 'spring', name: 'Springboard', description: 'IT e-learning' } });
	});
});

describe('PUT /companies/:code', () => {
	test('Update a specific company', async () => {
		const res = await request(app)
			.put(`/companies/${testCompany.code}`)
			.send({ name: 'Stardust Events Entertainment', description: 'Event Entertainment Houston' });
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			company: { code: 'star', name: 'Stardust Events Entertainment', description: 'Event Entertainment Houston' }
		});
	});

	test('Get 404 for invalid company code', async () => {
		const res = await request(app)
			.put('/companies/*')
			.send({ name: 'Stardust Events Entertainment', description: 'Event Entertainment Houston' });
		expect(res.statusCode).toBe(404);
	});
});

describe('DELETE /companies/:code', () => {
	test('Delete specific company', async () => {
		const res = await request(app).delete(`/companies/${testCompany.code}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ msg: 'Deleted!' });
	});

	test('Get 404 for invalid company code', async () => {
		const res = await request(app).delete(`/companies/*`);
		expect(res.statusCode).toBe(404);
	});
});
