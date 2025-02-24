export const formatQuestionType = (type: string) =>
  type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const haveQuestionsChanged = (
  newQuestions: any,
  existingQuestions: any,
) => {
  if (newQuestions.length !== existingQuestions.length) {
    return true;
  }

  for (let i = 0; i < newQuestions.length; i++) {
    const newQ = newQuestions[i];
    const existingQ = existingQuestions.find((q: any) => q.id === newQ.id);

    if (!existingQ) {
      return true;
    }

    if (
      newQ.type !== existingQ.type ||
      newQ.title !== existingQ.title ||
      newQ.description !== existingQ.description ||
      newQ.required !== existingQ.required ||
      newQ.showInResults !== existingQ.showInResults
    ) {
      return true;
    }
  }

  return false;
};
