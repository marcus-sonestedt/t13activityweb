import React, { useContext, useState } from "react";
import { Badge, Button, Col, Container, Row, Image, Modal, Alert, Table } from "react-bootstrap";
import NotFound from "../components/NotFound";

import { userContext } from "../components/UserContext";
import { Member, LicenseType, License, Driver } from '../Models';
import { ProfileEditForm } from "../components/ProfileEditForm";

export const ProfilePage = () => {
    const user = useContext(userContext);
    const member = user.member;
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editError, setEditError] = useState<string>();

    if (!user.isLoggedIn || !member)
        return <NotFound />

    const handleSaved = (member?: Member) => {
        setShowEditDialog(false);
        if (member) {
            user.member = member;
            window.location.reload();
        }
    }

    const handleEditProfile = () => {
        setEditError(undefined);
        setShowEditDialog(true);
    }

    const addLicense = () => {}
    const addDriver = () => {}

    const renderLicense = (license:License) => 
        <tr>
            <td>{license.type}</td>
            <td><b>{license.level}</b></td>
            <td className='text-right'>
                <Button variant='danger' size='sm'>Radera</Button>{' '}
                <Button size='sm'>Editera</Button>
            </td>
        </tr>

    const renderDriver = (driver:Driver) => 
        <tr>
            <td>{driver.name}</td>            
            <td>{driver.number}</td>            
            <td>{driver.klass}</td>            
            <td>{driver.birthday}</td>            
            <td className='text-right'>
                <Button variant='danger' size='sm'>Radera</Button>{' '}
                <Button size='sm'>Editera</Button>
            </td>
        </tr>

    return <Container fluid>
        <Row>
            <Col lg={1} md={0}/>
            <Col lg={4} md={12}>
                <Row>
                    <Col>
                        <h1>Min profil</h1>
                    </Col>                  
                    <Col className='text-right'>
                        <Button variant='secondary' onClick={handleEditProfile}>
                            Ändra profil
                        </Button>
                    </Col>
                </Row>
                <Modal show={showEditDialog} onHide={() => setShowEditDialog(false)}>
                    <Modal.Header closeButton={true}>
                        Editera profilinformation
                    </Modal.Header>
                    <Modal.Body>
                        <ProfileEditForm member={member} onSaved={handleSaved} onError={setEditError} />
                        {editError ? <Alert variant='danger'><p>{editError}</p></Alert> : null}
                    </Modal.Body>
                </Modal>
                <Row>
                    <Col>
                    <h3>
                        <a href={Member.urlForId(member.id, member.fullname)}>{member.fullname}</a>{' '}
                    </h3>
                    </Col>
                    <Col className='text-right'>
                        <a href="/app/change_password/">
                            <Button>Byt lösenord</Button>
                        </a>
                    </Col>
                </Row>
                <div>
                    <h4>
                        Email:
                        {' '}
                        <a href={`mailto:${member.email}`}>{member.email}</a>
                        {' '}
                        {member.email_verified
                            ? <Badge variant='success'>Verifierad</Badge>
                            : <Button variant='warning' href="/frontend/verify/email">Behöver verifieras!</Button>}
                    </h4>
                    <h4>
                        Telefon:
                        {' '}
                        <a href={`tel:${member.phone_number}`}>{member.phone_number}</a>
                        {' '}
                        {member.phone_verified
                            ? <Badge variant='success'>Verifierat</Badge>
                            : <Button variant='warning' href="/frontend/verify/phone">Behöver verifieras!</Button>}
                    </h4>

                    <h4>Roll: {user.isStaff ? 'Personal' : 'Medlem'}</h4>
                    <h4>Guldkortsnummer: {user.member?.membercard_number}</h4>
                    {!member.image_url ? null : <Image src={member.image_url} />}
                </div>
            </Col>
            <Col lg={1} md={0}/>
            <Col lg={5} md={12}>
                <Row>
                    <Col>
                        <h3>Funktionärslicenser</h3>
                    </Col>
                    <Col className='text-right'>
                        <Button variant='success' onClick={addLicense} size='sm'>
                            Lägg till
                        </Button>
                    </Col>
                </Row>
                <Row>
                    {!member.license_set
                        ? "Inga licenser" 
                        : <Table striped responsive >
                            <thead><tr><th>Typ</th><th>Nivå</th><th/></tr></thead>
                            <tbody>{member.license_set.map(renderLicense)}</tbody>
                        </Table>
                    } 
                </Row>
                <Row>
                    <Col>
                        <h3>Fordon/Förare</h3> 
                    </Col>
                    <Col className='text-right'>
                        <Button variant='success' onClick={addDriver} size='sm'>
                            Lägg till
                        </Button>
                    </Col>
                </Row>
                <Row>
                {!member.driver_set
                    ? "Inga fordon" 
                    : <Table striped responsive >
                        <thead><tr><th>Namn</th><th>Nummer</th><th>Klass</th><th>Födelsedatum</th><th/></tr></thead>
                        <tbody>{member.driver_set.map(renderDriver)}</tbody>
                    </Table>
                }    
                </Row>
            </Col>
            <Col lg={1} md={0}/>
        </Row>
    </Container >
}

export default ProfilePage;
