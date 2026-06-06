import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  argTypes: { variant: { control: 'select', options: ['success', 'error', 'warning', 'info', 'default'] } },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Success: Story = { args: { variant: 'success', children: 'Correto' } }
export const Error: Story   = { args: { variant: 'error',   children: 'Errado' } }
export const Warning: Story = { args: { variant: 'warning', children: 'Dica usada' } }
export const Info: Story    = { args: { variant: 'info',    children: 'Nível 2' } }
export const Default: Story = { args: { variant: 'default', children: 'Categoria' } }
