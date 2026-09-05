from app.worker.celery_app import celery_app
from app.services.email import send_verification_email

@celery_app.task
def send_verification_email_task(recipient: str,verification_url: str) -> None:
    
    send_verification_email(recipient=recipient,
                            verification_url=verification_url),

@celery_app.task
def test_task():
    print("Celery task executed successfully")
    return "Success"

