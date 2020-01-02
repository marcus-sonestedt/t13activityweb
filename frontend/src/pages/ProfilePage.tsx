import React, { useContext } from "react"
import { Container, Row, Col } from "react-bootstrap"
import { userContext } from "../components/UserContext";

export const ProfilePage = () => {
    const user = useContext(userContext);

    return <Container>
        <Row>
            <Col>
                <h1>Min profil</h1>
                <h2>Namn: {user.fullname}</h2>
                <h4>Roll: {user.isStaff ? '(Personal)' : '(Medlem)'}</h4>
            </Col>
            <Col>
                <p>Arbete pågår</p>
            </Col>
        </Row>
    </Container>
}

export default ProfilePage;