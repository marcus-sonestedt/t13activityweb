import { Member } from "../Models";
import React, { useContext, useState } from "react";
import { userContext } from "../components/UserContext";
import { Container, Row, Col, Image } from "react-bootstrap";
import { MyProxiesTable, /* MySuperProxiesTable */ } from "../components/ProxiesTable";
import { MemberActivitiesTable } from "../components/MemberActivitiesTable";


export const ProxyComponent = (props: { proxy?: Member }) => {
    const { proxy } = props;
    const user = useContext(userContext);

    if (!user.isLoggedIn)
        return null

    return <div>
        <h1>Detaljer</h1>
        <div className='div-group'>
            {!proxy
                ? <p>Välj en underhuggare/medlem för att se mer information.</p>
                : <>
                    <h3>Namn: {proxy.fullname}</h3>
                    <p>Email:{' '}
                        <a href={`mailto:${proxy.email}`}>{proxy.email}</a>
                    </p>
                    <p>Telefon:{' '}
                        <a href={`tel:${proxy.phone_number}`}>{proxy.phone_number}</a>
                    </p>
                    {proxy.image_url === undefined ? null :
                        <Image src={proxy.image_url} />
                    }
                    <MemberActivitiesTable memberId={proxy.id}/>
                </>}
        </div>
    </div >
}


export const ProxiesPage = () => {
    const [proxy, setProxy] = useState<Member>();

    return <Container fluid>
        <Row>
            <Col lg={6} md={12}>
                <MyProxiesTable onProxySelected={setProxy} />
            </Col>
            {/* not yet implemented
            <Col lg={4} md={6}>
                <MySuperProxiesTable onProxySelected={setProxy} />
            </Col>
            */}
            <Col lg={6} md={12}>
                <ProxyComponent proxy={proxy} />
            </Col>
        </Row>
    </Container>
}

