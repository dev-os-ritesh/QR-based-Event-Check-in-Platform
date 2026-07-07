// ─── Import the qrcode library ──────────────────────────────────
const QRCode = require("qrcode");

// ─── Function to generate QR code as base64 image string ────────
const generateQRCode = async (text) => {
    try {
        // QRCode.toDataURL(text, options)
        // text    → the string to encode (our UUID)
        // options → customize size, color, error correction
        const qrDataURL = await QRCode.toDataURL(text, {
            errorCorrectionLevel: "H", // H = High (30% of QR can be damaged and still readable)
            // L=7%, M=15%, Q=25%, H=30% — higher = bigger QR but more resilient
            type: "image/png",         // output as PNG
            quality: 0.95,             // PNG compression quality
            margin: 1,                 // quiet zone (white border) around QR
            width: 300,                // width in pixels (300x300)
            color: {
                dark: "#000000",         // black squares
                light: "#FFFFFF",        // white background
            },
        });

        // qrDataURL = "data:image/png;base64,iVBORw0KGgoAAAANS..."
        // This entire string is the QR code image — frontend uses it directly
        return qrDataURL;

    } catch (error) {
        throw new Error("QR Code generation failed: " + error.message);
    }
};

// ─── Export ─────────────────────────────────────────────────────
module.exports = generateQRCode;
