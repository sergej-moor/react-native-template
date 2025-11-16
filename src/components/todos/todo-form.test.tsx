/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import React from 'react';

import { cleanup, fireEvent, screen, setup, waitFor } from '@/lib/test-utils';

import { TodoForm } from './todo-form';

afterEach(cleanup);

const onSubmitMock = jest.fn();

describe('TodoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders correctly with default props', async () => {
      setup(<TodoForm onSubmit={onSubmitMock} />);
      expect(await screen.findByTestId('todo-title-input')).toBeOnTheScreen();
      expect(screen.getByTestId('todo-description-input')).toBeOnTheScreen();
      expect(screen.getByTestId('todo-submit-button')).toBeOnTheScreen();
    });

    test('renders with custom submit label', async () => {
      setup(<TodoForm onSubmit={onSubmitMock} submitLabel="Update Todo" />);
      expect(await screen.findByText('Update Todo')).toBeOnTheScreen();
    });

    test('hides description when showDescription is false', async () => {
      setup(<TodoForm onSubmit={onSubmitMock} showDescription={false} />);
      expect(await screen.findByTestId('todo-title-input')).toBeOnTheScreen();
      expect(
        screen.queryByTestId('todo-description-input'),
      ).not.toBeOnTheScreen();
    });

    test('renders with default values', async () => {
      setup(
        <TodoForm
          onSubmit={onSubmitMock}
          defaultValues={{
            title: 'Test Todo',
            description: 'Test Description',
          }}
        />,
      );
      const titleInput = await screen.findByTestId('todo-title-input');
      const descInput = screen.getByTestId('todo-description-input');

      expect(titleInput).toHaveProp('value', 'Test Todo');
      expect(descInput).toHaveProp('value', 'Test Description');
    });

    test('shows loading state when isLoading is true', async () => {
      setup(<TodoForm onSubmit={onSubmitMock} isLoading={true} />);
      const button = await screen.findByTestId('todo-submit-button');
      expect(button).toBeDisabled();
    });
  });

  describe('Validation', () => {
    test('displays required error when title is empty', async () => {
      setup(<TodoForm onSubmit={onSubmitMock} />);
      const button = screen.getByTestId('todo-submit-button');

      fireEvent.press(button);

      expect(
        await screen.findByText('todos.validation.titleRequired'),
      ).toBeOnTheScreen();
      expect(onSubmitMock).not.toHaveBeenCalled();
    });

    test('displays max length error when title exceeds 200 characters', async () => {
      setup(<TodoForm onSubmit={onSubmitMock} />);
      const titleInput = screen.getByTestId('todo-title-input');
      const longTitle = 'a'.repeat(201);

      fireEvent.changeText(titleInput, longTitle);
      fireEvent.press(screen.getByTestId('todo-submit-button'));

      expect(
        await screen.findByText('todos.validation.titleMaxLength'),
      ).toBeOnTheScreen();
      expect(onSubmitMock).not.toHaveBeenCalled();
    });

    test('displays max length error when description exceeds 1000 characters', async () => {
      setup(<TodoForm onSubmit={onSubmitMock} />);
      const titleInput = screen.getByTestId('todo-title-input');
      const descInput = screen.getByTestId('todo-description-input');
      const longDesc = 'a'.repeat(1001);

      fireEvent.changeText(titleInput, 'Valid Title');
      fireEvent.changeText(descInput, longDesc);
      fireEvent.press(screen.getByTestId('todo-submit-button'));

      expect(
        await screen.findByText('todos.validation.descriptionMaxLength'),
      ).toBeOnTheScreen();
      expect(onSubmitMock).not.toHaveBeenCalled();
    });

    test('does not submit when title is only whitespace', async () => {
      setup(<TodoForm onSubmit={onSubmitMock} />);
      const titleInput = screen.getByTestId('todo-title-input');

      fireEvent.changeText(titleInput, '   ');
      fireEvent.press(screen.getByTestId('todo-submit-button'));

      expect(
        await screen.findByText('todos.validation.titleRequired'),
      ).toBeOnTheScreen();
      expect(onSubmitMock).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    test('allows submission with valid title only', async () => {
      const { user } = setup(<TodoForm onSubmit={onSubmitMock} />);
      const titleInput = screen.getByTestId('todo-title-input');
      const button = screen.getByTestId('todo-submit-button');

      await user.type(titleInput, 'New Todo');
      fireEvent.press(button);

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith({
          title: 'New Todo',
          description: '',
        });
      });
    });

    test('allows submission with title and description', async () => {
      const { user } = setup(<TodoForm onSubmit={onSubmitMock} />);
      const titleInput = screen.getByTestId('todo-title-input');
      const descInput = screen.getByTestId('todo-description-input');
      const button = screen.getByTestId('todo-submit-button');

      await user.type(titleInput, 'New Todo');
      await user.type(descInput, 'Todo Description');
      fireEvent.press(button);

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith({
          title: 'New Todo',
          description: 'Todo Description',
        });
      });
    });

    test('trims whitespace from title and description', async () => {
      const { user } = setup(<TodoForm onSubmit={onSubmitMock} />);
      const titleInput = screen.getByTestId('todo-title-input');
      const descInput = screen.getByTestId('todo-description-input');
      const button = screen.getByTestId('todo-submit-button');

      await user.type(titleInput, '  Trimmed Title  ');
      await user.type(descInput, '  Trimmed Desc  ');
      fireEvent.press(button);

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith({
          title: 'Trimmed Title',
          description: 'Trimmed Desc',
        });
      });
    });

    test('resets form after successful submission', async () => {
      const { user } = setup(<TodoForm onSubmit={onSubmitMock} />);
      const titleInput = screen.getByTestId('todo-title-input');
      const descInput = screen.getByTestId('todo-description-input');
      const button = screen.getByTestId('todo-submit-button');

      await user.type(titleInput, 'New Todo');
      await user.type(descInput, 'Description');
      fireEvent.press(button);

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalled();
      });

      expect(titleInput).toHaveProp('value', '');
      expect(descInput).toHaveProp('value', '');
    });
  });
});
