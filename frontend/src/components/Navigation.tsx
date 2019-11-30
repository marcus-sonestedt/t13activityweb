import React from "react";
import { Nav, Navbar } from 'react-bootstrap'
import './Navigation.css'

class NavProps {
    loggedIn = false;
    isStaff = false;
}

export const Navigation = (props: NavProps) => {

    return (
        <Navbar bg="light">
            <Navbar.Brand href="/">Team13's aktivitetswebb</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link href="http://team13.se">Team13 Hemsida</Nav.Link>
                    {props.isStaff
                        ? <Nav.Link href="/admin">Administration</Nav.Link>
                        : null}
                    {props.loggedIn ?
                        <Nav.Link href="/app/logout">Logga ut</Nav.Link>
                        : null}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Navigation;