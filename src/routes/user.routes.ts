import { Router, Request, Response } from "express";
import { authenticate } from "../middlewares/jwt.middleware";


const router = Router();

// This route is protected. It only works if a valid JWT is sent.
router.get("/me", authenticate, (req: Request, res: Response) => {
  // req.user comes from the JWT decoded in the middleware!
  res.json({
    message: "You are logged in",
    yourDetails: req.user 
  });
});

export default router;