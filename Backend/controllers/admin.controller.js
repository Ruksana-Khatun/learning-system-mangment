import ErrorApp from "../utils/error.utils.js";
import User from "../models/user.model.js";
import payment from "../models/payment.model.js";

/**
 * GET /api/admin or /api/admin/
 * Simple admin area check / dashboard info
 */
export const getAdminInfo = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Admin area",
      links: { users: "/api/admin/users", stats: "/api/admin/stats/users" },
    });
  } catch (e) {
    return next(new ErrorApp(e.message, 500));
  }
};

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password -forgotPasswordToken -forgotPasswordExpiryDate")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Users list",
      users,
      count: users.length,
    });
  } catch (e) {
    return next(new ErrorApp(e.message || "Failed to fetch users", 500));
  }
};

/**
 * GET /api/admin/stats/users (or /api/v1/admin/stats/users)
 * Returns allUsersCount and subscribedUsersCount for admin dashboard
 */
export const getAdminStatsUsers = async (req, res, next) => {
  try {
    const allUsersCount = await User.countDocuments();
    const subscribedUserIds = await payment.distinct("userId");
    const subscribedUsersCount = subscribedUserIds.length;
    res.status(200).json({
      success: true,
      message: "Stats fetched",
      allUsersCount,
      subscribedUsersCount,
    });
  } catch (e) {
    return next(new ErrorApp(e.message || "Failed to fetch stats", 500));
  }
};
