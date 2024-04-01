import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import  Login  from './Login';
import Admin from './Addmin';
import UserList from './Uselist';
import QuestionList from './Question';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/userlist" element={<UserList />} />
      <Route path="/question" element={<QuestionList />} />
    </Routes>
  </BrowserRouter>
);

reportWebVitals();
