import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Avatar>

export const WithInitials: Story = { args: { name: 'Ronaldo Nazário', flag: '🇧🇷' } }
export const Large: Story        = { args: { name: 'Zinedine Zidane', flag: '🇫🇷', size: 56 } }
export const Small: Story        = { args: { name: 'Messi', flag: '🇦🇷', size: 28 } }
