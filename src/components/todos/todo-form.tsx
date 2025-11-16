import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { CreateTodoFormData } from '@/lib/todos/validation';
import { createTodoSchema } from '@/lib/todos/validation';

import { Button, ControlledInput, View } from '../ui';

type TodoFormProps = {
  onSubmit: (data: CreateTodoFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateTodoFormData>;
  submitLabel?: string;
  showDescription?: boolean;
};

export function TodoForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitLabel,
  showDescription = true,
}: TodoFormProps) {
  const { t } = useTranslation();

  const { control, handleSubmit, reset } = useForm<CreateTodoFormData>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: defaultValues ?? {
      title: '',
      description: '',
    },
  });

  const onSubmitForm: SubmitHandler<CreateTodoFormData> = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <View className="gap-4">
      <ControlledInput
        control={control}
        name="title"
        label={t('todos.form.titleLabel')}
        placeholder={t('todos.form.titlePlaceholder')}
        autoFocus
        testID="todo-title-input"
      />

      {showDescription && (
        <ControlledInput
          control={control}
          name="description"
          label={t('todos.form.descriptionLabel')}
          placeholder={t('todos.form.descriptionPlaceholder')}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          testID="todo-description-input"
        />
      )}

      <Button
        label={submitLabel ?? t('todos.form.createButton')}
        onPress={handleSubmit(onSubmitForm)}
        loading={isLoading}
        testID="todo-submit-button"
      />
    </View>
  );
}
