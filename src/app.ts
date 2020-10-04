import express, { Application, Request, Response, NextFunction } from "express";
import * as bodyParser from "body-parser";
import { check, validationResult } from "express-validator";

const app: Application = express();

app.use(bodyParser.json());

interface todo {
  id: number;
  text: string;
  complete: boolean;
}[];

let todoRepository: todo[];

todoRepository = [];

/* post */

app.post(
  "/",
  [check("text").isString(), check("complete").isBoolean()],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    const todo = {
      id: todoRepository.length + 1,
      text: req.body.text,
      complete: req.body.complete,
    };
    if (!errors.isEmpty()) {
      res.status(400).send({ message: "Bad request, Please check your input field" });
    } else {
      todoRepository.push(todo);
      res.send(todo);
    }
  }
);

/* patch */

app.patch(
    "/:id",
    (req: Request, res: Response) => {
      const todo = todoRepository.find(el => el.id === parseInt(req.params.id));
      if (!todo) {
        res.status(400).send({ message: "ID not exists" });
      } else {
          todo.text = req.body.text;
          todo.complete = req.body.complete;
          res.send(todo);
      }
    }
  );

  /* delete */
  
  app.delete(
    "/:id",
    (req: Request, res: Response) => {
      const todo = todoRepository.find(el => el.id === parseInt(req.params.id));
      if (!todo) {
        res.status(400).send({ message: "ID not exist" });
      } else {
          const index = todoRepository.indexOf(todo);
          todoRepository.splice(index, 1);
          res.send(todo);
      }
    }
  );

app.listen(8000, () => console.log("Server running"));
