export const SNAKES_AND_LADDERS: Record<number, number> = {
    // Ladders (Matching zigzag layout precisely)
    4: 17,
    8: 30, // Also a ladder on 8
    9: 30, // Ladder on 9 leads to 30
    18: 38,
    24: 46,
    35: 64,
    50: 91,
    56: 85,
    73: 88,
    77: 97,
    82: 100,
    // Snakes (Matching zigzag layout precisely)
    16: 6,
    41: 3,
    54: 32,
    60: 19,
    67: 7,
    86: 36,
    93: 73,
    95: 75,
    98: 84,
    99: 77
};

export const QUESTIONS_PER_ROUND = 5;
