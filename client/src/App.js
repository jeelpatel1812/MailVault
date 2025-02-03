import './App.css';
import UserProfile from './components/UserProfile/userProfile';
import Login from './components/Login/login';
import Signup from './components/Signup/signup';
import Header from './components/Header/header';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotFoundPage } from './components/NotFoundPage/notFoundPage';
import { MailList } from './components/MailList/mailInbox';
import { MailComposer } from './components/MailComposer/mailComposer';

// const Mailbox = () => {
//   const { category } = 'inbox'
//   // useParams(); // Get category from URL
//   return <MailList/>
// };

function App() {
  return (
    <BrowserRouter>
      <Routes>
          {/* <Header/> */}
          <Route path="/user/login" element={<Login />} />
          <Route path="/user/signup" element={<Signup />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/mail/inbox" element={<MailList/>} />
          <Route path="/mail/compose" element={<MailComposer/>} />
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
