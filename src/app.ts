import express from "express";
import * as bodyParser from "body-parser";
import { validationResult } from "express-validator";
import validation from "../middlewares/validator.middleware";
import couchbase from 'couchbase'

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
};

let todoRepository: todo[] = [];
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


/* post */

app.post(
  "/",
  validation,
  async (req, res) => {
    const errors = validationResult(req);
    number =  number + 1

    const {text, complete} = req.body
    const todo = {
      id: number,
      text: text,
      complete: complete,
      exist: true,
    };

    if (!errors.isEmpty()) return res.status(400).send({ message: "Bad request, Please check your input field" });

    createTodo(todo);
    res.send(todo);
  }
);

/* patch */

app.patch(
    "/:id",
    (req, res) => {
      const {text, complete} = req.body
      const validTodo = todoRepository.find(el => el.id === parseInt(req.params.id));

      if (!validTodo) return res.status(400).send({ message: "ID not exists" });

      validTodo.text = text || validTodo.text
      validTodo.complete = complete || validTodo.complete
      res.send(validTodo);  
    }
  );

  /* delete */
  
  app.delete(
    "/:id",
    (req, res) => {
      const validTodo = todoRepository.find(el => el.id === parseInt(req.params.id));

      if (!validTodo) return res.status(400).send({ message: "ID not exist" });

      const index = todoRepository.indexOf(validTodo);
      todoRepository.splice(index, 1);
      res.send(validTodo);
    }
  );

  /* get */
  app.get(
    "/",
    (req, res) => {
        res.send(todoRepository);
    }
  );

/* get :/id */
app.get(
    "/:id",
    (req, res) => {
      const validTodo = todoRepository.find(el => el.id === parseInt(req.params.id));

      if (!validTodo) return res.status(400).send({ message: "ID not exist" });

      res.send(validTodo);      
    }
);

app.listen(8000, () => console.log("Server running"));
