import { Member } from "../Models";
import React, { useContext, useState } from "react";
import { userContext } from "../components/UserContext";
import { Container, Row, Col, Image } from "react-bootstrap";
import { MyProxiesTable, MySuperProxiesTable } from "../components/ProxiesTable";


export const ProxyComponent = (props: { member?: Member }) => {
    const { member } = props;
    const user = useContext(userContext);

    return <div>
        <h2>Detaljer</h2>
        <div className='div-group'>
            {(!member || !user.isLoggedIn) ?
                <p>Välj en underhuggare/medlem för att se mer information.</p>
                : <>
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
                </>}
        </div>
    </div >
}


export const MyProxiesPage = () => {
    const [proxy, setProxy] = useState<Member>();

    return <Container fluid>
        <Row>
            <Col lg={4} md={6}>
                <MyProxiesTable onProxySelected={setProxy} />
            </Col>
            <Col lg={4} md={6}>
                <MySuperProxiesTable onProxySelected={setProxy} />
            </Col>
            <Col lg={4} md={12}>
                <ProxyComponent member={proxy} />
            </Col>
        </Row>
    </Container>
}

