import React, {useState} from 'react'
import { MailComposer } from '../MailComposer/mailComposer';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CreateIcon from '@mui/icons-material/Create';
import './mailInbox.css'
export const MailList = (props) => {

  const [isSnackBarShowed, setIsSnackBarShowed] = useState(true);
  const [isComposerOpened, setIsComposerOpened] = useState(true);
  const handleClose = () => {
    setIsSnackBarShowed(false);
  };

  const handleClickComposeToggle = () => {
    setIsComposerOpened(!isComposerOpened);
  }
  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <>
      <div>
        All mails will be listed here.
      </div>

      {
        isComposerOpened && <MailComposer/>
      }

      <div className='compose-button-div' onClick={handleClickComposeToggle}>
        <CreateIcon/>
      </div>

      <Snackbar
        open={isSnackBarShowed}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Note archived"
        action={action}
      />
    </>
  )
}
