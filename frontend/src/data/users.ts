export type User = {
    email: string;
    name?: string;
    score?: number;
};

export const initializeDummyUsers = () => {
    // Mock init
};

export const updateUserScore = (email: string, score: number, add: boolean): User | null => {
    return { email, score: add ? score : 0 };
};
