import React, { Component } from "react";
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'

class NavProps {
    loggedIn = false;
    onLoggedOut = () => { };
}

export class Navigation extends Component<NavProps, {}>{

    render = () => {
        let loginNav;
        if (this.props.loggedIn) {
            loginNav = (
                <Nav className="mr-auto">
                    <Nav.Link href="http://team13.se">Team13 Hemsida</Nav.Link>
                    <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                        <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link href="/logout" onClick={this.props.onLoggedOut}>Logga ut</Nav.Link>
                </Nav>
            );
        } else {
            loginNav = (
                <Nav className="mr-auto">
                </Nav>
            );
        }

        return (
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="/">Team13's aktivitetswebb</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {loginNav}
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default Navigation;