
WEIGHT_ADJUSTMENT_PROFILES = {
    'AGGRESSIVE': {
        'base_weight': 2.0,
        'base_step': 0.15,
        'min_weight': 0.3,
        'max_weight': 4.0,
        'score_bias': 0.6
    },
    'BALANCED': {
        'base_weight': 1.6,
        'base_step': 0.1,
        'min_weight': 0.5,
        'max_weight': 3.0,
        'score_bias': 0.5,
    },
    'GENTLE': {
        'base_weight': 1.7,
        'base_step': 0.05,
        'min_weight': 1.0,
        'max_weight': 2.5,
        'score_bias': 0.4
    },
}