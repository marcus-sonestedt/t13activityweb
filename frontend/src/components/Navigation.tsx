import React, { Component } from "react";
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'
import './Navigation.css'

class NavProps {
    visible = true;
    isStaff = false;
}

export const Navigation = (props: NavProps) => {

    return (
        <Navbar bg="light" className={props.visible ? "" : "hidden"}>
            <Navbar.Brand href="/">Team13's aktivitetswebb</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link href="http://team13.se">Team13 Hemsida</Nav.Link>
                    <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                        <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                    </NavDropdown>
                    {props.isStaff === true
                        ? <LinkItGood to="/admin">Administration</LinkItGood>
                        : null}
                    <Nav.Link href="/app/logout">Logga ut</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

class LinkItGood extends Component<{ to: string }, {}>
{
    handleClick = () => {
        window.location.href = this.props.to;
    }

    render = () =>
        <Nav.Link href={this.props.to} target="_self" onClick={this.handleClick}>
            {this.props.children}
        </Nav.Link>;
}


export default Navigation;