const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.API_KEY);
const sendWelcomeEmail = (name, email) => {
  sgMail.send({
    to: email,
    from: "uname6157@gmail.com",
    subject: "Thanks for joining in!",
    text: `Welcome to Task Manager App, ${name}. Let me know how you get along with the app.`,
  });
};

const sendCalcellationEmail = (name, email) => {
  sgMail.send({
    to: email,
    from: "uname6157@gmail.com",
    subject: "Account deletion request.",
    html: `
      <h2>Hi ${name},</h2>
      <p>First of all, we appreciate you being part of the our company.</p>
      <p>As per your request, your account has been deleted.</p>
      <p>We’d like to learn the reason behind your accout deletion so we can better serve our customers (and hopefully you!) in the future.</p>
      <p>Thanks!</p>
    `,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCalcellationEmail,
};
