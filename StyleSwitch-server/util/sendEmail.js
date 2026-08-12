const sendEmail = async ({ to, subject, text }) => {
    try {
        const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();

        const data = {
            sender: {
                name: "Real Estate Management",
                email: process.env.BREVO_SENDER_EMAIL?.trim()
            },
            to: [
                {
                    email: to
                }
            ],
            subject,
            htmlContent: text
        };

        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",
                headers: {
                    "api-key": BREVO_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        const result = await response.json();

        console.log("Sending email to:", to);

        if (response.ok) {
            console.log("Email sent successfully:", result);
            return result;
        }

        throw new Error(result.message || "Failed to send email");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export default sendEmail;