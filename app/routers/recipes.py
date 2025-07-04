from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_recipes():
    """Get all recipes"""
    return {"message": "Recipe wiki - coming soon"}

@router.get("/{recipe_id}")
async def get_recipe(recipe_id: int):
    """Get specific recipe"""
    return {"message": f"Recipe {recipe_id} - coming soon"} 