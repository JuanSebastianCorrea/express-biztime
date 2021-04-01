const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');
const slufigy = require('slugify');
let router = new express.Router();

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`SELECT * FROM companies`);
		return res.json({ companies: results.rows });
	} catch (e) {
		return next(e);
	}
});

router.get('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const result = await db.query(
			`
        SELECT c.code, c.name, c.description, i.industry
        FROM companies AS c
        LEFT JOIN companies_industries AS ci
        ON c.code = ci.comp_code
        LEFT JOIN industries AS i
        ON ci.industry_code = i.code 
        WHERE c.code = $1`,
			[ code ]
		);
		if (result.rows.length === 0) {
			throw new ExpressError(`Company with code of ${code} not found`, 404);
		}

		const { name, description } = result.rows[0];
		const industries = result.rows.map((r) => r.industry);
		return res.json({ company: { code, name, description, industries } });
	} catch (e) {
		return next(e);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { name, description } = req.body;
		let code = slugify(name, { lower: true });
		const result = await db.query(
			`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
			[ code, name, description ]
		);
		return res.status(201).json({ company: result.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.put('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const result = await db.query(
			`UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description`,
			[ name, description, code ]
		);
		if (result.rows.length === 0) {
			throw new ExpressError(`Company with code of ${code} not found`, 404);
		}
		return res.json({ company: result.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.delete('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const result = await db.query(`DELETE FROM companies WHERE code = $1 RETURNING code`, [ code ]);

		if (result.rows.length === 0) {
			throw new ExpressError(`Could not find company with code ${code} to delete`, 404);
		}
		return res.json({ msg: 'Deleted!' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
