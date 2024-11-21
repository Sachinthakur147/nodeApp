import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
     const token = req.cookies?.token;
     if (!token) return res.status(401).json({ message:"Unauthorized"});

     try{
          const decoded = jwt.verify(token,process.env.JWT_SECRET!) as { id: number};
           const user = await prisma.user.findUnique({ where :{id: decoded.id}});
           if(!user || user.session !== token){
               return res.status(401).json({message:"Session invalid"});
           }
           req.user = user;
           next();
     }catch(error){
          res.status(403).json({ message:"Invalid token"});
     }

}