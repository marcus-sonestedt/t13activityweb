import React, { useContext } from "react"
import { Container, Row, Col, Button, Badge } from "react-bootstrap"
import { userContext } from "../components/UserContext";
import NotFound from "../components/NotFound";

export const ProfilePage = () => {
    const user = useContext(userContext);
    const member = user.member;

    if (!user.isLoggedIn || !member)
        return <NotFound />

    return <Container>
        <Row>
            <Col>
                <h1>Min profil</h1>
                <div>
                    <h3>Namn: {member.fullname}</h3>
                    <h4>Email:{' '}
                        <a href={`mailto:${member.email}`}>{member.email}</a>
                        {' '}
                        {member.email_verified
                            ? <Badge variant='success'>Verifierad</Badge>
                            : <Button variant='warning' href="/frontend/verify/email">Behöver verifieras!</Button>}
                    </h4>
                    <h4>Telefon:{' '}
                        <a href={`tel:${member.phone_number}`}>{member.phone_number}</a>
                        {' '}
                        {member.phone_verified
                            ? <Badge variant='success'>Verifierat</Badge>
                            : <Button variant='warning' href="/frontend/verify/phone">Behöver verifieras!</Button>}
                    </h4>
                    <h4>Roll: {user.isStaff ? 'Personal' : 'Medlem'}</h4>
                    {/*} {!member.image_url ? null : <Image src={member.image_url} /> } */}
                </div>
            </Col>
            <Col>
                <h2>Inställningar</h2>
                <a href="/app/change_password/">
                    <Button>Ändra lösenord</Button>
                </a>
            </Col>
        </Row>
    </Container>
}

export default ProfilePage;