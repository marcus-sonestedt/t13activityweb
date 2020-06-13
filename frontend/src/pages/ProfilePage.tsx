import React, { useContext, useState } from "react";
import { Badge, Button, Col, Container, Row, Image, Modal, Alert, Table } from "react-bootstrap";
import NotFound from "../components/NotFound";

import { userContext } from "../components/UserContext";
import { Member, License, Driver } from '../Models';
import { ProfileEditForm } from "../components/ProfileEditForm";
import { LicenseEditForm } from "../components/LicenseEditForm";
import { DriverEditForm } from "../components/DriverEditForm";
import { deleteDriverAsync } from '../logic/DriverActions';
import { deleteLicenseAsync } from '../logic/LicenseActions';

export const ProfilePage = () => {
    const user = useContext(userContext);
    const member = user.member;

    if (!user.isLoggedIn || !member)
        return <NotFound />

    return <Container fluid>

        <Row>
            <Col lg={1} md={0} />
            <Col lg={4} md={12}>
                <Profile member={member} />
            </Col>
            <Col lg={1} md={0} />
            <Col lg={5} md={12}>
                <Licenses member={member} />
                <Drivers member={member} />
            </Col>
            <Col lg={1} md={0} />
        </Row>
    </Container >
}

const Profile = (props: { member: Member }) => {
    const user = useContext(userContext);
    const { member } = props;
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [editError, setEditError] = useState<string>();

    const handleSavedProfile = (member?: Member) => {
        setShowProfileForm(false);
        if (member) {
            user.member = member;
            window.location.reload();
        }
    }

    const handleEditProfile = () => {
        setEditError(undefined);
        setShowProfileForm(true);
    }


    return <>
        <Modal show={showProfileForm} onHide={() => setShowProfileForm(false)}>
            <Modal.Header closeButton={true}>
                Editera profilinformation
            </Modal.Header>
            <Modal.Body>
                <ProfileEditForm member={member} onSaved={handleSavedProfile} onError={setEditError} />
                {editError ? <Alert variant='danger'><p>{editError}</p></Alert> : null}
            </Modal.Body>
        </Modal>
        <Row>
            <Col>
                <h1>Min profil</h1>
            </Col>
        </Row>
        <Row>
            <Col>
                <h3>
                    Namn:{' '}
                    <a href={Member.urlForId(member.id, member.fullname)}><i>{member.fullname}</i></a>{' '}
                </h3>
            </Col>
            <Col className='text-right'>
                <Button variant='primary' onClick={handleEditProfile}>
                    Ändra profil
                </Button>
                {' '}
                <a href="/app/change_password/">
                    <Button variant='warning'>Byt lösenord</Button>
                </a>
            </Col>
        </Row>
        <div>
            <h4>
                Email:
                        {' '}
                <a href={`mailto:${member.email}`}><i>{member.email}</i></a>
                {' '}
                {member.email_verified
                    ? <Badge variant='success'>Verifierad</Badge>
                    : <Button variant='warning' href="/frontend/verify/email">Behöver verifieras!</Button>}
            </h4>
            <h4>
                Telefon:
                        {' '}
                <a href={`tel:${member.phone_number}`}><i>{member.phone_number}</i></a>
                {' '}
                {member.phone_verified
                    ? <Badge variant='success'>Verifierat</Badge>
                    : <Button variant='warning' href="/frontend/verify/phone">Behöver verifieras!</Button>}
            </h4>

            <h4>Roll: <i style={{color:'lightblue'}}>{user.isStaff ? 'Personal' : 'Medlem'}</i></h4>
            <h4>Guldkortsnummer: <i style={{color:'lightblue'}}>{user.member?.membercard_number}</i></h4>
            {!member.image_url ? null : <Image src={member.image_url} />}
        </div>
    </>
}

