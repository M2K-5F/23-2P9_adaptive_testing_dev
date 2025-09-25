from typing import List


API_PREFIX = '/api'

PUBLIC_PATHS: List[str] = [
    API_PREFIX + "/auth/login", 
    API_PREFIX + "/auth/register", 
    API_PREFIX + '/auth/logout', 
    "/docs", 
    "/openapi.json",
    '/public',
    '/assets'
]

ALLOWED_ORIGINS = [
    "http://localhost:5173", 
    'http://localhost:8001', 
    'http://localhost:80'
]
