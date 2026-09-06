from pwdlib import PasswordHash
import hashlib
import secrets

password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> str:
    return password_hash.verify(plain_password,hashed_password)

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def generate_password_reset_token() -> str:
    return secrets.token_urlsafe(32)

def hash_password_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest() 
