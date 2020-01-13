import React, { useContext } from "react";
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { userContext } from "./UserContext";
import { HoverTooltip } from "./Utilities";
import './Navigation.css'

export const Navigation = () => {
    const user = useContext(userContext);

    return (
        <Navbar bg='dark' variant='dark' expand="lg" collapseOnSelect>
            <Navbar.Text>
                <HoverTooltip tooltip="Klubbens hemsida" placement='bottom'>
                    <a href="http://www.team13.se">
                        <img src="/static/logo192.png" alt="Team13 logo" />
                    </a>
                </HoverTooltip>
            </Navbar.Text>
            <Navbar.Brand href="/">
                <HoverTooltip tooltip="Aktivetslistans översikt" placement='bottom'>
                    <span>Team13s aktivitetswebb</span>
                </HoverTooltip>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="justify-content-end">
                <Nav className="mr-auto">
                    {!user.isStaff ? <p>{' '}</p> :
                        <Nav.Link href="/admin">Administrera</Nav.Link>
                    }
                </Nav>
                <Nav>
                    <Nav.Link href="/frontend/faq">Hjälp</Nav.Link>
                    <NavDropdown title="Detaljer" id='details-dropdown'>
                        <NavDropdown.Item href="/frontend/eventtypes">
                            Aktivitetstyper
                        </NavDropdown.Item>
                        <NavDropdown.Item href="/frontend/activitytypes">
                            Uppgiftstyper
                        </NavDropdown.Item>
                    </NavDropdown>
                    {!user.isLoggedIn ? null :
                        <>
                            <Nav.Link mr-sm={2} href="/frontend/myprofile">Hej {user.fullname}!</Nav.Link>
                            <Nav.Link mr-sm={2} href="/app/logout">Logga ut</Nav.Link>
                        </>
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Navigation;