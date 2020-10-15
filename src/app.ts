import express, { Request, Response } from "express";
import * as bodyParser from "body-parser";
import { check, validationResult } from "express-validator";
import validation from "../middlewares/validator.middleware";

const app = express();

app.use(bodyParser.json());

type todo = {
  id: number;
  text: string;
  complete: boolean;
};

let todoRepository: todo[] = [];
let number = 0;

/* post */

app.post(
  "/",
  validation,
  (req, res) => {
    const errors = validationResult(req);
    number =  number + 1

    const {text, complete} = req.body
    const todo = {
      id: number,
      text: text,
      complete: complete,
    };

    if (!errors.isEmpty()) return res.status(400).send({ message: "Bad request, Please check your input field" });

    todoRepository.push(todo);
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
