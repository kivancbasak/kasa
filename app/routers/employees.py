from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_employees():
    """Get all employees"""
    return {"message": "Employee tracking - coming soon"}

@router.get("/{employee_id}")
async def get_employee(employee_id: int):
    """Get specific employee"""
    return {"message": f"Employee {employee_id} - coming soon"} 