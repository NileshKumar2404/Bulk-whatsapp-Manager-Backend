import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { User } from "../../models/User.js"
import { Business } from "../../models/Business.js"

function escapeRegex(s = "") {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const createBusiness = asyncHandler(async (req, res) => {
    try {
        const {name, timezone, country, category, description} = req.body || {}

        if (!name || !country || !category) return res .status(400).json(new ApiResponse(400, {}, "All these fields are required"));

        if (req.user.role !== "shop_owner") {
            return res .status(403).json(new ApiResponse(403, {}, "Only shop owner can create businesses"))
        }

        const existing = await Business.findOne({ownerId: req.user._id})
        if (existing) {
            return res
            .status(400)
            .json(new ApiResponse(400, {}, "You already have a business"))
        }

        const business = await Business.create({
            name,
            description,
            timezone,
            country,
            category,
            ownerId: req.user._id
        })

        return res
        .status(201)
        .json(new ApiResponse(
            201,
            {business},
            "Business created successfully"
        ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

export const getMyBusiness = asyncHandler(async (req, res) => {
    try {
        const business = await Business.find({ownerId: req.user._id})
        if (!business) {
            return res
            .status(404)
            .json(new ApiResponse(404, {}, "Business not found"))
        }
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {business},
            "Business found successfully"
        ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

export const updateMyBusiness = asyncHandler(async (req, res) => {
    try {
        const {businessId} = req.params
        const {name, description, category} = req.body

        const business = await Business.findById(businessId)
        if (!business) {
            return res
            .status(404)
            .json(new ApiResponse(404, {}, "Business not found"))
        }

        if (req.user.role !== "shop_owner") {
            return res .status(403).json(new ApiResponse(403, {}, "Only shop owner can update businesses"))
        }

        if (req.user._id !== business.ownerId) {
            return res
            .status(403)
            .json(new ApiResponse(403, {}, "You are not allowed to update this business"))
        }

        business.name = name || business.name
        business.description = description || business.description
        business.category = category || business.category
        await business.save()

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {business},
            "Business updated successfully"
        ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

export const deleteMyBusiness = asyncHandler(async (req, res) => {
    try {
        const {businessId} = req.params
    
        const existing = await Business.findById(businessId)
        if (!existing) {
            return res
            .status(404)
            .json(new ApiResponse(404, {}, "Business not found"))
        }
    
        if (req.user.role !== "shop_owner") {
            return res .status(403).json(new ApiResponse(403, {}, "Only shop owner can delete businesses"))
        }
    
        if (req.user._id !== existing.ownerId) {
            return res
            .status(403)
            .json(new ApiResponse(403, {}, "You are not allowed to delete this business"))
        }
    
        await Business.findByIdAndDelete(businessId)
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Business deleted successfully"
        ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

export const listBusinesses_admin = asyncHandler(async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res .status(403).json(new ApiResponse(403, {}, "Only admin can list businesses"))
        }
    
        const {q, country, category, timezone, page = "1", limit = "20", sortBy = "createdAt", order = "desc"} = req.query
    
        const filter = {}
        if (q & q.trim()) {
            const rx = new RegExp(escapeRegex(q.trim()), "i")
            filter.$or = [
                {name: rx},
                {country: rx},
                {category: rx},
                {description: rx}
            ]
        }
    
        if (country && country.trim()) filter.country = country.trim().toUpperCase();
        if (category && category.trim()) {
            filter.category = new RegExp(escapeRegex(category.trim()), "i")
        }
        if (timezone && timezone.trim()) filter.timezone = timezone.trim();
    
        const pageNum = Math.max(parseInt(page, 10) || 1, 1)
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)
        const skip = (pageNum - 1) * limitNum
    
        const ALLOWED_SORT = ['createdAt', 'updatedAt', 'name', 'country', 'category']
        const sortField = ALLOWED_SORT.includes(sortBy) ? sortBy: 'createdAt'
        const sortOrder = order === "asc" ? 1 : -1
        const sort = {[sortField]: sortOrder}
    
        const [items, total] = await Promise.all([
            Business.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
            Business.countDocuments(filter),
        ]);
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                items,
                page: pageNum, 
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum) || 0, 
                sort: {by: sortField, order: sortOrder === 1 ? "asc" : "desc"}, 
                filterApplied: filter
            },
            "Business fetched successfully"
        ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})

export const transferOwnerShip_admin = asyncHandler(async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res
            .status(404)
            .json(new ApiResponse(404, {}, "Only admin can transfer the ownership"))
        }

        const {businessId} = req.params
        const {newOwnerId} = req.body
    
        // Load business & new owner
        const business = await Business.findById(businessId)
        if (!business) {
            return res
            .status(404)
            .json(new ApiResponse(404, {}, "Business not found"))
        }
    
        const newOwner = await User.findById(newOwnerId)
        if (!newOwner) {
            return res
            .status(404)
            .json(new ApiResponse(404, {}, "Owner not found"))
        }
    
        // Must be a shop_owner
        if (newOwner.role !== "shop_owner") {
            return res
            .status(400)
            .json(new ApiResponse(400, {}, "Only shop owner can take ownership of the businesses"))
        }
    
        // No-op: already owned by this user
        if (business.ownerId?.toString() === newOwner._id.toString()) {
            return res
            .status(200)
            .json(new ApiResponse(200, {}, "Ownership unchanged"))
        }

        // Ensure the new owner does NOT already own another business
        const other = await Business.findOne({
            ownerId: newOwner._id,
            _id: {$ne: business._id}
        })
        if (other) {
            return res
            .status(409)
            .json(new ApiResponse(409, {existingBusinessId: other._id}, "New owner already has a business"))
        }
    
        // Transfer
        business.ownerId = newOwnerId
        await business.save()
    
        return res
        .status(200)
        .json(new ApiResponse(
            200, {business}, "Ownership transferred successfully"
        ))
    } catch (error) {
        console.log("Error: ", error);
        throw new ApiError(401, "Internal server error")
    }
})