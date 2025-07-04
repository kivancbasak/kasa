from sqlalchemy import Column, Integer, String, ForeignKey, Float, Enum, Text
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class RecipeType(str, enum.Enum):
    FINAL = "final"      # Sold item
    HALF = "half"        # Half product

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    type = Column(Enum(RecipeType), nullable=False)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))

    items = relationship("RecipeItem", back_populates="recipe", cascade="all, delete-orphan", foreign_keys="RecipeItem.recipe_id")

class RecipeItemType(str, enum.Enum):
    INGREDIENT = "ingredient"
    HALFPRODUCT = "halfproduct"

class RecipeItem(Base):
    __tablename__ = "recipe_items"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    item_type = Column(Enum(RecipeItemType), nullable=False)
    item_name = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    halfproduct_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)  # If this is a halfproduct, reference another recipe

    recipe = relationship("Recipe", back_populates="items", foreign_keys=[recipe_id]) 