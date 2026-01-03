const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
require('dotenv').config();

// Configure transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // User's gmail
        pass: process.env.EMAIL_PASS  // User's app password
    }
});

/**
 * Generates a QR Code for the booking ID
 * @param {string} text 
 * @returns {Promise<string>} dataURL
 */
const generateQRCode = async (text) => {
    try {
        return await QRCode.toDataURL(text);
    } catch (err) {
        console.error("QR Generation Error:", err);
        return null;
    }
};

/**
 * Sends a confirmation email with QR code
 * @param {string} toEmail 
 * @param {object} bookingDetails 
 * @param {object} eventDetails 
 */
const sendConfirmationEmail = async (toEmail, bookingDetails, eventDetails) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Email credentials missing. Skipping email.");
        return;
    }

    const qrCodeUrl = await generateQRCode(bookingDetails.id);

    const mailOptions = {
        from: '"CornerClub Events" <' + process.env.EMAIL_USER + '>',
        to: toEmail,
        subject: `Booking Confirmed: ${eventDetails.title}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
                    <h1>You're Going!</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hi ${bookingDetails.user.name || 'there'},</p>
                    <p>Your booking for <strong>${eventDetails.title}</strong> has been confirmed.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Date:</strong> ${new Date(eventDetails.date).toDateString()}</p>
                        <p><strong>Time:</strong> ${eventDetails.time}</p>
                        <p><strong>Location:</strong> ${eventDetails.location}, ${eventDetails.city}</p>
                        <p><strong>Quantity:</strong> ${bookingDetails.quantity}</p>
                        <p><strong>Total Paid:</strong> ₹${bookingDetails.totalPrice}</p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <p>Scan this QR code at the entrance:</p>
                        <img src="${qrCodeUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px;" />
                        <p style="font-size: 12px; color: #777;">Booking ID: ${bookingDetails.id}</p>
                    </div>

                    <p>See you there!</p>
                    <p style="margin-top: 30px; font-size: 12px; color: #888;">CornerClub Team</p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendConfirmationEmail };

/**
 * Sends a booking notification to the Organizer and Admin
 * @param {string} organizerEmail 
 * @param {string} adminEmail 
 * @param {object} bookingDetails 
 * @param {object} eventDetails 
 */
const sendBookingNotification = async (organizerEmail, adminEmail, bookingDetails, eventDetails) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Email credentials missing. Skipping notification email.");
        return;
    }

    const recipients = [organizerEmail, adminEmail].filter(Boolean).join(',');

    const mailOptions = {
        from: '"CornerClub Events" <' + process.env.EMAIL_USER + '>',
        to: recipients,
        subject: `New Booking: ${eventDetails.title}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #f98109; color: #fff; padding: 20px; text-align: center;">
                    <h1>New Ticket Sold!</h1>
                </div>
                <div style="padding: 20px;">
                    <p><strong>Event:</strong> ${eventDetails.title}</p>
                    <p><strong>Date:</strong> ${new Date(eventDetails.date).toDateString()}</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>Attendee Details</h3>
                        <p><strong>Name:</strong> ${bookingDetails.user.name}</p>
                        <p><strong>Phone:</strong> ${bookingDetails.user.phone}</p>
                        <p><strong>Quantity:</strong> ${bookingDetails.quantity}</p>
                        <p><strong>Total Paid:</strong> ₹${bookingDetails.totalPrice}</p>
                    </div>

                    <p style="font-size: 12px; color: #777;">Booking ID: ${bookingDetails.id}</p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Notification Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending notification email:', error);
        return false;
    }
};

module.exports = { sendConfirmationEmail, sendBookingNotification };
