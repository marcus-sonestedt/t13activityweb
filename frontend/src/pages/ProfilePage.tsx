import React, { useContext, useState } from "react";
import { Badge, Button, Col, Container, Row, Image, Modal, Alert } from "react-bootstrap";
import NotFound from "../components/NotFound";

import { userContext } from "../components/UserContext";
import { Member, LicenseType, License } from '../Models';
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

    const renderLicense = (license:License) => 
        <li>{((license.type) as LicenseType).name} {license.level}</li>;

    return <Container>
        <Row>
            <Col lg={8} md={12}>
                <Row>
                    <Col>
                        <h1>Min profil</h1>
                    </Col>
                    <Col>
                        <Button variant='secondary' onClick={handleEditProfile}>
                            Editera
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
                <div>
                    <h3>
                        <a href={Member.urlForId(member.id, member.fullname)}>{member.fullname}</a>{' '}
                    </h3>
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
                    <h4>Guldkortsnummer: {member.membercard_number}</h4>
                    {!member.image_url ? null : <Image src={member.image_url} />}
                    <h4>Funktionärslicenser:</h4>
                    {!member.licenses ? "Inga licenser" :
                    <ul>
                        {member.licenses.map(renderLicense)}
                    </ul>}
                </div>
            </Col>
            <Col lg={4} md={12}>
                <h2>Övriga inställningar</h2>
                <a href="/app/change_password/">
                    <Button>Ändra lösenord</Button>
                </a>
            </Col>
        </Row>
    </Container >
}

export default ProfilePage;
