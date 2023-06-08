import express from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { nanoid } from 'nanoid';
// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod';

 
const schemaMain = z.object({
  slug: z.string().trim(),
  url: z.string().trim().url(),
}).required();
  
const Pool = require('pg').Pool;
export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'short_url',
  password: 'postgres',
  port: 5432,
});

const router = express.Router();

interface RowsUrl {
  id: number;
  url: string;
  slug: string;
}


router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const result:{ rows: RowsUrl[]; }  = await pool.query('SELECT url FROM short_url WHERE slug = $1', [slug]); 
    if (result) {
      res.redirect(result.rows[0].url);
    } else {
      res.redirect(`/?error=${slug} not found`);
    }
  } catch (error) {
    res.redirect('/?error= Link not found');
  }
  
});

router.post('/create', async (req, res, next) => {
  try {    
    const { url, slug = nanoid() } = req.body;
    schemaMain.parse({
      slug,
      url,
    });
    const candidate  = await pool.query('SELECT * FROM short_url WHERE slug=$1', [slug]);
    if (candidate.rowCount) {
      return res.status(400).send('Slug already exists');
    }
    const result:{ rows:RowsUrl[] } = await pool.query('INSERT INTO short_url (url, slug) VALUES ($1, $2) RETURNING *',  [url, slug]);
    res.status(201).send(`Url added with ID: ${result.rows[0].id}`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get('/get/all', async (req, res, next) => {
  try {
    const result: { rows: RowsUrl[]; } = await pool.query('SELECT * FROM short_url ORDER BY id ASC');
    res.status(200).json(result.rows);        
  } catch (error) {
    console.log(error);
    next(error);
  }
  
});

router.get('/get/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result:{ rows: RowsUrl[]; }  = await pool.query('SELECT * FROM short_url WHERE id = $1', [id]); 
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    next(error);
  }
  
});

router.put('/update_url/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { url, slug = nanoid() } = req.body;
    schemaMain.parse({
      slug,
      url,
    });
    const candidate  = await pool.query('SELECT * FROM short_url WHERE slug = $1', [slug]);
    if (candidate.rowCount) {
      return res.status(400).send('Slug already exists');
    }
    await pool.query('UPDATE short_url SET url = $1, slug = $2 WHERE id = $3', [url, slug, id]);
    res.status(200).send(`Url modified with ID: ${id}`);
  } catch (error) {
    console.log(error);
    next(error); 
  } 
});

router.delete('/:id', async (req, res, next) => {
  try {        
    const id = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM short_url WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      res.status(400).send(`Url with ID: ${id} not found`);
    }
    res.status(200).send(`Url deleted with ID: ${id}`);
  } catch (error) {
    console.log(error);
    next(error);  
  }
});

export default router;
