import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

import { User } from "../models/User.js"
import { decodeExpUnix, verifyAccessToken } from "../utils/token.util.js"

export const verifyUser = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header
            ("Authorization")?.replace(/^Bearer\s+/i, "").trim();

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decoded = verifyAccessToken(token)
        console.log("Decoded Token:->", decoded)

        const user = await User.findByPk(decoded?.sub, {
            attributes: { exclude: ['password', 'refreshTokens'] }
        });

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        console.log("verify User")
        next()
    } catch (error) {
        res.status(401).json({ message: 'Invalid access Token in auth.middleware.js ->', error: error.message });
    }
})

export const verifyOwner = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header
            ("Authorization")?.replace(/^Bearer\s+/i, "").trim();

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decoded = verifyAccessToken(token)
        console.log("Decoded Token:->", decoded)

        const owner = await User.findByPk(decoded?.sub, {
            attributes: { exclude: ['password', 'refreshTokens'] }
        });

        if (!owner) {
            throw new ApiError(401, "Invalid Access Token")
        }

        if (owner.role !== "shop_owner") {
            throw new ApiError(403, "Access denied, only shop owner can access")
        }

        req.owner = owner;
        console.log("verify Owner")
        next()
    } catch (error) {
        res.status(401).json({ message: 'Invalid access Token in auth.middleware.js ->', error: error.message });
    }
});