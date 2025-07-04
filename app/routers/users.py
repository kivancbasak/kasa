from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_users():
    """Get all users (admin only)"""
    return {"message": "User management - coming soon"}

@router.get("/{user_id}")
async def get_user(user_id: int):
    """Get specific user"""
    return {"message": f"User {user_id} - coming soon"} 