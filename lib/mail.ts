// In order to send email we need some custom node code.
//  We need to create a transporter to hook up to a smtp API and sendout email

import { createTransport, getTestMessageUrl } from 'nodemailer';

const transport = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function makeEmail(text: string): string {
  return `
    <div style="
      border: 1px solid black;
      padding:20px;
      font-family: sans-serif;
      line-height: 2;
      font-size:20px;
    ">
      <h2>Hello</h2>
      <p>${text}</p>
      <p>Jonny Sneaks</p>
    </div>
  `;
}

export async function sendPasswordResetEmail(
  resetToken: string,
  to: string
): Promise<void> {
  // email the user a token
  const info = await transport.sendMail({
    to,
    from: 'test@example.com',
    subject: 'Password reset token',
    html: makeEmail(`Your password reset token
      <a href="${process.env.FRONTEND_URL}/reset?token=${resetToken}">Click to reset</a>
    `),
  });
  // console.log(info);
  //  to have an url of the email to check if sending was ok in DEV for ethereal email
  if (process.env.MAIL_USER.includes('ethereal.email')) {
    console.log(`📧 Message sent! Preview it at : ${getTestMessageUrl(info)}`);
  }
}
