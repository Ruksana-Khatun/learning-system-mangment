import ErrorApp from "../utils/error.utils.js";
import sendEmail from "../utils/sendEmail.js";

export const contactUs = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return next(new ErrorApp("All fields are mandatory", 400));
    }

    const toEmail = process.env.CONTACT_US_EMAIL || process.env.SMTP_FROM_EMAIL;
    if (!toEmail) {
      return next(
        new ErrorApp("Contact email not configured on server", 500)
      );
    }

    const htmlMessage = `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail({
      email: toEmail,
      subject: "New contact form message",
      message: htmlMessage,
    });

    res.status(200).json({
      success: true,
      message: "Form submitted successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return next(
      new ErrorApp(error.message || "Failed to submit contact form", 500)
    );
  }
};

