import nodemailer from "nodemailer";

interface OrderItem {
  name: string;
  quantity: number;
  amount: number;
}

interface OrderDetails {
  items: OrderItem[];
  totalAmount: number;
  merchantReferenceId: string;
}

interface SendEmailParams {
  subject: string;
  text: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendEmail = async ({ subject, text, html }: SendEmailParams) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail credentials are not configured");
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: "constehf@gmail.com",
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const generateCustomerEmailContent = ({ items, totalAmount }: OrderDetails) => {
  const html = `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <h2>Order Details:</h2>
    <ul>
      ${items
        .map(
          (item) => `
        <li>${item.name} - Quantity: ${item.quantity} - Price: ${item.amount} ISK</li>
      `
        )
        .join("")}
    </ul>
    <p>Total Amount: ${totalAmount} ISK</p>
  `;

  const text = `
    Order Confirmation
    Thank you for your order!
    
    Order Details:
    ${items
      .map(
        (item) =>
          `${item.name} - Quantity: ${item.quantity} - Price: ${item.amount} ISK`
      )
      .join("\n")}
    
    Total Amount: ${totalAmount} ISK
  `;

  return { html, text };
};

const generateCompanyEmailContent = ({
  items,
  totalAmount,
  merchantReferenceId,
}: OrderDetails) => {
  const html = `
    <h1>New Order Received</h1>
    <p>Reference ID: ${merchantReferenceId}</p>
    <h2>Order Details:</h2>
    <ul>
      ${items
        .map(
          (item) => `
        <li>${item.name} - Quantity: ${item.quantity} - Price: ${item.amount} ISK</li>
      `
        )
        .join("")}
    </ul>
    <p>Total Amount: ${totalAmount} ISK</p>
  `;

  const text = `
    New Order Received
    Reference ID: ${merchantReferenceId}
    
    Order Details:
    ${items
      .map(
        (item) =>
          `${item.name} - Quantity: ${item.quantity} - Price: ${item.amount} ISK`
      )
      .join("\n")}
    
    Total Amount: ${totalAmount} ISK
  `;

  return { html, text };
};

export const sendOrderConfirmationEmail = async (
  orderDetails: OrderDetails
) => {
  const { html, text } = generateCustomerEmailContent(orderDetails);
  await sendEmail({
    subject: "Order Confirmation - Kínaskák",
    text,
    html,
  });
};

export const sendCompanyNotificationEmail = async (
  orderDetails: OrderDetails
) => {
  const { html, text } = generateCompanyEmailContent(orderDetails);
  await sendEmail({
    subject: `New Order Received - Reference: ${orderDetails.merchantReferenceId}`,
    text,
    html,
  });
};
