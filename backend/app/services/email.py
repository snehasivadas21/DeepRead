import smtplib
from email.message import EmailMessage

from app.core.config import settings

def send_verification_email(recipient: str,verification_url: str,) -> None:
    message = EmailMessage()
    message["From"] = settings.MAIL_FROM
    message["To"] = recipient
    message["Subject"] = "Verify your DeepRead account"

    body = f"""
Hello,

Welcome to DeepRead!

Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 24 hours.

If you did not create a DeepRead account, you can ignore this email.

Regards,
DeepRead Team
"""
    message.set_content(body)

    with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
        server.starttls()
        server.login(settings.MAIL_USERNAME,settings.MAIL_PASSWORD,)
        server.send_message(message)
        

def send_password_reset_email(recipient: str,reset_url: str,) -> None:
    message = EmailMessage()
    message["From"] = settings.MAIL_FROM
    message["To"] = recipient
    message["Subject"] = "Reset your DeepRead password"

    body = f"""
Hello,

We received a request to reset your DeepRead password.

Click the link below to reset it:

{reset_url}

This link will expire in 30 minutes.

If you did not request a password reset, you can ignore this email.

Regards,
DeepRead Team
"""

    message.set_content(body)

    with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
        server.starttls()
        server.login(settings.MAIL_USERNAME,settings.MAIL_PASSWORD,)
        server.send_message(message)