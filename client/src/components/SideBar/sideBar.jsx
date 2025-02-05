import { Box, Button, Drawer, List, ListItem, ListItemText} from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import StarIcon from "@mui/icons-material/Star";
import CreateIcon from '@mui/icons-material/Create';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

import './sideBar.css'
const Sidebar = (props) => (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Button className='compose-mail-button' variant="contained" color="primary" fullWidth onClick={props.handleOpenCloseComposer}>
          <CreateIcon/>
          &nbsp;
          Compose
        </Button>
      </Box>
      <List>
        <ListItem button>
          <InboxIcon sx={{ mr: 2 }} className="sidebar-icon"/>
          <ListItemText primary="Inbox" />
        </ListItem>
        <ListItem button >
          <StarIcon sx={{ mr: 2 }} className="sidebar-icon"/>
          <ListItemText primary="Starred" />
        </ListItem>
        <ListItem button>
          <ScheduleSendIcon sx={{ mr: 2 }} className="sidebar-icon"/>
          <ListItemText primary="Scheduled" />
        </ListItem>
        <ListItem button>
          <SendIcon sx={{ mr: 2 }} className="sidebar-icon"/>
          <ListItemText primary="Sent" />
        </ListItem>
        <ListItem button>
          <DeleteIcon sx={{ mr: 2 }} className="sidebar-icon" />
          <ListItemText primary="Trashed" />
        </ListItem>
      </List>
    </Drawer>
  );

  export default Sidebar;