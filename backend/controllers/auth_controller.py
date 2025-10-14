from fastapi import HTTPException
from models.user import UserRegister, UserLogin, UserResponse, TokenResponse
from utils.auth import hash_password, verify_password, generate_token
from database import get_db

def register_user(user_data: UserRegister) -> TokenResponse:
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", 
                      (user_data.username, user_data.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already exists")
        
        # Create user
        password_hash = hash_password(user_data.password)
        cursor.execute("""
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        """, (user_data.username, user_data.email, password_hash))
        
        user_id = cursor.lastrowid
        
        # Generate token
        token = generate_token()
        cursor.execute("INSERT INTO tokens (user_id, token) VALUES (?, ?)", 
                      (user_id, token))
        
        conn.commit()
        
        user = UserResponse(id=user_id, username=user_data.username, email=user_data.email)
        return TokenResponse(token=token, user=user)

def login_user(user_data: UserLogin) -> TokenResponse:
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Find user
        cursor.execute("SELECT id, username, email, password_hash FROM users WHERE username = ?", 
                      (user_data.username,))
        user = cursor.fetchone()
        
        if not user or not verify_password(user_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Generate token
        token = generate_token()
        cursor.execute("INSERT INTO tokens (user_id, token) VALUES (?, ?)", 
                      (user["id"], token))
        
        conn.commit()
        
        user_response = UserResponse(id=user["id"], username=user["username"], email=user["email"])
        return TokenResponse(token=token, user=user_response)

def logout_user(token: str) -> dict:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tokens WHERE token = ?", (token,))
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Token not found")
        
        return {"message": "Logged out successfully"}
