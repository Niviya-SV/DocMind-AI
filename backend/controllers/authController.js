const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const sendPasswordResetEmail = async (email, resetUrl) => {
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASSWORD,
        MAIL_FROM,
    } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
        throw new Error(
            "Password reset email is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASSWORD."
        );
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT || 587) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: MAIL_FROM || SMTP_USER,
        to: email,
        subject: "Reset your DocMind AI password",
        text: `Use this link to reset your DocMind AI password: ${resetUrl}\n\nThis link expires in 15 minutes.`,
        html: `<p>Use the link below to reset your DocMind AI password:</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 15 minutes.</p>`,
    });
};

// =============================
// REGISTER
// =============================
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


// =============================
// LOGIN
// =============================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const requestPasswordReset = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await User.findOne({ email });

        // Do not reveal whether an account exists.
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists, a password reset email has been sent.",
            });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4028";
        await sendPasswordResetEmail(
            user.email,
            `${frontendUrl}/reset-password?token=${rawToken}`
        );

        return res.status(200).json({
            success: true,
            message: "If an account exists, a password reset email has been sent.",
        });
    } catch (error) {
        console.error("Password reset request error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Could not send password reset email.",
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const token = String(req.body.token || "");
        const password = String(req.body.password || "");

        if (!token || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "A reset token and a password of at least 6 characters are required.",
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() },
        }).select("+passwordResetToken +passwordResetExpires");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "This reset link is invalid or has expired.",
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Please log in again.",
        });
    } catch (error) {
        console.error("Password reset error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not reset password.",
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPassword,
};