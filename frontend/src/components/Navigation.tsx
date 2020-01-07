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
                <img src="/static/logo192.png" alt="Team13 logo" />
                Team13s aktivitetswebb
                </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="justify-content-end">
                <Nav className="mr-auto">
                    {!user.isLoggedIn ? null :
                        <Nav.Link href="/frontend/delistrequest">
                            Avbokningar
                            <span className='spacer' />
                            <HoverTooltip tooltip={
                                "Första siffran är antal av dina egna förfrågningar. \n" +
                                "Den andra är totalt antal obesvarade från alla medlemmar."
                            }>
                                <Badge variant='secondary'>
                                    {user.myDelistRequests}
                                    {!user.isStaff ? null : ` / ${user.unansweredDelistRequests}`}
                                </Badge>
                            </HoverTooltip>
                        </Nav.Link>
                    }
                </Nav>
                <Nav>
                    <Nav.Link href="/frontend/faq">Hjälp</Nav.Link>
                    {!user.isStaff ? null :
                        <Nav.Link href="/admin">Administrera</Nav.Link>
                    }
                    {!user.isLoggedIn ? null :
                        <>
                            <Nav.Link mr-sm={2} href="/frontend/profile">Hej {user.fullname}!</Nav.Link>
                            <Nav.Link mr-sm={2} href="/frontend/notifications">
                                <HoverTooltip placement='left' tooltip='Olästa notifieringar'>
                                    <Badge variant={user.notifications.length ? 'primary' : 'secondary'}>
                                        {user.notifications.length}
                                    </Badge>
                                </HoverTooltip>
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