import React, { ChangeEvent, useState, useContext } from "react";
import { Button, Form } from "react-bootstrap";
import { createLicenseAsync, updateLicenseAsync } from "../logic/LicenseActions";
import { License, LicenseType } from '../Models';
import { userContext } from "./UserContext";

type FormControlElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

/* If member is null id,  will create new proxy-member on save */
export const LicenseEditForm = (props: {
    license?: License,
    onSaved?: (license: License) => void,
    onError?: (err: string) => void,
    licenseTypes: LicenseType[]
}) => {
    const { license, onSaved, onError, licenseTypes} = props;

    const [validated, setValidated] = useState(false);
    const [type, setType] = useState(license?.type ?? '');
    const [level, setLevel] = useState(license?.level ?? '');
    const member = useContext(userContext).member;

    if (!license || !member)
        return null;

    const licenseType = licenseTypes?.find(t => t.id === type);       

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

        license.type = type;
        license.level = level;
        license.member = member.id;

        try {
            let l = license;
            if (l.id !== '') {
                await updateLicenseAsync(l);
            } else {
                l = await createLicenseAsync(l);
            }
            onSaved?.(l);
        } catch (e) {
            console.error(e);
            onError?.(e.toString());
        }
    };

    const setState = (f: (v: string) => void) => {
        return (e: ChangeEvent<FormControlElement>) => {
            f(e.currentTarget.value);
        }
    }

    return <Form validated={validated} onSubmit={handleSubmit}>
        <h2>Funktionärslicens</h2>
        <Form.Group controlId="formLicenseType">
            <Form.Label>Licenstyp</Form.Label>
            <Form.Control as="select" placeholder="---" required isValid={type !== ''}
                value={type} onChange={setState(setType)} >
                {licenseTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option> )}
            </Form.Control>
        </Form.Group>

        <Form.Group controlId="formLevel">
            <Form.Label>Licensnivå</Form.Label>
            <Form.Control type="text" required 
                placeholder={licenseType?.start_level +'-' + licenseType?.end_level} 
                isValid={level <= (licenseType?.start_level ?? '') && level >= (licenseType?.end_level ?? '')}
                value={level} onChange={setState(setLevel)} />
        </Form.Group>

        <div style={{ textAlign: 'right' }}>
            <Button type='submit' variant='primary'>Spara</Button>
            {' '}
            <Button type='submit' variant='outline-warning' onClick={window.location.reload}>Återställ</Button>
        </div>
    </Form>
}


