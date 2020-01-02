import React, { useMemo, FormEvent } from "react";
import { useContext, useState } from "react"
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { userContext } from "../components/UserContext"
import Cookies from "universal-cookie";

enum State {
    CheckPhoneNumber = 1,
    SendCode = 2,
    VerifyCode = 3,
    Success = 4,
    Failure = 5
};

const cookies = new Cookies();

export const VerifyPhonePage = (props: {}) => {
    const [state, setState] = useState(State.CheckPhoneNumber);

    const stateForms = useMemo(() => {
        return {
            1: <CheckPhoneNumber onNext={() => setState(State.SendCode)} />,
            2: <SendCode onNext={() => setState(State.VerifyCode)} />,
            3: <VerifyCode onNext={(ok: boolean) => setState(ok ? State.Success : State.Failure)}
                onPrevious={() => setState(State.SendCode)} />,
            4: <Success />,
            5: <Failure onRestart={() => setState(State.CheckPhoneNumber)} />
        }
    }, []);

    return <Container>
        <Row className="justify-content-md-center">
            <Col md='auto'>
                <h1>Verifiera telefonummer</h1>
                {stateForms[state]}
            </Col>
        </Row>
    </Container>
}

const CheckPhoneNumber = (props: { onNext: () => void }) => {
    const user = useContext(userContext);
    const [phone, setPhone] = useState('')

    const onSubmit = () => {
        props.onNext();
    }

    const onPhoneChange = (e: FormEvent<HTMLInputElement>) => {
        const control = e.target as HTMLInputElement;
        setPhone(control.value);
    }

    return <div>
        <p>Först kollar vi att ditt telefonnummer är rätt:</p>
        <Form onSubmit={onSubmit}>
            <Form.Group controlId="formBasicPhoneNumber">
                <Form.Label>Telefonnummer</Form.Label>
                <Form.Control type="phone" placeholder="Hämtar ditt telefonnummer"
                    value={phone} onChange={onPhoneChange} />
                <Form.Text className="text-muted">
                    Vi skickar påminnelser och uppdateringar till din telefon.
                </Form.Text>
            </Form.Group>
            <Button variant="success" type="submit">
                Skicka verfieringskod
            </Button>
        </Form>
    </div>
}

const SendCode = (props: { onNext: () => void }) => {
    const [send, setSend] = useState(1);


    return <div>
        <Form>
            <p>Då skickar vi koden</p>
            <Button variant="success" type="submit" onClick={props.onNext}>
                Jag fick en kod
        </Button>
            <Button variant="warning" type="submit" onClick={() => setSend(send + 1)}>
                Testa igen
        </Button>
        </Form>
    </div>
}

const VerifyCode = (props: { onNext: (ok:boolean) => void, onPrevious: () => void }) => {
    return <div/>
}

const Success = (props: {}) => {
    return <div/>
}

const Failure = (props: { onRestart: () => void }) => {
    return <div/>
}



export default VerifyPhonePage;