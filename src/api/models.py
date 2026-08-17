from pydantic import BaseModel
from typing import Optional, Dict, Any

class SimulationRequest(BaseModel):
    race_id: str
    team_id: str
    
class SimulationResponse(BaseModel):
    strategy_output: str
    circuit: str
    team: str
    weather: Dict[str, Any]
    
class ErrorResponse(BaseModel):
    error: str
