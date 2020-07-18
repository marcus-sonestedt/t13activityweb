import React, { ChangeEvent, useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { createLicenseAsync, updateLicenseAsync } from "../logic/LicenseActions";
import { PagedLicenseTypes, License, LicenseType } from '../Models';
import { getJsonHeaders } from "../logic/ADRActions";
import { deserialize } from "class-transformer"

type FormControlElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

/* If member is null id,  will create new proxy-member on save */
export const LicenseEditForm = (props: {
    license?: License,
    onSaved?: (license: License) => void
    onError?: (err: string) => void
}) => {
    const { license, onSaved, onError} = props;

    const [validated, setValidated] = useState(false);
    const [type, setType] = useState(license?.type ?? '');
    const [level, setLevel] = useState(license?.level ?? '');
    const [types, setTypes] = useState<LicenseType[]>([]);

    useEffect(() => {
        const controller = new AbortController();
        
        fetch(LicenseType.apiUrlLíst, {
            signal: controller.signal,
            headers: getJsonHeaders()
        }).then(r => {
            if (r.status !== 200)
                throw r.statusText;
            return r.text();
        }).catch(e => {
            console.error(e);
            onError?.(e);
        }).then(json => {
            if (json)
                setTypes(deserialize(PagedLicenseTypes, json).results);
        });

        return function cleanup() { controller.abort();}        
    }, [setTypes, onError]);

    const typeObj = types?.find(t => t.id === type);       

    if (!license)
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

        license.type = type;
        license.level = level;

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
        <h2>Medlemsprofil</h2>
        <Form.Group controlId="formLicenseType">
            <Form.Label>Licenstyp</Form.Label>
            <Form.Control as="select" placeholder="---" required isValid={type !== ''}
                value={type} onChange={setState(setType)} >
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option> )}
            </Form.Control>
        </Form.Group>

        <Form.Group controlId="formLevel">
            <Form.Label>Licensnivå</Form.Label>
            <Form.Control type="text" required 
                placeholder={typeObj?.start_level +'-' + typeObj?.end_level} 
                isValid={level <= (typeObj?.start_level ?? '') && level >= (typeObj?.end_level ?? '')}
                value={level} onChange={setState(setLevel)} />
        </Form.Group>

        <div style={{ textAlign: 'right' }}>
            <Button type='submit' variant='primary'>Spara</Button>
            {' '}
            <Button type='submit' variant='outline-warning' onClick={window.location.reload}>Återställ</Button>
        </div>
    </Form>
}


