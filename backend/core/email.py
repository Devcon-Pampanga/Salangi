import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

def send_verification_email(to_email: str, token: str):
    base_url = os.getenv("BASE_URL", "http://localhost:8000")
    verification_link = f"{base_url}/api/auth/verify-email?token={token}"

    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": to_email,
        "subject": "Verify your Salangi email",
        "html": f"""
        <h2>Email Verification</h2>
        <p>Hi! Thanks for registering on Salangi.</p>
        <p>Click the link below to verify your email address:</p>
        <a href="{verification_link}">{verification_link}</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not register, please ignore this email.</p>
        """
    })