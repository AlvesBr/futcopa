import type { Meta, StoryObj } from '@storybook/react'
import { Slot } from './Slot'

const meta: Meta<typeof Slot> = {
  title: 'UI/Slot',
  component: Slot,
  parameters: { layout: 'centered' },
  argTypes: { state: { control: 'select', options: ['empty', 'active', 'filled', 'correct', 'incorrect'] } },
}
export default meta
type Story = StoryObj<typeof Slot>

export const Empty: Story     = { args: { state: 'empty',     rank: 1 } }
export const Active: Story    = { args: { state: 'active',    rank: 2 } }
export const Filled: Story    = { args: { state: 'filled',    rank: 3 } }
export const Correct: Story   = { args: { state: 'correct',   rank: 4 } }
export const Incorrect: Story = { args: { state: 'incorrect', rank: 5 } }