const Licenses = (props: { member: Member }) => {
    const { member } = props;

    const [showLicenseForm, setShowLicenseForm] = useState(false);
    const [editError, setEditError] = useState<string>();
    const [license, setLicense] = useState<License>();

    const handleSavedLicense = (license?: License) => {
        setShowLicenseForm(false);
        if (license) {
            window.location.reload();
        }
    }

    const addLicense = () => {
        const l = new License();
        l.member = member.id;
        setLicense(l);
        setShowLicenseForm(true);
    }

    const editLicense = (license: License) => {
        setLicense(license);
        setShowLicenseForm(true);
    }

    const deleteLicense = async (license: License) => {
        if (!window.confirm(`Vill du verkligen ta bort licensen '${license.type}' ${license.level} ?`))
            return;

        try {
            await deleteLicenseAsync(license);
        } catch (e) {
            alert(e);
        }
        window.location.reload();
    }

    const renderLicense = (license: License) =>
        <tr key={license.type}>
            <td>{license.type}</td>
            <td><b>{license.level}</b></td>
            <td className='text-right'>
                <Button variant='danger' size='sm' onClick={() => deleteLicense(license)}>Radera</Button>{' '}
                <Button variant='primary' size='sm'onClick={() => editLicense(license)}>Editera</Button>
            </td>
        </tr>



    return <>
        <Modal show={showLicenseForm} onHide={() => setShowLicenseForm(false)}>
            <Modal.Header closeButton={true}>
                Editera licensinformation
            </Modal.Header>
            <Modal.Body>
                <LicenseEditForm license={license} onSaved={handleSavedLicense} onError={setEditError} />
                {editError ? <Alert variant='danger'><p>{editError}</p></Alert> : null}
            </Modal.Body>
        </Modal>

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
                    <thead><tr><th>Typ</th><th>Nivå</th><th /></tr></thead>
                    <tbody>{member.license_set.map(renderLicense)}</tbody>
                </Table>
            }
        </Row>
    </>
}

const Drivers = (props: { member: Member }) => {
    const { member } = props;
    const [showDriverForm, setShowDriverForm] = useState(false);
    const [driver, setDriver] = useState<Driver>();
    const [editError, setEditError] = useState<string>();

    const handleSavedDriver = (driver?: Driver) => {
        setShowDriverForm(false);
        if (driver) {
            window.location.reload();
        }
    }

    const addDriver = () => {
        const d = new Driver();
        d.member = member.id;
        setDriver(d);
        setShowDriverForm(true);
    }

    const editDriver = (driver: Driver) => {
        setDriver(driver);
        setShowDriverForm(true);
    }

    const deleteDriver = async (driver: Driver) => {
        if (!window.confirm(`Vill du verkligen ta bort förare/fordon '${driver.name}' #${driver.number} ?`))
            return;

        try {
            await deleteDriverAsync(driver);
        } catch (e) {
            alert(e);
        }

        window.location.reload();
    }

    const renderDriver = (driver: Driver) =>
        <tr key={driver.id}>
            <td>{driver.name}</td>
            <td>{driver.number}</td>
            <td>{driver.klass}</td>
            <td>{driver.birthday}</td>
            <td className='text-right'>
                <Button variant='danger' size='sm' onClick={() => deleteDriver(driver)}>Radera</Button>{' '}
                <Button variant='primary' size='sm' onClick={() => editDriver(driver)}>Editera</Button>
            </td>
        </tr>

    return <>
        <Modal show={showDriverForm} onHide={() => setShowDriverForm(false)}>
            <Modal.Header closeButton={true}>
                Editera förar/fordondsinformaton
            </Modal.Header>
            <Modal.Body>
                <DriverEditForm driver={driver} onSaved={handleSavedDriver} onError={setEditError} />
                {editError ? <Alert variant='danger'><p>{editError}</p></Alert> : null}
            </Modal.Body>
        </Modal>
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
                    <thead><tr><th>Namn</th><th>Nummer</th><th>Klass</th><th>Födelsedatum</th><th /></tr></thead>
                    <tbody>{member.driver_set.map(renderDriver)}</tbody>
                </Table>
            }
        </Row>
    </>
}


export default ProfilePage;
