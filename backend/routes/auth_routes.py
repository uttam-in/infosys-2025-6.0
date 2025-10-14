from fastapi import APIRouter, Depends, Header
from models.user import UserRegister, UserLogin, TokenResponse
from controllers.auth_controller import register_user, login_user, logout_user
from utils.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    return register_user(user_data)

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    return login_user(user_data)

@router.post("/logout")
async def logout(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid authorization")
    token = authorization.replace("Bearer ", "")
    return logout_user(token)

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
