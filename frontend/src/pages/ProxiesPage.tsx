import { Member, PagedMembers } from "../Models";
import React, { useContext, useState, useCallback } from "react";
import { userContext } from "../components/UserContext";
import { Container, Row, Col, Image, Button, Modal } from "react-bootstrap";
import { MyProxiesTable, /* MySuperProxiesTable */ } from "../components/ProxiesTable";
import { MemberActivitiesTable } from "../components/MemberActivitiesTable";
import { ProfileEditForm } from "../components/ProfileEditForm";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import { InfoText } from "../components/Utilities";


export const ProxyComponent = (props: {
    proxy?: Member,
    onChanged?: (m: Member) => void
}) => {
    const { proxy } = props;
    const user = useContext(userContext);
    const [editProxy, setEditProxy] = useState<Member>();

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setEditProxy(proxy);
    }

    const saveProxy = (result?: Member) => {
        if (result && props.onChanged) {
            console.info(result);
            props.onChanged(result);
        }
        setEditProxy(undefined);
    }

    if (!user.isLoggedIn)
        return null

    return <>
        <h2>Detaljer</h2>
        <Modal show={editProxy !== undefined} onHide={() => saveProxy(undefined)}>
            <Modal.Header closeButton={true}>
                Editera underhuggare
            </Modal.Header>
            <Modal.Body>
                <ProfileEditForm member={editProxy} onSaved={saveProxy} />
            </Modal.Body>
        </Modal>
        <div className='div-group'>
            {!proxy
                ? <p>Välj en underhuggare för att se och/eller ändra information.</p>
                : <>
                    <h3>
                        <a href={proxy.url()}>{proxy.fullname}</a>
                        {' '}
                        <Button onClick={handleClick}  variant='outline-secondary'>
                            Editera
                        </Button>
                    </h3>
                    <p>Email:{' '}
                        <a href={`mailto:${proxy.email}`}>{proxy.email}</a>
                    </p>
                    <p>Telefon:{' '}
                        <a href={`tel:${proxy.phone_number}`}>{proxy.phone_number}</a>
                    </p>
                    {proxy.image_url === undefined ? null :
                        <Image src={proxy.image_url} />
                    }
                    <MemberActivitiesTable memberId={proxy.id} />
                </>}
        </div>
    </>
}


export const ProxiesPage = () => {
    const [proxy, setProxy] = useState<Member>();
    const setProxiesCallback = useCallback(data => setProxies(data.results), []);
    const [proxies, setProxies] = useState<Member[]>([]);
    const [reload, setReload] = useState(0);

    const handleChanged = (updatedProxy: Member) => {
        debugger
        const index = proxies.findIndex(p => p.id === updatedProxy.id);
        proxies[index] = updatedProxy;
        setProxies(proxies);
        setReload(r => r+1);
    }

    return <Container fluid>
        <Row>
            <Col lg={4} md={9}>
                <DataProvider<PagedMembers>
                    url={`/api/proxy/my`}
                    ctor={json => deserialize(PagedMembers, json)}
                    onLoaded={setProxiesCallback}>
                    <MyProxiesTable key={reload} proxies={proxies} onProxySelected={setProxy} />
                </DataProvider>
            </Col>
            {/* not yet implemented
            <Col lg={4} md={6}>
                <MySuperProxiesTable onProxySelected={setProxy} />
            </Col>
            */}
            <Col lg={6} md={12}>
                <ProxyComponent proxy={proxy} onChanged={handleChanged} />
            </Col>
            <Col lg={2} md={3}>
                <InfoText textKey="proxies"/>
            </Col>
        </Row>
    </Container>
}

