import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  render: () => <Button>Primary Button</Button>,
};

export const Secondary: Story = {
  render: () => <Button variant="secondary">Secondary Button</Button>,
};

export const Large: Story = {
  render: () => <Button size="large" variant="secondary">Large Button</Button>
}

export const Danger: Story = {
  render: () => <Button variant="danger">Danger Button</Button>,
};

export const Ghost: Story = {
  render: () => <Button variant="ghost">Back</Button>,
};

export const Disabled: Story = {
  render: () => <Button disabled>Disabled Button</Button>,
};

export const Loading: Story = {
  render: () => <Button loading>Loading...</Button>,
};

export const WithIconRight: Story = {
  args: {
    children: 'Preview',
    icon: 'visibility',
    iconPosition: 'right',
    variant: 'secondary',
  },
};

export const WithIconLeft: Story = {
  args: {
    children: 'Add',
    icon: 'add',
    iconPosition: 'left',
    variant: 'primary',
  },
};

export const IconOnly: Story = {
  args: {
    icon: 'settings',
    iconPosition: 'left',
    variant: 'ghost',
    children: '', // optional for icon-only
  },
};

export const ClickHandler: Story = {
  render: () => {
    const [clicked, setClicked] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Button onClick={() => setClicked(true)}>Click Me</Button>
        {clicked && <span>Clicked!</span>}
      </div>
    );
  },
};

export const BoldText: Story = {
  render: () => (
    <Button bold>Bold Text</Button>
  ),
};
