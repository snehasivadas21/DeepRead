from app.worker.celery_app import celery_app
from app.services.email import send_verification_email, send_password_reset_email

@celery_app.task
def send_verification_email_task(recipient: str,verification_url: str) -> None:
    
    send_verification_email(recipient=recipient,verification_url=verification_url),

@celery_app.task
def send_password_reset_email_task(recipient: str,reset_url: str) -> None:

    send_password_reset_email(recipient=recipient,reset_url=reset_url)
   