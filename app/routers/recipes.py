from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Recipe, RecipeType, RecipeItem, RecipeItemType, User, UserRole
from app.utils.auth import verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def admin_or_chef(user: User = Depends(get_current_user)):
    if user.role not in [UserRole.ADMIN, UserRole.CHEF]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return user

@router.get("/", response_model=List[dict])
def list_recipes(db: Session = Depends(get_db)):
    recipes = db.query(Recipe).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "type": r.type,
            "is_active": r.is_active,
            "stores": r.stores
        } for r in recipes
    ]

@router.get("/{recipe_id}", response_model=dict)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    items = db.query(RecipeItem).filter(RecipeItem.recipe_id == recipe.id).all()
    return {
        "id": recipe.id,
        "name": recipe.name,
        "type": recipe.type,
        "is_active": recipe.is_active,
        "stores": recipe.stores,
        "items": [
            {
                "id": i.id,
                "item_type": i.item_type,
                "item_name": i.item_name,
                "unit": i.unit,
                "amount": i.amount,
                "halfproduct_id": i.halfproduct_id
            } for i in items
        ]
    }

@router.post("/", response_model=dict)
def create_recipe(
    name: str = Form(...),
    type: RecipeType = Form(...),
    is_active: int = Form(1),
    stores: str = Form(""),
    db: Session = Depends(get_db),
    user: User = Depends(admin_or_chef)
):
    if db.query(Recipe).filter(Recipe.name == name).first():
        raise HTTPException(status_code=400, detail="Recipe name already exists")
    recipe = Recipe(name=name, type=type, is_active=is_active, stores=stores, created_by=user.id)
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return {"id": recipe.id, "name": recipe.name, "type": recipe.type, "is_active": recipe.is_active, "stores": recipe.stores}

@router.post("/{recipe_id}/items", response_model=dict)
def add_recipe_item(
    recipe_id: int,
    item_type: RecipeItemType = Form(...),
    item_name: str = Form(...),
    unit: str = Form(...),
    amount: float = Form(...),
    halfproduct_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(admin_or_chef)
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    item = RecipeItem(
        recipe_id=recipe_id,
        item_type=item_type,
        item_name=item_name,
        unit=unit,
        amount=amount,
        halfproduct_id=halfproduct_id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {
        "id": item.id,
        "item_type": item.item_type,
        "item_name": item.item_name,
        "unit": item.unit,
        "amount": item.amount,
        "halfproduct_id": item.halfproduct_id
    }

@router.delete("/{recipe_id}", response_model=dict)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db), user: User = Depends(admin_or_chef)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe)
    db.commit()
    return {"message": "Recipe deleted"}

@router.delete("/items/{item_id}", response_model=dict)
def delete_recipe_item(item_id: int, db: Session = Depends(get_db), user: User = Depends(admin_or_chef)):
    item = db.query(RecipeItem).filter(RecipeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Recipe item not found")
    db.delete(item)
    db.commit()
    return {"message": "Recipe item deleted"} 