import React, { useContext, useState } from "react"
import { Container, Row, Col, Button, Badge, Form } from "react-bootstrap"
import { userContext } from "../components/UserContext";
import NotFound from "../components/NotFound";
import { getJsonHeaders } from '../logic/ADRActions';
import { Member } from '../Models';

const saveProfile = (id: string, propertyName: string, value: any) => {
    var data: any = {};
    data.id = id;
    data[propertyName] = value;

    fetch(Member.apiUrlForId(id), {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify(data)
    }
    ).then(r => {
        if (r.status >= 300) {
            r.text().then(t => console.error(t));
            throw r.statusText;
        }
    }).catch(e => window.alert("Något gick fel :(\n\n" + e)
    ).finally(() =>
        fetch('/api/isloggedin', { cache: 'reload' })
            .finally(() => window.location.reload())
    );
}

export const ProfilePage = () => {
    const user = useContext(userContext);
    const member = user.member;

    const [nameEdit, setNameEdit] = useState(false);
    const [emailEdit, setEmailEdit] = useState(false);
    const [phoneEdit, setPhoneEdit] = useState(false);

    const [name, setName] = useState(member?.fullname ?? '');
    const [email, setEmail] = useState(member?.email ?? '');
    const [phone, setPhone] = useState(member?.phone_number ?? '');

    if (!user.isLoggedIn || !member)
        return <NotFound />

    const ShowEmail = () => <>
        <a href={`mailto:${member.email}`}>{member.email}</a>
        {' '}
        <Button variant='secondary' onClick={() => setEmailEdit(true)} size='sm'>Ändra</Button>
        {' '}
        {member.email_verified
            ? <Badge variant='success'>Verifierad</Badge>
            : <Button variant='warning' href="/frontend/verify/email">Behöver verifieras!</Button>}
    </>

    const ShowPhone = () => <>
        <a href={`tel:${member.phone_number}`}>{member.phone_number}</a>
        {' '}
        <Button variant='secondary' onClick={() => setPhoneEdit(true)} size='sm'>Ändra</Button>
        {' '}
        {
            member.phone_verified
                ? <Badge variant='success'>Verifierat</Badge>
                : <Button variant='warning' href="/frontend/verify/phone">Behöver verifieras!</Button>
        }
    </>

    const EditField = (props: {
        value: string,
        setValue: (v: string) => void,
        originalValue: string,
        propertyName: string,
        setEditState: (value: boolean) => void
    }) => {
        const p = props;
        return <Form>
            <Form.Control type="email" value={p.value} onChange={(e: any) => p.setValue(e.target.value)} />
            <Button variant='success' onClick={() => {
                p.setValue(p.value);
                saveProfile(user.memberId, p.propertyName, p.value)
                p.setEditState(false);
            }}>
                Spara
            </Button>
            {' '}
            <Button variant='danger' onClick={() => {
                p.setValue(p.originalValue);
                p.setEditState(false);
            }}>
                Avbryt
            </Button>
        </Form>
    }
    return <Container>
        <Row>
            <Col lg={8} md={12}>
                <h1>Min profil</h1>
                <div>
                    <h3>{nameEdit
                        ? <EditField value={name} setValue={setName} originalValue={member.fullname}
                            propertyName='fullname' setEditState={setNameEdit} />
                        : <>
                            <a href={Member.urlForId(member.id, member.fullname)}>{member.fullname}</a>{' '}
                            <Button variant='secondary' onClick={() => setNameEdit(true)} size='sm'>Ändra</Button>
                        </>}
                    </h3>
                    <h4>Email:{' '}{emailEdit
                        ? <EditField value={email} setValue={setEmail} originalValue={member.email}
                            propertyName='email' setEditState={setEmailEdit} />
                        : <ShowEmail />}
                    </h4>
                    <h4>Telefon:{' '}{phoneEdit
                        ? <EditField value={phone} setValue={setPhone} originalValue={member.phone_number ?? ''}
                            propertyName='phone_number' setEditState={setPhoneEdit} />
                        : <ShowPhone />}
                    </h4>
                    <h4>Roll: {user.isStaff ? 'Personal' : 'Medlem'}</h4>
                    <h4>Guldkortsnummer: {user.member?.membercard_number}</h4>
                    {/*} {!member.image_url ? null : <Image src={member.image_url} /> } */}
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