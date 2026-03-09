const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* CREATE GAME */
app.post("/game/create", async (req, res) => {

  const { player } = req.body;

  const game = await pool.query(
    "INSERT INTO games(player1) VALUES($1) RETURNING *",
    [player]
  );

  res.json(game.rows[0]);
});

/* JOIN GAME */
app.post("/game/join/:id", async (req, res) => {

  const { id } = req.params;
  const { player } = req.body;

  await pool.query(
    "UPDATE games SET player2=$1, status='active' WHERE id=$2",
    [player, id]
  );

  res.json("joined");
});

/* SET SECRET NUMBER */

app.post("/game/secret/:id", async (req,res)=>{

  const { id } = req.params;
  const { player, number } = req.body;

  const game = await pool.query(
    "SELECT * FROM games WHERE id=$1",
    [id]
  );

  if(game.rows[0].player1 === player){

    await pool.query(
      "UPDATE games SET player1_secret=$1 WHERE id=$2",
      [number,id]
    );

  } else {

    await pool.query(
      "UPDATE games SET player2_secret=$1 WHERE id=$2",
      [number,id]
    );

  }

  res.json("secret saved");
});


/* GUESS NUMBER */

app.post("/game/guess/:id", async (req,res)=>{

  const { id } = req.params;
  const { player, guess } = req.body;

  const game = await pool.query(
    "SELECT * FROM games WHERE id=$1",
    [id]
  );

  const g = game.rows[0];

  let secret;

  if(g.player1 === player)
      secret = g.player2_secret;
  else
      secret = g.player1_secret;

  let result;

  if(guess > secret)
      result = "lower";
  else if(guess < secret)
      result = "higher";
  else
      result = "correct";

  await pool.query(
    "INSERT INTO guesses(game_id,player,guess,result) VALUES($1,$2,$3,$4)",
    [id,player,guess,result]
  );

  if(result === "correct"){

      await pool.query(
        "UPDATE games SET winner=$1, status='finished' WHERE id=$2",
        [player,id]
      );
  }

  res.json({result});

});


/* GET GAME STATUS */

app.get("/game/:id", async(req,res)=>{

  const { id } = req.params;

  const game = await pool.query(
    "SELECT * FROM games WHERE id=$1",
    [id]
  );

  res.json(game.rows[0]);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
  console.log("Server running");
});