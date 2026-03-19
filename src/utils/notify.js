// utils/notify.js
const nodemailer = require('nodemailer');
// ၁။ Transporter ကို တည်ဆောက်ပါ (Gmail configuration)
const transporter = nodemailer.createTransport({
  
  service: 'gmail',
  auth: {
    user: 'linthu2033@gmail.com', // သင့် Gmail
    pass: 'smzj lapl iaxv fibv' // ခုနကရလာတဲ့ 16 လုံးပါ password
  }
});
console.log("User:", process.env.MYEMAIL); 
console.log("Pass exists:", !!process.env.APPMAILKEY);
exports.sendBookingEmail = async (to, bookingId, voucher) => {
  try {
    // ၂။ Email content ကို ပြင်ဆင်ပါ
    const mailOptions = {
      from: '"H-Booking Support" <' + 'linthu2033@gmail.com' + '>',
      to: to,
      subject: `Booking Confirmation - ID: ${bookingId}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #2196F3;">Booking Successful!</h2>
          <p>Thank you for booking with us.</p>
          <p><b>Booking ID:</b> ${bookingId}</p>
          <p><b>Voucher Code:</b> <span style="background: #f4f4f4; padding: 5px 10px;">${voucher}</span></p>
          <br>
          <p>Enjoy your stay!</p>
        </div>
      `
    };

    // ၃။ Email ပို့ပါ
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Email error:", error);
    return false;
  }
};


exports.sendSMS = async (phone, bookingId) => {
  console.log(`📱 SMS sent to ${phone} → Booking ID: ${bookingId}`);
  return true;
};