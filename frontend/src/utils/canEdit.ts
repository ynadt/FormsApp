import { TemplateBase } from '../types/template';
import { FormType } from '../types/form.ts';

export const canEdit = (
  entity: TemplateBase | FormType,
  currentUserId?: string,
  isAdmin?: boolean,
): boolean =>
  currentUserId ? currentUserId === entity.authorId || Boolean(isAdmin) : false;
