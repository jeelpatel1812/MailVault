import React, {useEffect, useState} from 'react'
import './mailList.css'
import { Box, Checkbox, Table, TableBody, TableCell, TableContainer, TableRow, Typography,  AppBar, Toolbar } from "@mui/material";
import api from '../../api'
import PaginationComponent from '../PaginationComponent/paginationComponent'
import { useNavigate } from 'react-router-dom';

const EmailList = (props) => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [selectedMailId, setSelectedMailId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleFetchMails = async() =>{
    const token = localStorage.getItem('accessToken');
    console.log("check token", token);
    try {
      const response = await api.get('/mail/fetchMailsByCategory',
      {
        params:{
          isTrashed: false,
          page: 1,
          limit: 20,
        },
        headers: {
            Authorization: `Bearer ${token}`
        },
      });
      
      setEmails(response?.data?.data?.mails || []);
      console.log("check res", response, emails);

    } catch (error) {
      console.log("Error: ",error);
    } 

  }

  const handleGetMailDetail = (event, selectedMailId) => {
    event.stopPropagation();
    setSelectedMailId(selectedMailId);
  }

  useEffect(()=>{
    handleFetchMails();
    if(selectedMailId){
      const id = selectedMailId;
      setSelectedMailId("");
      navigate(`/mail/inbox/${id}`);
    }
  },[selectedMailId])

  // if(selectedMailId) {
  //   const id = selectedMailId;
  //   console.log("checkkkk", id, selectedMailId)
  //   // setSelectedMailId("");
  // }

  return (
    <Box sx={{ ml: 2, p: 2 }}>
      <Typography variant="h6" gutterBottom className='email-list-title'>
        Emails
      </Typography>
      <TableContainer>
        <Table>
          <TableBody>
            {emails.length>0 && emails.map((email, index) => (
              <TableRow key={index} hover className='single-mail-row' onClick={(e) => handleGetMailDetail(e, email.mailDetails[0]?._id)}>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" noWrap className='mail-list-subject'>
                    {email.mailDetails[0]?.senderName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap className='mail-list-subject'>
                    {email.mailDetails[0]?.subject}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap className='mail-list-content'>
                    {email.mailDetails[0]?.content}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption" className='mail-list-date'>{email.mailDetails[0]?.createdAt.substr(0,10)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className='email-list-paginate'>
        <PaginationComponent
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={() => setCurrentPage(1)} 
        />
      </div>
    </Box>
  )
}
export default EmailList