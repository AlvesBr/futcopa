import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './Toast'

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  parameters: { layout: 'centered' },
  argTypes: { variant: { control: 'select', options: ['success', 'error', 'warning', 'info'] } },
}
export default meta
type Story = StoryObj<typeof Toast>

export const Success: Story = { args: { variant: 'success', message: 'Resposta correta! ✓', duration: 99999 } }
export const Error: Story   = { args: { variant: 'error',   message: 'Posição errada',      duration: 99999 } }
export const Info: Story    = { args: { variant: 'info',    message: 'Dica revelada',        duration: 99999 } }
