import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const RESEND_API = process.env.RESEND_API;
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

async function run() {
  if (!RESEND_API) {
    console.error("RESEND_API key is missing in your .env file!");
    process.exit(1);
  }

  console.log("Initializing Resend client...");
  const resend = new Resend(RESEND_API);

  // We will try sending a test email to a likely test address.
  // Note: On Resend's free tier, without a custom domain, you can ONLY send to your registered email address.
  const testRecipient = "kamtisumit685@gmail.com";

  console.log(`Attempting to send test email to ${testRecipient} from ${EMAIL_FROM}...`);

  try {
    const { data, error } = await resend.emails.send({
      from: `LiveChat test <${EMAIL_FROM}>`,
      to: testRecipient,
      subject: "Resend Integration Check",
      html: "<h3>Your Resend API Key is working!</h3><p>This confirms your account is eligible to send emails.</p>"
    });

    if (error) {
      console.error("\n❌ Resend API returned an error:", error.message || error);
      console.log("\nEligibility Info:");
      if (error.message && error.message.includes("restriction")) {
        console.log("-> You are eligible, but you must send emails ONLY to your own Resend registered email address (e.g. the email you signed up with).");
      }
      process.exit(1);
    }

    console.log("\n🎉 SUCCESS! Resend email sent successfully!");
    console.log("Response data:", data);
    console.log("\nEligibility Info: You are 100% eligible and your API key is fully working!");
  } catch (err) {
    console.error("\n❌ Runtime error checking Resend eligibility:", err.message);
    process.exit(1);
  }
}

run();
