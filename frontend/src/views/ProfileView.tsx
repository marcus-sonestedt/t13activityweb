import React, { useContext } from "react"
import { Container, Row, Col } from "react-bootstrap"
import { userContext } from "../App";

export const ProfileView = () => {
    const user = useContext(userContext);

    return <Container><Row><Col>
        <h1>Min profil</h1>
        <h2>Namn: {user.fullname} {user.isStaff ? '(Personal)' : '(Medlem'}</h2>
        <p>Arbete pågår</p>
    </Col></Row></Container>
}

export default ProfileView;