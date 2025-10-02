TIME_NORMALIZE_DAYS = 30

ADAPTIVITY_PROFILES = {
    'AGGRESSIVE': {
        'question_weight': 0.7,
        'last_score': 0.2, 
        'time_since_last': 0.1,
        'max_adaptive_questions_count': 8.0,
        'max_adaptive_questions_ratio': 0.4,
    },
    'BALANCED': {
        'question_weight': 0.6,
        'last_score': 0.3,
        'time_since_last': 0.1,
        'max_adaptive_questions_count': 5.0,
        'max_adaptive_questions_ratio': 0.3,
    },
    'GENTLE': {
        'question_weight': 0.5,
        'last_score': 0.4,
        'time_since_last': 0.1,
        'max_adaptive_questions_count': 3.0,
        'max_adaptive_questions_ratio': 0.2,
    }
}