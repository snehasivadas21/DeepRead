import hashlib
import secrets

def generate_verication_token() -> str:
    return secrets.token_urlsafe(32)

def hash_verification_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
