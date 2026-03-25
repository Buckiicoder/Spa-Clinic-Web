import nodemailer from "nodemailer";

export const sendOTPEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "OTP xác thực",
    html: `<h2>Mã OTP của bạn là: ${otp}</h2>
    <h5>Mã chỉ có thời hạn trong vòng 5 phút. Vui lòng nhập mã trước khi hết hạn</h5>`,
  });
};