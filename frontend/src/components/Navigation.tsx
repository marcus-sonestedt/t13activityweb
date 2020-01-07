import React, { useContext } from "react";
import { Nav, Navbar, Badge } from 'react-bootstrap'
import { userContext } from "./UserContext";
import { HoverTooltip } from "./Utilities";
import './Navigation.css'

export const Navigation = () => {
    const user = useContext(userContext);

    return (
        <Navbar bg='dark' variant='dark' expand="lg">
            <Navbar.Brand href="/">
                <a href="http://www.team13.se"><img src="/static/logo192.png" alt="Team13 logo" /></a>
                Team13s aktivitetswebb
                </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="justify-content-end">
                <Nav className="mr-auto">
                    <p>{' '}</p>
                </Nav>
                <Nav>
                    <Nav.Link href="/frontend/faq">Hjälp</Nav.Link>
                    {!user.isStaff ? null :
                        <Nav.Link href="/admin">Administrera</Nav.Link>
                    }
                    {!user.isLoggedIn ? null :
                        <>
                            <Nav.Link mr-sm={2} href="/frontend/profile">Hej {user.fullname}!</Nav.Link>
                            <Nav.Link mr-sm={2} href="/app/logout">Logga ut</Nav.Link>
                        </>
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Navigation;