"use server";
import { Resend } from "resend";
import EmailTemplate from "@/emails/template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMonthlyReportEmail({
  to,
  stats,
  month,
  userName = "Valued User",
  insights = [],
  type = "monthly-report",
  subject,
  react,
}) {
  try {
    const recipient = Array.isArray(to) ? to : [to];
    const emailSubject = subject || `Monthly Financial Report - ${month || ""}`;
    const emailReact = react || (
      <EmailTemplate
        userName={userName}
        type={type}
        data={{ month, stats, insights }}
      />
    );

    const data = await resend.emails.send({
      from: "SmartSpend AI <onboarding@resend.dev>",
      to: recipient,
      subject: emailSubject,
      react: emailReact,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
}

export const sendEmail = sendMonthlyReportEmail;
