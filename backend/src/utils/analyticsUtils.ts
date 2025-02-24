export const getMostFrequentAnswer = (answers: string[]): string => {
  const frequency: Record<string, number> = {};
  answers.forEach((answer) => {
    frequency[answer] = (frequency[answer] || 0) + 1;
  });
  let mostFrequent = '';
  let maxCount = 0;
  for (const [answer, count] of Object.entries(frequency)) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = answer;
    }
  }
  return mostFrequent;
};
