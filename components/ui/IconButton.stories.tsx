import type { Meta, StoryObj } from '@storybook/react'
import { IconButton } from './IconButton'

const meta: Meta<typeof IconButton> = {
  title: 'UI/IconButton',
  component: IconButton,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof IconButton>

export const Default: Story = { args: { label: 'Fechar', children: '✕' } }
export const Help: Story    = { args: { label: 'Ajuda',  children: '?' } }
export const Stats: Story   = { args: { label: 'Stats',  children: '📊' } }
