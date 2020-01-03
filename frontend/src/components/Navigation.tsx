import React, { useContext } from "react";
import { Nav, Navbar, NavDropdown, Badge } from 'react-bootstrap'
import './Navigation.css'
import { userContext } from "./UserContext";

export const Navigation = () => {
    const user = useContext(userContext);

    return (
        <Navbar bg='dark' variant='dark'>
            <Navbar.Brand href="/">
                <img src="/static/logo192.png" alt="Team13 logo" />
                GKRC Team13s aktivitetslista
                </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="justify-content-end">
                <Nav className="mr-auto">
                    {!user.isLoggedIn ? null :
                        <Nav.Link href="/frontend/delistrequest">
                            Avbokningar
                            <span className='spacer' />
                            <Badge variant='secondary'>
                                {user.myDelistRequests}
                                {!user.isStaff ? null : ` / ${user.unansweredDelistRequests}`}
                                <div className='text-tooltip' style={{ fontWeight: 'normal' }}>
                                    Första siffran är antal av dina egna förfrågningar.<br />
                                    Den andra är totalt antal obesvarade från alla medlemmar.
                                </div>
                            </Badge>
                        </Nav.Link>
                    }
                    {!user.isStaff ? null :
                        <Nav.Link href="/admin">Administrera</Nav.Link>
                    }
                    <Nav.Link href="/frontend/faq">Hjälp</Nav.Link>
                    <NavDropdown title="Info" id="basic-nav-dropdown">
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="/frontend/eventtypes">Aktivitetstyper</NavDropdown.Item>
                        <NavDropdown.Item href="/frontend/activitytypes">Uppgiftstyper</NavDropdown.Item>
                    </NavDropdown>

                    {!user.isLoggedIn ? null :
                        <>
                            <Nav.Link mr-sm={2} href="/frontend/profile">Hej {user.fullname}!</Nav.Link>
                            <Nav.Link mr-sm={2} href="/frontend/notifications">
                                <Badge variant={user.notifications ? 'primary' : 'secondary'}>{user.notifications.length}
                                    <div className='text-tooltip' style={{ fontWeight: 'normal' }}>
                                        Olästa notifieringar
                                    </div>
                                </Badge>
                            </Nav.Link>
                            <Nav.Link mr-sm={2} href="/app/logout">Logga ut</Nav.Link>
                        </>
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Navigation;