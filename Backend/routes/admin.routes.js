import express from "express";
import { isLoggedIn, authorizedRoles } from "../middlewares/auth.middlewares.js";
import {
  getAdminInfo,
  getAdminUsers,
  getAdminStatsUsers,
} from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes require login and admin role
router.use(isLoggedIn, authorizedRoles("admin"));

router.get("/", getAdminInfo);
router.get("/users", getAdminUsers);
router.get("/stats/users", getAdminStatsUsers);

export default router;
