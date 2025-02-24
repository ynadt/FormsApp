import { PrismaClient } from '@prisma/client';
import supabase from '../supabase';

const prisma = new PrismaClient();

export const deleteImageFromStorage = async (imageUrl: string) => {
  const filePath = imageUrl.split('/').pop();
  if (!filePath) {
    throw new Error('Invalid image URL');
  }

  const { error } = await supabase.storage
    .from('formbuilder')
    .remove([filePath]);

  if (error) {
    throw new Error('Failed to delete image from storage');
  }
};

export const updateTemplateTags = (tags) => ({
  deleteMany: {},
  create: tags.map((tagName) => ({
    tag: {
      connectOrCreate: {
        where: { name: tagName },
        create: { name: tagName },
      },
    },
  })),
});

export const updateTemplateQuestions = (questions) => {
  const existingQuestions = questions.filter((q) => q.id);
  const newQuestions = questions.filter((q) => !q.id);

  return {
    updateMany: existingQuestions.map((q) => ({
      where: { id: q.id },
      data: {
        type: q.type,
        title: q.title,
        description: q.description,
        order: q.order,
        required: q.required,
        showInResults: q.showInResults,
      },
    })),
    create: newQuestions.map((q, index) => ({
      type: q.type,
      title: q.title,
      description: q.description,
      order: q.order || index + 1,
      required: q.required,
      showInResults: q.showInResults,
    })),
  };
};

export const updateTemplateAccesses = (accesses) => ({
  deleteMany: {},
  create: accesses.map((access) => ({
    userId: access.userId,
  })),
});

export const haveQuestionsChanged = (newQuestions, existingQuestions) => {
  if (newQuestions.length !== existingQuestions.length) {
    return true;
  }

  for (let i = 0; i < newQuestions.length; i++) {
    const newQ = newQuestions[i];
    const existingQ = existingQuestions.find((q) => q.id === newQ.id);

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

export const isQuestionOrderChanged = (newQuestions, existingQuestions) => {
  const newOrder = newQuestions.map((q) => q.id);
  const existingOrder = existingQuestions.map((q) => q.id);

  // Check if the order arrays are identical
  return JSON.stringify(newOrder) !== JSON.stringify(existingOrder);
};
