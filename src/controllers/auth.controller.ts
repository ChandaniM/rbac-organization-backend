// import { Request, Response } from "express";
// import { registerFun } from "../services/auth.service";
// export const login = (req: Request, res: Response) => {
//     let {email , password} = req.body;

//   try {
//     return res.status(201).json({
//       success: true,
//       data: [],
//     });
//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to create organization',
//     });
//   }
// };
// export const register = async (req: Request, res: Response) => {
//   try {
//     let Response = await registerFun(req.body);
//     return res.status(201).json({
//       success: true,
//       data: Response,
//     });
//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to create organization',
//     });
//   }
// };

