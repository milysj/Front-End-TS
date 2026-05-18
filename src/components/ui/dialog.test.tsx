import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog';

describe('Dialog Component', () => {
  it('renders all parts correctly and can be opened and closed', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Test Title</DialogTitle>
            <DialogDescription>This is a test description.</DialogDescription>
          </DialogHeader>
          <div>Main Content Here</div>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByText('My Test Title')).not.toBeInTheDocument();

    const triggerButton = screen.getByText('Open Dialog');
    await user.click(triggerButton);

    expect(screen.getByText('My Test Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    expect(screen.getByText('Main Content Here')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    const closeButton = screen.getByText('Cancel');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('My Test Title')).not.toBeInTheDocument();
    });
  });

  it('hides the default close icon when showCloseButton is false', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open Modal</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Title Modal 2</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open Modal'));
    expect(screen.getByText('Title Modal 2')).toBeInTheDocument();

    // O XIcon padrão tem um sr-only text contendo "Close"
    // Como passamos false, ele não deve ser renderizado
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });
});
