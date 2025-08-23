// backend/src/utils/helpers.ts
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const calculatePercentage = (obtained: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((obtained / total) * 100);
};