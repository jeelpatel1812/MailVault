import './App.css';
import UserProfile from './components/UserProfile/userProfile';
import Login from './components/Login/login';
import Signup from './components/Signup/signup';
import Header from './components/Header/header';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotFoundPage } from './components/NotFoundPage/notFoundPage';
import { MailComposer } from './components/MailComposer/mailComposer';
import { MailContainer } from './components/MailContainer/mailContainer';
import MailDetail from './components/MailDetail/mailDetail';

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
          <Route path="/mail/inbox" element={<MailContainer/>} />
          <Route path="/mail/inbox/:id" element={<MailDetail/>} />
          <Route path="/mail/compose" element={<MailComposer/>} />
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
