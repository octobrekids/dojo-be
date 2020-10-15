import { Request, Response, NextFunction } from "express";
function validation (req: Request, res: Response, next: NextFunction) {
    const valid = req.body.text !== ''
    if(valid) return next();
    return res.sendStatus(400)
 }

 export default validation;