import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Modal>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Como jogar">
          <p className="fc-body text-fg-2 mt-2">Arraste cada jogador para o slot correto na pirâmide.</p>
          <Button block className="mt-4" onClick={() => setOpen(false)}>Entendido!</Button>
        </Modal>
      </>
    )
  },
}
