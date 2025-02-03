import React, {useState} from 'react'
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import api from '../../api'
import Button from '../Button/button';
import './mailComposer.css'
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
export const MailComposer = (props) => {

  const [subject, setSubject] = useState(props.mailDetails?.subject || "");
  const [content, setContent] = useState(props.mailDetails?.content || "");
  const [parentId, setParentId] = useState(props.mailDetails?.parentId || "");
  const [attachment,  setAttachment] = useState(props.mailDetails?.attachment || {});
  const [recipientsEmail,  setRecipientsEmail] = useState(props.mailDetails?.recipientsEmail || "");
  const [isSubmitExpanded,  setIsSubmitExpanded] = useState(false);

  const handleComposeMail = async() =>{
    const token = localStorage.getItem('accessToken');
    const allMailsIds = recipientsEmail.split(" ")
    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("content", content);
    formData.append("file", attachment);
    formData.append("recipientsEmail", allMailsIds);
    try {
      const response = await api.post('/mail/compose',
      formData,
      {
        headers: {
            Authorization: `Bearer ${token}`
        },
      });

    } catch (error) {
    } finally {
      // setLoading(false);
      handleToClose();
    }
  }

  const handleExpandOption = () => {
    setIsSubmitExpanded(!isSubmitExpanded);
  }

  const handleToClose = () =>{
    // props.handleClose();
  }

  const handleFileUpload = (file) => {
    setAttachment(file)
    console.log("check file", file)
  }

  return (
    <Dialog
      open={props.isOpen || true}
      onClose={handleToClose}
      hideBackdrop
      slotProps={{
        paper: {
          sx: {
            position: "fixed",
            bottom: 10,
            right: 10,
            width: "600px",
            height: "400px",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >

<form method="post" enctype="multipart/form-data">
</form>
    
      <DialogTitle sx={{ paddingBottom: 2, fontSize: "1rem", fontWeight: 600 }}>
        New Mail
      </DialogTitle>

      <DialogContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            value={recipientsEmail}
            placeholder="Recipients"
            onChange={(e) => setRecipientsEmail(e.target.value)}
            style={{
              flex: "1",
              width: "100%",
              padding: "8px",
              border: "none",
              borderBottom: "1px solid #ccc",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            value={subject}
            placeholder="Subject"
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "none",
              borderBottom: "1px solid #ccc",
              outline: "none",
            }}
          />
        </div>

        <div style={{ flex: 1, marginBottom: "10px" }}>
          <textarea
            value={content}
            placeholder="Write your message..."
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              height: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              outline: "none",
              resize: "none",
            }}
          />
        </div>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "space-between",
          padding: "10px",
          borderTop: "1px solid #eee"
        }}
      >
        <div>
          {/* <Button
            component="label"
            sx={{ fontSize: "0.85rem", textTransform: "none" }}
            className="attachment-button"
            style={
              {
                color: 'black'
              }
            }
          >
          </Button> */}
          {/* <AttachFileIcon style={{height:"30px", width:"30px"}}/> */}
          <input
            type="file"
            id="profile_pic"
            name="profile_pic"
            accept=".jpg, .jpeg, .png, .pdf" 
            multiple
            onChange={(e) => handleFileUpload(e.target.files[0])}
            />
        </div>
        <div  style={{
          display: "flex",
          alignItems: "center",
        }}>
          <Button
            onClick={props.isUpdate ? null : handleComposeMail}
            variant="contained"
            color="primary"
            className="send-button"
            sx={{ fontSize: "0.85rem", textTransform: "none" }}
          >
            {props.isUpdate ? "Update" : "Send"}
          </Button>
          <Button
            onClick={handleExpandOption}
            variant="contained"
            color="primary"
            className="send-schedule-button"
            sx={{textTransform: "none" }}
          >
            {isSubmitExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon/>}
          </Button>
        </div>
      </DialogActions>
    </Dialog>

  )
}
