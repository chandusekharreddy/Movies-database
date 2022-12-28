const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost/3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObject = (bdObject) => {
  return {
    movieName: bdObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieListQuery = `SELECT movie_name FROM movie;`;
  const moviesQueryResponse = await db.all(getMovieListQuery);
  response.send(
    moviesQueryResponse.map((eachMovie) => convertDbObject(eachMovie))
  );
});

// API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}', '${leadActor}');`;
  const createMovieResponse = await db.run(createMovieQuery);
  response.send(`Movie Successfully Added`);
});

//API 3
const convertMovieDb3 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieDetailQueryResponse = await db.get(getMovieDetailQuery);
  response.send(convertMovieDb3(movieDetailQueryResponse));
});

// API 4
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie SET director_id = ${directorId},
    movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`;

  const updateMovieQueryResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  const deleteMovieQueryResponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API 6
const convertDb6 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director;`;
  const directorResponse = await db.all(getDirectorQuery);
  response.send(directorResponse.map((eachItem) => convertDb6(eachItem)));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `SELECT movie_name AS movieName FROM movie WHERE 
    director_id = ${directorId};`;
  const QueryResponse = await db.all(getMoviesByDirectorQuery);
  response.send(QueryResponse);
});

module.exports = app;
