import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def send_verification_email(to_email: str, token: str):
    base_url = os.getenv("BASE_URL", "http://localhost:8000")
    verification_link = f"{base_url}/api/auth/verify-email?token={token}"

    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")
    mail_from = os.getenv("MAIL_FROM")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Verify your Salangi email"
    msg["From"] = mail_from
    msg["To"] = to_email

    html = f"""
    <h2>Email Verification</h2>
    <p>Hi! Thanks for registering on Salangi.</p>
    <p>Click the link below to verify your email address:</p>
    <a href="{verification_link}">{verification_link}</a>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not register, please ignore this email.</p>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(mail_username, mail_password)
        server.sendmail(mail_from, to_email, msg.as_string())