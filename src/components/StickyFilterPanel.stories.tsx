import type { Meta, StoryObj } from '@storybook/react';
import StickyFilterPanel from './StickyFilterPanel';

const meta: Meta<typeof StickyFilterPanel> = {
  title: 'Components/StickyFilterPanel',
  component: StickyFilterPanel,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};