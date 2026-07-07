// ─── Import PDFKit library ──────────────────────────────────────
const PDFDocument = require("pdfkit");

// ─── Utility function to generate a ticket PDF ──────────────────
const generateTicketPDF = (registration, qrDataURL) => {
    // Creating a new PDF Document (A6 size is perfect for pocket tickets)
    const doc = new PDFDocument({ size: "A6", margin: 15 });

    // ── Draw Header Background ────────────────────────────────────
    doc.rect(0, 0, 298, 80) // Draw rectangle (x, y, width, height)
        .fill("#667eea");    // Fill it with primary brand color

    // ── Draw Header Text ──────────────────────────────────────────
    doc.fillColor("#ffffff")                     // Set text color to white
        .fontSize(16)                             // Set font size
        .text("EVENT TICKET", 15, 20, { align: "center" }); // Center align

    // ── Draw Event Title ──────────────────────────────────────────
    doc.fillColor("#333333")                     // Set text color to dark grey
        .fontSize(14)
        .text(registration.event.title, 15, 95, { width: 268, align: "center" });

    // ── Draw Ticket Details ───────────────────────────────────────
    doc.fontSize(10)
        .fillColor("#555555")
        .text(`Name: ${registration.user.name}`, 15, 130)
        .text(`Ticket No: ${registration.ticketNumber}`, 15, 145);

    // ── Embed the QR Code image ───────────────────────────────────
    if (qrDataURL) {
        // qrDataURL is base64 string: "data:image/png;base64,..."
        doc.image(qrDataURL, 74, 180, { width: 150, height: 150 });
    }

    // ── Finalize the PDF Document structure ────────────────────────
    doc.end();

    // Return the document stream to the caller
    return doc;
};

module.exports = generateTicketPDF;
