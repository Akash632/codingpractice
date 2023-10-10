const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db"); //connection.

let db = null;

const initializerFunc = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running in port 3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

app.get("/movies/", async (req, res) => {
  const query = `SELECT movie_name FROM movie;`;

  const data = await db.all(query);

  res.send(data.map((movie) => ({ movieName: movie.movie_name })));
});

app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;

  const query = `SELECT * FROM movie WHERE movie_id = ${movieId};`;

  const data = await db.get(query);

  res.send(data);
});

app.get("/directors/", async (req, res) => {
  const query = `SELECT * FROM director;`;

  const data = await db.all(query);

  res.send(
    data.map((value) => ({
      directorId: value.director_id,
      directorName: value.director_name,
    }))
  );
});

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;

  const query = `SELECT movie_name FROM movie WHERE director_id='${directorId}'`;

  const data = await db.all(query);

  res.send(data.map((value) => ({ movieName: value.movie_name })));
});

app.post("/movies/", async (req, res) => {
  const body = req.body;

  const { directorId, movieName, leadActor } = body;

  const query = `INSERT INTO 
                        movie (director_id,movie_name,lead_actor) 
                    VALUES (
                        ${directorId},
                        '${movieName}',
                        '${leadActor}'
                    );`;

  const data = await db.run(query);

  res.send("Movie Successfully Added");
});

app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;

  const query = `DELETE FROM movie WHERE movie_id = ${movieId};`;

  const data = await db.run(query);

  res.send("Movie Removed");
});

app.put("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const { directorId, movieName, leadActor } = req.body;

  const query = `UPDATE movie SET director_id=${directorId}, movie_name='${movieName}', lead_actor='${leadActor}' WHERE movie_id = ${movieId};`;

  await db.run(query);

  res.send("Movie Details Updated");
});

initializerFunc();

module.exports = app;
