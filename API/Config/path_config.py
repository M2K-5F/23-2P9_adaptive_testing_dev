from typing import List


PUBLIC_PATHS: List[str] = [
    "/auth/login", 
    "/auth/register", 
    '/auth/logout', 
    "/docs", 
    "/openapi.json"
]

ALLOWED_ORIGINS = [
    "http://localhost:5173", 
    'http://localhost:8001', 
    'http://localhost:80'
]
