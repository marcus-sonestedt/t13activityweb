import { Member } from "../Models";
import React, { useContext, useState } from "react";
import { userContext } from "../components/UserContext";
import { Container, Row, Col, Image } from "react-bootstrap";
import { MyProxiesTable } from "../components/ProxiesTable";


export const ProxyComponent = (props: { member?: Member }) => {
    const { member } = props;
    const user = useContext(userContext);

    if (!member || !user.isLoggedIn)
        return null;

    return <div>
        <h3>Namn: {member.fullname}</h3>
        <h4>Email:{' '}
            <a href={`mailto:${member.email}`}>{member.email}</a>
        </h4>
        <h4>Telefon:{' '}
            <a href={`tel:${member.phone_number}`}>{member.phone_number}</a>
        </h4>
        {member.image_url === undefined ? null :
            <Image src={member.image_url} />
        }
    </div>
}


export const MyProxiesPage = () => {
    const [proxy, setProxy] = useState<Member>();

    return <Container>
        <Row>
            <Col lg={6} md={12}>
                <MyProxiesTable onProxySelected={setProxy}/>
            </Col>
            <Col lg={6} md={12}>
                <ProxyComponent member={proxy}/>
            </Col>
        </Row>
    </Container>
}

