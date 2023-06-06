import express from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';

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
  result: string;
}

router.post('/create', async (req, res, next) => {
  try {    
    const { url, slug = uuidv4() } = req.body;
    const resultUrl = `${url}/${slug}`;
    const candidate  = await pool.query('SELECT * FROM short_url WHERE result=$1', [resultUrl]);
    console.log(candidate.rowCount, resultUrl);
    if (candidate.rowCount) {
      return res.status(400).send('Slug already exists');
    }
    const result:{ rows:RowsUrl[] } = await pool.query('INSERT INTO short_url (url, result) VALUES ($1, $2) RETURNING *',  [url, resultUrl]);
    res.status(201).send(`Url added with ID: ${result.rows[0].id}`);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    const result: { rows: RowsUrl[]; } = await pool.query('SELECT * FROM short_url ORDER BY id ASC');
    res.status(200).json(result.rows);        
  } catch (error) {
    console.log(error);
    next(error);
  }
  
});

router.get('/get_url/:id', async (req, res, next) => {
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
    const { url, slug = uuidv4() } = req.body;
    const resultUrl = `${url}/${slug}`;
    const candidate  = await pool.query('SELECT * FROM short_url WHERE result = $1', [resultUrl]);
    console.log(candidate.rowCount, resultUrl);
    if (candidate.rowCount) {
      return res.status(400).send('Slug already exists');
    }
    await pool.query('UPDATE short_url SET url = $1, result = $2 WHERE id = $3', [url, resultUrl, id]);
    res.status(200).send(`Url modified with ID: ${id}`);
  } catch (error) {
    console.log(error);
    next(error); 
  } 
});

router.delete('/delete/:id', async (req, res, next) => {
  try {        
    const id = parseInt(req.params.id);
    await pool.query('DELETE FROM short_url WHERE id = $1', [id]);
    res.status(200).send(`Url deleted with ID: ${id}`);
  } catch (error) {
    console.log(error);
    next(error);  
  }
});

export default router;
