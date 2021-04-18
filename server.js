const express = require('express');
const bodyParser = require('body-parser');
const { Pool, Client } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

const pool = new Pool({
  user: 'root',
  host: 'localhost',
  database: 'test_db',
  password: 'root',
  port: 5432
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/updated_stats_all', (req, res) => {

  const query = {
  name: 'fetch-hero',
  text: 'SELECT * FROM heroes'
}

  pool.query(query, (err,resb)=>{
    console.log("res pool: ",err);

    if (err)
      res.send(JSON.stringify({error: "failed to fetch data"}));
    else {
      res.send(JSON.stringify(resb.rows));
    }
      
  });
});

app.post('/api/updated_stats_by_id', (req, resb) => {

  const query = {
  // give the query a unique name
  name: 'fetch-hero',
  text: 'SELECT * FROM heroes WHERE id = $1',
  values: [req.body.id],
}

  pool.query(query, (err,resb)=>{
    console.log("res pool: ",err);

    if (err)
      res.send(JSON.stringify({error: "failed to fetch data"}));
    else
      res.send(JSON.stringify({res: resb}));
  });
});

app.post('/api/update', (req, res) => {
  console.log(req.body);

  const query = {
  name: 'delete-existing-hero',
  text: 'DELETE FROM heroes WHERE id = $1',
  values: [req.body.id],
}

  pool.query(query, (err,resb)=>{

    /*Error checking. Returns a string of "null" when undefined. it's the API's fault from the other server, not mine.
    There is Probably a better way to do this, like using filter or equivalent. */
    if (req.body.powerstats.combat == "null") {
      req.body.powerstats.combat = -1;
    }

    if (req.body.powerstats.durability == "null") {
      req.body.powerstats.durability = -1;
    }

    if (req.body.powerstats.intelligence == "null") {
      req.body.powerstats.intelligence = -1;
    }

    if (req.body.powerstats.power == "null") {
      req.body.powerstats.power = -1;
    }

    if (req.body.powerstats.speed == "null") {
      req.body.powerstats.speed = -1;
    }
    
    if (req.body.powerstats.strength == "null") {
      req.body.powerstats.strength = -1;
    }
  //Doing things this way to prevent SQL injection
  const queryString = 'INSERT INTO heroes(id, combat, durability, intelligence, power, speed, strength) VALUES($1, $2, $3, $4, $5, $6, $7)';
  const values = [req.body.id,req.body.powerstats.combat,req.body.powerstats.durability,req.body.powerstats.intelligence,req.body.powerstats.power,req.body.powerstats.speed,req.body.powerstats.strength]
  pool.query(queryString,values, (err,resb)=>{
    console.log("res pool: ",err);

    if (err)
      res.send(JSON.stringify({error: "failed to update"}));
    else
      res.send(JSON.stringify({success: "successfully updated data"}));
  });
});
});

app.listen(port, () => console.log(`Listening on port ${port}`));
