import { z } from 'zod';

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MIN_TITLE_LENGTH = 1;

export const createTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(MIN_TITLE_LENGTH, 'todos.validation.titleRequired')
    .max(MAX_TITLE_LENGTH, 'todos.validation.titleMaxLength'),
  description: z
    .string()
    .trim()
    .max(MAX_DESCRIPTION_LENGTH, 'todos.validation.descriptionMaxLength')
    .optional()
    .or(z.literal('')),
});

export type CreateTodoFormData = z.infer<typeof createTodoSchema>;

export const updateTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(MIN_TITLE_LENGTH, 'todos.validation.titleRequired')
    .max(MAX_TITLE_LENGTH, 'todos.validation.titleMaxLength')
    .optional(),
  description: z
    .string()
    .trim()
    .max(MAX_DESCRIPTION_LENGTH, 'todos.validation.descriptionMaxLength')
    .optional()
    .or(z.literal('')),
});

export type UpdateTodoFormData = z.infer<typeof updateTodoSchema>;
