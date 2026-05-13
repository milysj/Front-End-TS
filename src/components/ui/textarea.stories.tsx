import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message here.',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled.',
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Your message
      </label>
      <Textarea id="message" {...args} />
    </div>
  ),
  args: {
    placeholder: 'Type your message here.',
  },
};
