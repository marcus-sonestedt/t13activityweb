import React, { useContext } from "react";
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'
import './Navigation.css'
import { userContext } from "../App";

export const Navigation = () => {
    const user = useContext(userContext);

    return (
        <Navbar bg='dark' variant='dark'>
            <Navbar.Brand href="/">
                <img src="/logo192.png" alt="Team13 logo" />
                Team13's aktivitetswebb
                </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="justify-content-end">
                <Nav className="mr-auto">
                    {!user.isLoggedIn ? null :
                        <Nav.Link href="/frontend/delistrequests">Avbokningar</Nav.Link>
                    }
                    {!user.isStaff ? null
                        : <Nav.Link href="/admin">Administrera</Nav.Link>
                    }
                    <NavDropdown title="Info" id="basic-nav-dropdown">
                        <NavDropdown.Item href="/frontend/faq">Frågor &amp; svar</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="/frontend/eventtypes">Aktivitetstyper</NavDropdown.Item>
                        <NavDropdown.Item href="/frontend/activitytypes">Uppgiftstyper</NavDropdown.Item>
                    </NavDropdown>
                    {!user.isLoggedIn ? null :
                        <>
                            <Nav.Link mr-sm={2} href="/frontend/profile">
                                Hej {user.fullname}!</Nav.Link>
                            <Nav.Link mr-sm={2} href="/app/logout">Logga ut</Nav.Link>
                        </>
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Navigation;