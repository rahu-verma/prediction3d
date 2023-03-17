import React, { Component } from "react";
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';


class Logout extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      window.location.href = '/logout'
    );
  }
}

export default Logout;
