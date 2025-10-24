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
    'http://109.161.15.144',
    'http://109.161.15.144:80',
    "http://localhost:5173", 
    'http://localhost:8000', 
    'http://localhost:80'
]
