import React, { ChangeEvent, useState } from "react";
import { Button, Form } from "react-bootstrap";
import moment from 'moment';

import { createDriverAsync, updateDriverAsync } from "../logic/DriverActions";
import { Driver, CarClass } from '../Models';
import './Form.css';

type FormControlElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

/* If member is null id,  will create new proxy-member on save */
export const DriverEditForm = (props: {
    driver?: Driver,
    onSaved?: (driver: Driver) => void,
    onError?: (err: string) => void,
    classes: CarClass[]
}) => {
    const { driver, onSaved, onError, classes } = props;

    const [validated, setValidated] = useState(false);
    const [name, setName] = useState(driver?.name ?? '');
    const [number, setNumber] = useState(driver?.number ?? 0);
    const [klass, setKlass] = useState(driver?.klass ?? '');
    const [birthday, setBirthday] = useState(driver?.birthday ?? new Date(2001,0,1,1,0,0));

    if (!driver)
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

        driver.name = name;
        driver.number = number;
        driver.klass = klass;
        driver.birthday = birthday;

        try {
            let d = driver;
            if (d.id !== '') {
                await updateDriverAsync(d);
            } else {
                d = await createDriverAsync(d);
            }
            onSaved?.(d);
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
        <h2>Förare och fordon</h2>
        <Form.Group controlId="formFullName">
            <Form.Label>Fullständigt namn</Form.Label>
            <Form.Control type="text" placeholder="Förnamn Efternamn" required
                isValid={name.length >= 3 && name.indexOf(' ') > 0}
                value={name} onChange={setState(setName)} />
        </Form.Group>

        <Form.Group controlId="formNumber">
            <Form.Label>Nummer på kart</Form.Label>
            <Form.Control type="number" placeholder="44" required isValid={(number ?? 0) > 0}
                value={number?.toString() ?? "0"} onChange={setState(x => setNumber(parseInt(x)))} />
        </Form.Group>

        <Form.Group controlId="formKlass">
            <Form.Label>Klass</Form.Label>
            <Form.Control as="select" placeholder="J125" required isValid={klass.length > 0}
                value={klass} onChange={setState(setKlass)}>
                <option key={undefined} value=""/>
                {classes.map(c => <option key={c.id} value={c.id}>{c.abbrev} - {c.name}</option>)}
            </Form.Control>
        </Form.Group>

        <Form.Group controlId="formBirthday">
            <Form.Label>Födelsedatum</Form.Label>
            <Form.Control type="date" placeholder="2001-02-03"
                value={moment(birthday).format("YYYY-MM-DD")}
                onChange={setState(x => setBirthday(() => new Date(x) ))}/>
        </Form.Group>

        <div style={{ textAlign: 'right' }}>
            <Button type='submit' variant='primary'>Spara</Button>
            {' '}
            <Button type='submit' variant='outline-warning' onClick={window.location.reload}>Återställ</Button>
        </div>
    </Form>
}


