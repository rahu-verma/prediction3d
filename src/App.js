import React, { Component } from "react";
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import Login from './Login';
import Register from './Register';
import Logout from './Logout';
import Upload from './Upload';


class App extends Component {

  render() {
    return (
      <Router>

        <Menu className="menu">
          <MenuItem><Link to="/uploader">Home</Link></MenuItem>
          <MenuItem><Link to="/login">Login</Link></MenuItem>
          <MenuItem><Link to="/register">Register</Link></MenuItem>
          <MenuItem><Link to="/logout">Logout</Link></MenuItem>
        </Menu>

        <Routes>
          <Route path="/uploader" element={<Upload />} ></Route>
          <Route path="/login" element={<Login/>} ></Route>
          <Route path="/register" element={<Register/>} ></Route>
          <Route path="/logout" element={<Logout/>} ></Route>
        </Routes>
      </Router>
    );
  }
}

export default App;
