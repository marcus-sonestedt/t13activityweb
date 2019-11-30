import React, { useContext } from "react";
import { Nav, Navbar } from 'react-bootstrap'
import './Navigation.css'
import { userContext } from "../App";

export const Navigation = () => {
    const user = useContext(userContext);

    return (
        <Navbar bg="light">
            <Navbar.Brand href="/">
                <img src="/logo192.png" alt="Team13 logo"/>
                Team13's aktivitetswebb
                </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="justify-content-end">
                <Nav className="mr-auto">
                    {!user.isStaff ? null
                        : <Nav.Link href="/admin">Administrera</Nav.Link>
                    }
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