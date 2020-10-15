import express from "express";
import * as bodyParser from "body-parser";
import { Result, validationResult } from "express-validator";
import validation from "../middlewares/validator.middleware";
import couchbase from "couchbase";

const app = express();

app.use(bodyParser.json());

/* define cluster */
const cluster = new couchbase.Cluster("couchbase://localhost", {
  username: "admin",
  password: "123456",
});

/* define bucket */
const bucket = cluster.bucket("TodoRepository");

/* define collection */
const collection = bucket.defaultCollection();

type todo = {
  id: number;
  text: string;
  complete: boolean;
  exist: boolean;
};

let number = 0;

/* create todo */

const createTodo = async (doc: todo) => {
  try {
    const key = `${doc.id}`;
    const result = await collection.insert(key, doc);
    console.log("Insert Result: ");
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

/* get todo with id */
const getTodoId = async (key: string) => {
  try {
    const result = await collection.get(key);
    console.log("Get Id" + key + " Result: ");
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

/* update todo by id */
const updateTodoId = async (key: string, doc: todo) => {
  try {
    const result = await collection.mutateIn(key, [
      couchbase.MutateInSpec.replace("text", doc.text),
      couchbase.MutateInSpec.replace("complete", doc.complete),
    ]);
    console.log("Update Id" + key + " Result: ");
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

/* delete todo by id */
const deleteTodoId = async (key: string) => {
  try {
    const result = await collection.mutateIn(key, [
      couchbase.MutateInSpec.replace("exist", false),
    ]);
    console.log("Delete Id" + key + " Result: ");
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

/* query all todo */
const queryAllTodo = async () => {
  const query = `
  SELECT *
  FROM TodoRepository
`;

  try {
    let data = await cluster.query(query);

    const results = data.rows.map((row: object) => {
      console.log("Query row: ", row);
      return row;
    });
    return results;
  } catch (error) {
    console.error("Query failed: ", error);
  }
};

/* search todo */
const ftsMatchPhrase = async (phase: any) => {
    try {
      return await cluster.searchQuery(
        "text",
        couchbase.SearchQuery.matchPhrase(phase),
        { limit: 10 }
      )
    } catch (error) {
      console.error(error)
    }
  }


/* post */

app.post("/", validation, async (req, res) => {
  const errors = validationResult(req);
  number = number + 1;

  const { text, complete } = req.body;
  const todo = {
    id: number,
    text: text,
    complete: complete,
    exist: true,
  };

  if (!errors.isEmpty())
    return res
      .status(400)
      .send({ message: "Bad request, Please check your input field" });

  await createTodo(todo);
  res.send(todo);
});

/* patch */

app.patch("/:id", async (req, res) => {
  const { text, complete } = req.body;

  const validTodo = await getTodoId(req.params.id);
  if (!validTodo) return res.status(400).send({ message: "ID not exists" });

  validTodo.content.text = text || validTodo.text;
  validTodo.content.complete = complete || validTodo.complete;

  await updateTodoId(req.params.id, validTodo);
  res.send(validTodo);
});

/* delete */

app.delete("/:id", async (req, res) => {
  const validTodo = await getTodoId(req.params.id);
  if (!validTodo) return res.status(400).send({ message: "ID not exists" });

  await deleteTodoId(req.params.id);
  res.send(validTodo);
});

/* get search query */
app.get("/search", async (req, res) => {
  const data = await ftsMatchPhrase(req.query.q)
  if(data.rows.length === 0) return res.status(400).send({ message: "ID not exists" });
  const result = data.rows.map((e:any) => {return e})
  console.log(result);
  res.send(result);
});

/* get :/id */
app.get("/:id", async (req, res) => {
  const result = await getTodoId(req.params.id);
  if (!result) return res.status(400).send({ message: "ID not exist" });
  console.log(result);
  res.send(result);
});

/* get */
app.get("/", async (req, res) => {
  const result = await queryAllTodo();
  res.send(result);
});

app.listen(8000, () => console.log("Server running"));




