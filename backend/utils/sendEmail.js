// ─── Import Nodemailer ───────────────────────────────────────────
const nodemailer = require("nodemailer");

// ════════════════════════════════════════════════════════════════
// Create a reusable transporter (the "email sender" object)
// A transporter holds the SMTP config — created once, reused always
// ════════════════════════════════════════════════════════════════
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,   // "smtp.gmail.com"
        port: process.env.EMAIL_PORT,   // 587 (TLS) or 465 (SSL)
        secure: false,                  // false for port 587 (uses STARTTLS)
        // secure: true  → uses SSL (port 465)
        // secure: false → upgrades to TLS after connection (port 587) ← recommended
        auth: {
            user: process.env.EMAIL_USER, // your Gmail address
            pass: process.env.EMAIL_PASS, // your Gmail App Password (NOT real password)
        },
    });
};

// ════════════════════════════════════════════════════════════════
// Build the HTML email template for ticket confirmation
// ════════════════════════════════════════════════════════════════
const buildTicketEmailHTML = ({ userName, eventTitle, eventDate,
    eventLocation, startTime, ticketNumber, qrImage, qrCode }) => {
    // Format the date to human-readable: "December 15, 2025"
    const formattedDate = new Date(eventDate).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
    });

    // Email clients only support inline CSS — no stylesheets!
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:20px;">

      <!-- Email container -->
      <div style="max-width:600px; margin:auto; background:#ffffff;
                  border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

        <!-- Header banner -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 30px; text-align:center;">
          <h1 style="color:white; margin:0; font-size:28px;">🎫 Booking Confirmed!</h1>
          <p style="color:rgba(255,255,255,0.85); margin:8px 0 0;">
            You're going to ${eventTitle}
          </p>
        </div>

        <!-- Body content -->
        <div style="padding: 30px;">
          <p style="font-size:16px; color:#333;">Hi <strong>${userName}</strong>,</p>
          <p style="color:#555;">Your registration is confirmed. Here are your event details:</p>

          <!-- Event details box -->
          <div style="background:#f8f9ff; border-left:4px solid #667eea;
                      padding:20px; border-radius:8px; margin:20px 0;">
            <h2 style="margin:0 0 15px; color:#333;">${eventTitle}</h2>
            <p style="margin:6px 0; color:#555;">
              📅 <strong>Date:</strong> ${formattedDate}
            </p>
            <p style="margin:6px 0; color:#555;">
              🕐 <strong>Time:</strong> ${startTime}
            </p>
            <p style="margin:6px 0; color:#555;">
              📍 <strong>Location:</strong> ${eventLocation}
            </p>
            <p style="margin:6px 0; color:#555;">
              🎟️ <strong>Ticket Number:</strong>
              <span style="font-family:monospace; font-size:16px;
                           background:#667eea; color:white;
                           padding:2px 8px; border-radius:4px;">
                ${ticketNumber}
              </span>
            </p>
            <p style="margin:6px 0; color:#555;">
              🔑 <strong>Ticket ID (UUID):</strong>
              <span style="font-family:monospace; font-size:14px;
                           background:#f3f4f6; color:#1f2937;
                           padding:2px 8px; border-radius:4px;">
                ${qrCode}
              </span>
            </p>
          </div>

          <!-- QR code section -->
          <div style="text-align:center; margin:30px 0;">
            <p style="color:#333; font-weight:bold; font-size:16px; margin-bottom:10px;">
              Your Entry QR Code
            </p>
            <p style="color:#777; font-size:13px; margin-bottom:15px;">
              Show this at the venue entrance for check-in
            </p>
            <!-- qrImage is inline attached as a CID attachment for Gmail support -->
            <img src="cid:qrCodeImage" alt="QR Code"
                 style="width:200px; height:200px; border:3px solid #667eea;
                         border-radius:12px; padding:8px;" />
          </div>

          <!-- Footer note -->
          <div style="border-top:1px solid #eee; padding-top:20px; margin-top:20px;">
            <p style="color:#999; font-size:12px; text-align:center;">
              ⚠️ Do not share this QR code. It is unique to your registration.<br/>
              If you have any questions, contact the event organizer.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ════════════════════════════════════════════════════════════════
// Main function to send the ticket email
// ════════════════════════════════════════════════════════════════
const sendTicketEmail = async ({ toEmail, userName, eventTitle,
    eventDate, eventLocation, startTime, ticketNumber, qrImage, qrCode }) => {

    // ── Create the transporter ───────────────────────────────────
    const transporter = createTransporter();

    // ── Build the HTML content ───────────────────────────────────
    const html = buildTicketEmailHTML({
        userName, eventTitle, eventDate,
        eventLocation, startTime, ticketNumber, qrImage, qrCode,
    });

    // ── Define the email options (the "envelope") ────────────────
    const mailOptions = {
        from: process.env.EMAIL_FROM,  // "QR Events <yourname@gmail.com>"
        to: toEmail,                   // recipient's email
        subject: `🎫 Your Ticket for ${eventTitle}`,
        html,                          // our HTML template
        attachments: [
            {
                filename: "qrcode.png",
                content: qrImage.split("base64,")[1], // extract raw base64 data (without header prefix)
                encoding: "base64",
                cid: "qrCodeImage", // must match src="cid:qrCodeImage" in HTML
            }
        ]
    };

    // ── Send the email ───────────────────────────────────────────
    const info = await transporter.sendMail(mailOptions);
    // info.messageId → the email's unique ID
    console.log("Email sent:", info.messageId);

    return info;
};

// ─── Export ─────────────────────────────────────────────────────
module.exports = sendTicketEmail;
