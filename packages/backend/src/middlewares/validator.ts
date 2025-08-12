/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import { ZodType } from "zod";

/**
 * Custom Modules
 */
import { errorDetails, fail } from "@/utils";
import { logger } from "@/lib/winston";
import { registerSchema,loginSchema } from "@/models/authentication";

/**
 * Types
 */
import type { Request,Response,NextFunction } from "express";
import { AppError, AuthErrorCode, SystemErrorCode, ValidationError } from "@/errors";


class Validator{
    private constructor(){}

    public static validate<T>(body : Request , parser:ZodType<T>){
        if(body === null || Object.keys(body).length === 0) {
        throw new ValidationError({message: "Request body is empty or invalid"});
        }
        const parsedData = parser.safeParse(body);
        if (!parsedData.success) {
            const message =  errorDetails(parsedData);
            throw new ValidationError({details:message});
        }
    }

    public static validateQuery<T>(req : Request , parser:ZodType<T>){
        if(!req.query || Object.keys(req.query).length === 0) {
        throw new ValidationError({message: "Request query is empty or invalid"});
        }
        const parsedData = parser.safeParse(req.query);
        if (!parsedData.success) {
            const message =  errorDetails(parsedData);
            throw new ValidationError({details:message});
        }
    }

    public static validateParams<T>(req : Request , parser:ZodType<T>){
        if(!req.params || Object.keys(req.params).length === 0) {
        throw new ValidationError({message: "Request params are empty or invalid"});
        }
        const parsedData = parser.safeParse(req.params);
        if (!parsedData.success) {
            const message =  errorDetails(parsedData);
            throw new ValidationError({details:message});
        }
    }
}

 const createValidationMiddleware = (schema: ZodType) => {
  return async (req:Request,res:Response,next:NextFunction) =>{
    try {
      Validator.validate(req.body,schema);
      next();
    } catch (error) {
      logger.info("error",error);
       if(error instanceof AppError) {
           res.status(400).json(fail(error));
           return;
      }
      res.status(500).json(fail('Internal server error', SystemErrorCode.INTERNAL));
      return;
    }
  };
};

//  const createQueryValidationMiddleware = (schema: ZodType) => {
//   return async (req:Request,res:Response,next:NextFunction) =>{
//     try {
//       Validator.validateQuery(req,schema);
//       next();
//     } catch (error) {
//       logger.info("error",error);
//        if(error instanceof AppError) {
//            res.status(error.statusCode).json({type:error.status,message:error.details});
//       }
//       res.status(500).json({type:"error",message:"Something went wrong"});
//     }
//   };
// };

// const createParamsValidationMiddleware = (schema: ZodType) => {
//     return async (req:Request,res:Response,next:NextFunction) =>{
//     try {
//       Validator.validateParams(req,schema);
//       next();
//     } catch (error) {
//       logger.info("error",error);
//        if(error instanceof AppError) {
//            res.status(error.statusCode).json({type:error.status,message:error.details});
//       }
//       res.status(500).json({type:"error",message:"Something went wrong"});
//     }
//   };
// }

export const refreshTokenValidator = (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || (typeof token !== "string" && token.split(".").length === 3)) {
    res.status(401).json(fail('Invaid token',AuthErrorCode.TOKEN_INVALID));
    return;
  }
  req.token = token;
  next();
};


export const registerUserValidator = createValidationMiddleware(registerSchema);
export const loginUserValidator = createValidationMiddleware(loginSchema);