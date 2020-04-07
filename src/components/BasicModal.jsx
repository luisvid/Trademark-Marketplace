import React from 'react'
import { Modal } from 'semantic-ui-react'

const BasicModal = ({ open, header, message, close }) => (
  <Modal
    open={open}
    header={header}
    content={message}
    onClose={() => close()}
    closeIcon
  />
)

export default BasicModal;
