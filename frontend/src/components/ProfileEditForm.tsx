import { Member } from "../Models";
import React, { useState, FormEvent } from "react";
import { Form, Button } from "react-bootstrap";
import { updateProxy, createProxy } from "../logic/ProxyActions";

/* If member is null id,  will create new proxy-member on save */
export const ProfileEditForm = (props: {
    member?: Member,
    onSaved?: (member: Member) => void
}) => {
    const [validated, setValidated] = useState(false);
    const [member, setMember] = useState(props.member);
    const { onSaved } = props;

    if (!member)
        return null;

    const handleSubmit = (event: any) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else if (member.id !== null) {
            updateProxy(member);
            onSaved?.(member);
        } else {
            createProxy(member);
            onSaved?.(member);
        }

        setValidated(true);
    };

    const setProperty = (property:string) => {
        return (e:FormEvent<HTMLInputElement>) => {
            const m = member as any;
            m[property] = e.currentTarget.value; 
            setMember(m as Member);
        }
    }

    return <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <h2>Medlemsprofil</h2>
        <Form.Group controlId="formFullName">
            <Form.Label>Namn</Form.Label>
            <Form.Control type="text" placeholder="Förnamn Efternamn" required
                value={member.fullname} onChange={setProperty('fullname')}  />
        </Form.Group>

        <Form.Group controlId="formBasicEmail">
            <Form.Label>Email-adress</Form.Label>
            <Form.Control type="email" placeholder="mitt.namn@domain.se"  required
                value={member.email} onChange={setProperty('email')} />
        </Form.Group>

        <Form.Group controlId="formPhone">
            <Form.Label>Telefonnummer</Form.Label>
            <Form.Control type="tel" placeholder="+46123456789" required
                value={member.phone_number} onChange={setProperty('phone_number')}   />
        </Form.Group>

        <Form.Group controlId="formComment">
            <Form.Label>Övrig info</Form.Label>
            <Form.Control type="text" placeholder="..."
                value={member.comment} onChange={setProperty('comment')}  />
        </Form.Group>

        <Button type='submit' variant='primary'>Spara</Button>
        {' '}
        <Button type='submit' variant='outline-warning' onClick={window.location.reload}>Återställ</Button>
    </Form>
}

