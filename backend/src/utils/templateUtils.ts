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

export const sortQuestions = (questions: any[]) => {
  return questions.map((q, index) => ({
    ...q,
    order: index + 1,
  }));
};

export const updateTemplateTags = (tags: string[]) => {
  return {
    deleteMany: {},
    create: tags.map((tagName) => ({
      tag: {
        connectOrCreate: {
          where: { name: tagName },
          create: { name: tagName },
        },
      },
    })),
  };
};

export const updateTemplateQuestions = (questions: any[]) => {
  return {
    deleteMany: {},
    create: questions.map((q) => ({
      type: q.type,
      title: q.title,
      description: q.description,
      required: q.required,
      showInResults: q.showInResults,
      order: q.order,
    })),
  };
};

export const updateTemplateAccesses = (accesses: any[]) => {
  return {
    deleteMany: {},
    create: accesses.map((access) => ({
      userId: access.userId,
    })),
  };
};
