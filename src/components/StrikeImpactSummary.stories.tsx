import type { Meta, StoryObj } from '@storybook/react';
import StrikeImpactSummary from './StrikeImpactSummary';

const meta: Meta<typeof StrikeImpactSummary> = {
  title: 'Components/StrikeImpactSummary',
  component: StrikeImpactSummary,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
