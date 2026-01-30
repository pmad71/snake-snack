import { LeaderboardEntry, GameMode, Difficulty } from '../types';

const API_URL = 'https://h.madrzak.pl/snakescores/api.php';

export const fetchLeaderboard = async (
  mode?: GameMode | null,
  difficulty?: Difficulty | null
): Promise<LeaderboardEntry[]> => {
  try {
    const params = new URLSearchParams();
    if (mode) params.append('mode', mode);
    if (difficulty) params.append('difficulty', difficulty);

    const url = params.toString() ? `${API_URL}?${params}` : API_URL;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.scores || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

export const submitScore = async (
  nickname: string,
  score: number,
  mode: GameMode,
  difficulty: Difficulty
): Promise<{ success: boolean; position?: number; error?: string }> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, score, mode, difficulty }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Unknown error' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting score:', error);
    return { success: false, error: 'Network error' };
  }
};
