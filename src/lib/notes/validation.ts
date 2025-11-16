import { z } from 'zod';

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;
const MIN_TITLE_LENGTH = 1;

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(MIN_TITLE_LENGTH, 'notes.validation.titleRequired')
    .max(MAX_TITLE_LENGTH, 'notes.validation.titleMaxLength'),
  content: z
    .string()
    .trim()
    .min(1, 'notes.validation.contentRequired')
    .max(MAX_CONTENT_LENGTH, 'notes.validation.contentMaxLength'),
});

export type CreateNoteFormData = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(MIN_TITLE_LENGTH, 'notes.validation.titleRequired')
    .max(MAX_TITLE_LENGTH, 'notes.validation.titleMaxLength')
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, 'notes.validation.contentRequired')
    .max(MAX_CONTENT_LENGTH, 'notes.validation.contentMaxLength')
    .optional(),
});

export type UpdateNoteFormData = z.infer<typeof updateNoteSchema>;
