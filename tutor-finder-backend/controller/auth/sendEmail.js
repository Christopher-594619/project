const nodemailer = require("nodemailer");
const { db } = require("../../modal/db");

// In-memory store for verification codes
const verificationCodes = new Map();

// Clean up expired codes every hour
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
    }
  }
}, 60 * 60 * 1000);

// Generate a random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send code to the user's email address
const sendEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const [rows] = await db.promise().query(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );

    const user = rows[0];

    if (user) {
      return res.status(409).json({
        success: false,
        available: false,
        message: "User already exists!",
      });
    }

    // Generate 6-digit verification code
    const code = generateVerificationCode();
    
    verificationCodes.set(email, {
      code: code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // YOUR ORIGINAL TRANSPORTER - KEPT EXACTLY THE SAME
    const transporter = nodemailer.createTransport({
      host: "mail.zisecretaries.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"RapOnBeats" <${process.env.EMAIL_ADDRESS}>`,
      to: email,
      subject: "RapOnBeats - Email Verification Code",
      text: `Your RapOnBeats verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this code, please ignore this message.\n\n---\nRapOnBeats — Discover African Music.`,
      html: `
      <!DOCTYPE html>
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tutor Finder Email Verification</title>
      </head>
      <body style="margin:0;padding:0;background-color:#F0F9FF;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

        <!-- MAIN CONTAINER -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 50%, #F5F3FF 100%);padding:60px 20px;">
          <tr>
            <td align="center">

              <!-- INNER CARD -->
              <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;background-color:#FFFFFF;border-radius:24px;border:1px solid #E5E7EB;box-shadow:0 20px 60px rgba(14, 165, 233, 0.08), 0 4px 20px rgba(0,0,0,0.04);">
                <tr>
                  <td style="padding:56px 56px 40px 56px;">

                    <!-- LOGO -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom:36px;">
                          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-block;">
                            <tr>
                              <td style="background:linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%);border-radius:14px;padding:12px 18px;box-shadow:0 4px 12px rgba(14, 165, 233, 0.3);">
                                <span style="font-size:20px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">Tutor Finder</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- DIVIDER -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:36px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="height:2px;background:linear-gradient(90deg, #0EA5E9 0%, #8B5CF6 100%);border-radius:2px;"></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- ICON -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom:24px;">
                          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-block;background:linear-gradient(135deg, #E0F2FE 0%, #EDE9FE 100%);border-radius:50%;padding:20px;">
                            <tr>
                              <td style="font-size:40px;line-height:1;">🎓</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- HEADING -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom:12px;">
                          <h1 style="margin:0;font-size:28px;font-weight:700;color:#0C4A6E;letter-spacing:-0.5px;line-height:1.2;">
                            Verify Your Email
                          </h1>
                        </td>
                      </tr>
                    </table>

                    <!-- SUBTEXT -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom:36px;">
                          <p style="margin:0;font-size:16px;line-height:1.6;color:#64748B;">
                            Enter the verification code to complete your<br />
                            <span style="font-weight:500;color:#0C4A6E;">Tutor Finder</span> account setup
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- VERIFICATION CODE CARD -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);border-radius:16px;border:2px dashed #E2E8F0;padding:40px 24px;margin-bottom:32px;position:relative;">
                      <tr>
                        <td align="center">
                          <!-- Decorative dots -->
                          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-block;margin-bottom:16px;">
                            <tr>
                              <td style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%);margin:0 4px;"></td>
                              <td style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%);margin:0 4px;opacity:0.7;"></td>
                              <td style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%);margin:0 4px;opacity:0.4;"></td>
                            </tr>
                          </table>
                          <div style="display:block;font-size:48px;font-weight:600;letter-spacing:16px;color:#0C4A6E;font-family:'Courier New',monospace;background:#FFFFFF;padding:16px 24px;border-radius:12px;border:1px solid #E2E8F0;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                            ${code}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- EXPIRY NOTICE -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom:28px;">
                          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-block;background:#F0F9FF;border-radius:20px;padding:8px 16px;">
                            <tr>
                              <td style="font-size:13px;color:#0284C7;">
                                ⏱️ This code expires in <span style="font-weight:600;color:#0369A1;">10 minutes</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- SECURITY INFO -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg, #F0F9FF 0%, #F5F3FF 100%);border-radius:12px;padding:20px 24px;margin-bottom:12px;border:1px solid #E0F2FE;">
                      <tr>
                        <td align="center">
                          <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
                            🔒 This verification is for <span style="font-weight:600;color:#0C4A6E;">${email}</span>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- HELP TEXT -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-top:20px;">
                          <p style="margin:0;font-size:13px;color:#94A3B8;">
                            Didn't request this? You can safely ignore this email.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- FOOTER -->
              <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;margin-top:36px;">
                <tr>
                  <td align="center" style="padding:0 20px;">
                    <!-- Social Icons -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="padding:0 8px;">
                          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-block;background:#E2E8F0;border-radius:50%;padding:8px;">
                            <tr><td style="font-size:14px;color:#64748B;">🐦</td></tr>
                          </table>
                        </td>
                        <td style="padding:0 8px;">
                          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-block;background:#E2E8F0;border-radius:50%;padding:8px;">
                            <tr><td style="font-size:14px;color:#64748B;">📘</td></tr>
                          </table>
                        </td>
                        <td style="padding:0 8px;">
                          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-block;background:#E2E8F0;border-radius:50%;padding:8px;">
                            <tr><td style="font-size:14px;color:#64748B;">🔗</td></tr>
                          </table>
                        </td>
                        <td style="padding:0 8px;">
                          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-block;background:#E2E8F0;border-radius:50%;padding:8px;">
                            <tr><td style="font-size:14px;color:#64748B;">📺</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 16px 0;font-size:13px;color:#94A3B8;line-height:1.6;">
                      This email was sent because a verification request was made for your Tutor Finder account.
                    </p>
                    <p style="margin:0 0 20px 0;font-size:13px;color:#94A3B8;line-height:1.6;">
                      If you did not request this verification, you can safely ignore this email.
                    </p>
                    <p style="margin:0;font-size:12px;color:#CBD5E1;">
                      &copy; 2024 <span style="color:#64748B;">Tutor Finder</span>. All rights reserved.
                    </p>
                    <p style="margin:8px 0 0 0;font-size:11px;color:#CBD5E1;">
                      Made with ❤️ in Zambia
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`Verification code ${code} sent to ${email}`);

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
    });

  } catch (error) {
    console.error("Email sending error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send verification email",
      error: error.message,
    });
  }
};

// Verify the code
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required",
      });
    }

    const storedData = verificationCodes.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one.",
      });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Code expired. Please request a new one.",
      });
    }

    if (storedData.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid code. Please try again.",
      });
    }

    verificationCodes.delete(email);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify code",
    });
  }
};

module.exports = { sendEmail, verifyCode };