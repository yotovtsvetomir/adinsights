import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('example@goodemail.com');
    return (
      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState('example@wrong');
    return (
      <Input
        id="email-error"
        name="email"
        label="Email"
        type="email"
        error="Invalid email address"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Password: Story = {
  render: () => {
    const [value, setValue] = useState('MySecret123');
    return (
      <Input
        id="password"
        name="password"
        label="Password"
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Text: Story = {
  render: () => {
    const [value, setValue] = useState('john.doe');
    return (
      <Input
        id="email"
        name="email"
        label="Username"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Large: Story = {
  render: () => {
    const [value, setValue] = useState('john.doe');
    return (
      <Input
        id="email"
        name="email"
        label="Username"
        type="text"
        value={value}
        size="large"
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const WithIcon: Story = {
  render: () => {
    const [value, setValue] = useState('Birthday Invitation');
    return (
      <Input
        id="email-icon"
        name="email"
        label="Event Name"
        icon="event"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Input
      id="disabled"
      name="disabled"
      label="Disabled"
      type="text"
      value="Disabled"
      onChange={() => {}}
      required
      disabled
      placeholder=" "
    />
  ),
};
