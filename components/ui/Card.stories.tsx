import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Card>

export const Default: Story  = { args: { children: 'Conteúdo do card',      className: 'p-4 w-60' } }
export const Elevated: Story = { args: { children: 'Card elevado', elevated: true, className: 'p-4 w-60' } }
