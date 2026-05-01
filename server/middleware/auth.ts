import type { Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken"
import { User } from "../types"

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export function validateJWT(req: Request, _res: Response, next: NextFunction) {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        return next()
    }

    verify(token, process.env.JWT_SECRET || "secret", (err, decoded) => {
        if (err) {
            req.user = undefined
            return next()
        }

        req.user = decoded as User
        next()
    })
}


export function requireAuth(administrator?: boolean, userId?: number) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).send({
                data: null,
                isSuccess: false,
                message: "You must log in to access this resource",
            })
        }

        if (administrator === true && !req.user?.administrator) {
            return res.status(403).send({
                data: null,
                isSuccess: false,
                message:
                    "You do not have the required role to access this resource",
            })
        }

        if (userId && req.user.id !== userId) {
            return res.status(403).send({
                data: null,
                isSuccess: false,
                message: "You do not have permission to access this resource",
            })
        }

        return next()
    }
}