import express, { Application, Request, Response, NextFunction } from "express";
import * as bodyParser from "body-parser";
import { check, validationResult } from "express-validator";

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
  [check("text").isString(), check("complete").isBoolean()],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    number =  number + 1
    const todo = {
      id: number,
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
      const validTodo = todoRepository.find(el => el.id === parseInt(req.params.id));
      if (!validTodo) {
        res.status(400).send({ message: "ID not exists" });
      } else {
          validTodo.text = req.body.text ? req.body.text : validTodo.text 
          validTodo.complete = req.body.complete ? req.body.complete : validTodo.complete 
          todoRepository.push(validTodo);
          res.send(validTodo);
      }
    }
  );

  /* delete */
  
  app.delete(
    "/:id",
    (req: Request, res: Response) => {
      const validTodo = todoRepository.find(el => el.id === parseInt(req.params.id));
      if (!validTodo) {
        res.status(400).send({ message: "ID not exist" });
      } else {
          const index = todoRepository.indexOf(validTodo);
          todoRepository.splice(index, 1);
          res.send(validTodo);
      }
    }
  );

  /* get */
  app.get(
    "/",
    (req: Request, res: Response) => {
        res.send(todoRepository);
    }
  );

/* get :/id */
app.get(
    "/:id",
    (req: Request, res: Response) => {
      const validTodo = todoRepository.find(el => el.id === parseInt(req.params.id));
      if (!validTodo) {
        res.status(400).send({ message: "ID not exist" });
      } else {
          res.send(validTodo);
      }
    }
);

app.listen(8000, () => console.log("Server running"));
