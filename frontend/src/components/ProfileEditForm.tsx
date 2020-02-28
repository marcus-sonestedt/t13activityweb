import { Member } from "../Models";
import React, { useState, FormEvent } from "react";
import { Form, Button } from "react-bootstrap";
import { updateProxyAsync, createProxyAsync } from "../logic/ProxyActions";

/* If member is null id,  will create new proxy-member on save */
export const ProfileEditForm = (props: {
    member?: Member,
    onSaved?: (member: Member) => void
    onError?: (err: string) => void
}) => {
    const [validated, setValidated] = useState(false);
    const [fullname, setFullname] = useState(props.member?.fullname ?? '');
    const [email, setEmail] = useState(props.member?.email ?? '');
    const [phone, setPhone] = useState(props.member?.phone_number ?? '');
    const [comment, setComment] = useState(props.member?.comment ?? '');

    const { member, onSaved } = props;

    if (!member)
        return null;

    const handleSubmit = async (event: any) => {
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setValidated(false);
            return;
        }

        setValidated(true);

        if (!member)
            return;

        member.fullname = fullname;
        member.email = email;
        member.phone_number = phone;
        member.comment = comment;

        try {
            let m = member;
            if (m.id !== '') {
                await updateProxyAsync(m);
            } else {
                m = await createProxyAsync(m);
            }
            onSaved?.(m);
        } catch (e) {            
            console.error(e);
            props.onError?.(e);
        }
    };

    const setState = (f: (v: string) => void) => {
        return (e: FormEvent<HTMLInputElement>) => {
            f(e.currentTarget.value);
        }
    }

    return <Form validated={validated} onSubmit={handleSubmit}>
        <h2>Medlemsprofil</h2>
        <Form.Group controlId="formFullName">
            <Form.Label>Namn</Form.Label>
            <Form.Control type="text" placeholder="Förnamn Efternamn" required
                value={fullname} onChange={setState(setFullname)} />
        </Form.Group>

        <Form.Group controlId="formBasicEmail">
            <Form.Label>Email-adress</Form.Label>
            <Form.Control type="email" placeholder="fornamn.efternamn@domain.se" required
                value={email} onChange={setState(setEmail)} />
        </Form.Group>

        <Form.Group controlId="formPhone">
            <Form.Label>Telefonnummer</Form.Label>
            <Form.Control type="tel" placeholder="+46123456789" required
                value={phone} onChange={setState(setPhone)}   />
        </Form.Group>

        <Form.Group controlId="formComment">
            <Form.Label>Övrig info</Form.Label>
            <Form.Control type="text" placeholder="..."
                value={comment} onChange={setState(setComment)}  />
        </Form.Group>

        <Button type='submit' variant='primary'>Spara</Button>
        {' '}
        <Button type='submit' variant='outline-warning' onClick={window.location.reload}>Återställ</Button>
    </Form>
}

