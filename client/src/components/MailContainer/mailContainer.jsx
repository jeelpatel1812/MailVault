import React, {useState} from 'react'
import { MailComposer } from '../MailComposer/mailComposer';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import './mailContainer.css'
import { Box} from "@mui/material";
import SideBar from '../SideBar/sideBar';
import EmailList from '../MailList/mailList';
export const MailContainer = (props) => {

  const [isSnackBarShowed, setIsSnackBarShowed] = useState(false);
  const [isComposerOpened, setIsComposerOpened] = useState(false);
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
      <Box sx={{ display: "flex" }}>
        <SideBar handleOpenCloseComposer={handleClickComposeToggle}/>
        <EmailList />
      </Box>
      </div>

      {
        isComposerOpened && <MailComposer/>
      }

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
