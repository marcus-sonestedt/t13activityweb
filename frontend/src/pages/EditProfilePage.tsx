import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { deserialize } from 'class-transformer';
import Cookies from 'universal-cookie';

import { Member, PagedMembers } from '../Models';
import DataProvider from '../components/DataProvider';
import NotFound from '../components/NotFound';

const cookies = new Cookies();

export const EditProfilePage = () => {
    const { id } = useParams();
    const [member, setMember] = useState<Member>();

    if (!id)
        return <NotFound />

    return <Container>
        <Row>
            <Col>
                <DataProvider<PagedMembers>
                    url={Member.apiUrlForId(id)}
                    ctor={json => deserialize(PagedMembers, json)}
                    onLoaded={data => setMember(data.results[0])}>
                    <ProfileEditForm member={member} />
                </DataProvider>
            </Col>
        </Row>
    </Container>
}

export const ProfileEditForm = (props: { member?: Member }) => {
    const [validated, setValidated] = useState(false);
    const { member } = props;

    if (!member) return null;

    const handleSubmit = (event: any) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            updateProfile(member);
        }

        setValidated(true);
    };

    return <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <h2>Medlemsprofil</h2>
        <Form.Group controlId="formFullName">
            <Form.Label>Namn</Form.Label>
            <Form.Control type="text" placeholder="Förnamn Efternam"
                value={member.fullname} required />
        </Form.Group>

        <Form.Group controlId="formBasicEmail">
            <Form.Label>Email-adress</Form.Label>
            <Form.Control type="email" placeholder="mitt.namn@domän.se"
                value={member.email} required />
        </Form.Group>

        <Form.Group controlId="formPhone">
            <Form.Label>Telefonnummer</Form.Label>
            <Form.Control type="tel" placeholder="+46123456789"
                value={member.phone_number} required />
        </Form.Group>

        <Form.Group controlId="formComment">
            <Form.Label>Övrig info</Form.Label>
            <Form.Control type="text" placeholder="..."
                value={member.comment} />
        </Form.Group>

        <Button type='submit' variant='primary'>Spara</Button>
        <Button type='submit' variant='danger' onClick={window.location.reload}>Återställ</Button>
    </Form>
}

const updateProfile = (member: Member) => {
    return fetch(member.apiUrl(), {
        method: 'PATCH',
        headers: { 'X-CSRFToken': cookies.get('csrftoken') }
    }).then(r => {
        if (r.status !== 200)
            throw r.statusText;
    }, r => {
        throw r
    }).catch(e => {
        console.error(e);
        alert("Något gick fel! :(\n" + e);
    }).finally(() => {
        window.location.reload();
    });
}