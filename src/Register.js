import React, { Component } from "react";
import { Navigate } from "react-router-dom";

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            security: "",
        };
    }

    handleInputChange = (event) => {
        const { value, name } = event.target;
        this.setState({
            [name]: value,
        });
    };

    onSubmit = (event) => {
        event.preventDefault();
        fetch("/api/register", {
            method: "POST",
            body: JSON.stringify(this.state),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    window.location.href = "/login";
                } else {
                    const error = new Error(res.error);
                    throw error;
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Error registering in please try again");
            });
    };

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <h1>Login Below!</h1>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={this.state.email}
                    onChange={this.handleInputChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={this.state.password}
                    onChange={this.handleInputChange}
                    required
                />
                <input
                    type="password"
                    name="security"
                    placeholder="Enter security code"
                    value={this.state.security}
                    onChange={this.handleInputChange}
                    required
                />
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

export default Register;
