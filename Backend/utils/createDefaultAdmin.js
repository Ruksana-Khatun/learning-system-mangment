// Backend/utils/createDefaultAdmin.js
import User from "../models/user.model.js";

export const createDefaultAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  let user = await User.findOne({ email: adminEmail });

  if (!user) {
    // pre-save hook in user.model will hash the password
    await User.create({
      fullName: "Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
    console.log("✅ Default admin created:", adminEmail);
  } else if (user.role !== "admin") {
    user.role = "admin";
    await user.save();
    console.log("✅ Existing user promoted to admin:", adminEmail);
  } else {
    console.log("ℹ️ Admin already exists:", adminEmail);
  }
};