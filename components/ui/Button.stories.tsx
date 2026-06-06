import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'gold', 'secondary', 'ghost'] },
    size:    { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story   = { args: { children: 'Jogar agora', variant: 'primary' } }
export const Gold: Story      = { args: { children: 'Ver resultado', variant: 'gold' } }
export const Secondary: Story = { args: { children: 'Como jogar', variant: 'secondary' } }
export const Ghost: Story     = { args: { children: 'Pular', variant: 'ghost' } }
export const Disabled: Story  = { args: { children: 'Indisponível', variant: 'primary', disabled: true } }
export const Block: Story     = { args: { children: 'Confirmar', variant: 'primary', block: true }, parameters: { layout: 'padded' } }
