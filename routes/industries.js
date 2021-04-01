const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const db = require('../db');
const slugify = require('slugify');

// router.get('/', async (req, res, next) => {
// 	try {
// 		const industriesResults = await db.query(`SELECT code, industry FROM industries`);
//         industriesResults.forEach(r => {
//             r.companies =
//         });
// 		res.send({ industries: industriesResults.rows });
// 	} catch (e) {
// 		next(e);
// 	}
// });

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`
        SELECT i.code AS industry_code, i.industry, c.code AS company_code
        FROM industries AS i
        LEFT JOIN companies_industries AS ci
        ON i.code = ci.industry_code
        LEFT JOIN companies AS c
        ON ci.comp_code = c.code
        GROUP BY i.code, i.industry, c.code
        ORDER BY i.code`);

		res.send(results.rows);
	} catch (e) {
		next(e);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { industry } = req.body;
		const code = slugify(industry, { lower: true });
		const result = await db.query(
			`
        INSERT INTO industries (code, industry) 
        VALUES code = $1, industry = $2 
        RETURNING code, industry`,
			[ code, industry ]
		);
		res.status(201).send({ industry: result.rows[0] });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
