import React, { useMemo, FormEvent, useEffect } from "react";
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

export const VerifyPhonePage = () => {
    const [state, setState] = useState(State.CheckPhoneNumber);
     
    const setStateLog = (state:State) => {
        console.info("New State: " + State[state]);
        setState(state);
    }

    const stateForms = useMemo(() => {
        return {
            1: <CheckPhoneNumber setState={setStateLog} />,
            2: <SendCode setState={setStateLog} />,
            3: <VerifyCode setState={setStateLog} />,
            4: <Success />,
            5: <Failure onRestart={() => setStateLog(State.CheckPhoneNumber)} />
        }
    }, []);

    return <Container>
        <Row className="justify-content-md-center">
            <Col md='6'>
                <h1>Verifiera telefonummer</h1>
                {stateForms[state]}
            </Col>
        </Row>
    </Container>
}

const addCountryPrefix = (number: string) =>
    number.startsWith('0') ? number.replace("0", "+46") : number;

const CheckPhoneNumber = (props: { setState: (state: State) => void }) => {
    const user = useContext(userContext);
    const [phone, setPhone] = useState('');
    const [storedPhone, setStoredPhone] = useState('');
    const [message, setMessage] = useState('Först kollar vi att ditt telefonnummer är rätt:');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setSending(true);
        fetch(`/api/member/${user.memberId}`,
            {
                headers: {
                    Accept: 'application/json',
                    'X-CSRFToken': cookies.get('csrftoken'),
                },
                signal: controller.signal,
                cache: "no-store"

            }).then(resp => {
                if (resp.status >= 300) throw resp.statusText;
                resp.json().then(data => {
                    const number = data.results[0].phone_number;
                    setStoredPhone(number);
                    setPhone(addCountryPrefix(number));
                })
            }).finally(() => setSending(false));

        return () => controller.abort();
    }, [user.memberId])

    const onPhoneChange = (e: FormEvent<HTMLInputElement>) => {
        let number = (e.target as HTMLInputElement).value.toString();
        setPhone(addCountryPrefix(number));
    }

    const onButtonClick = () => {
        if (phone === storedPhone) {
            props.setState(State.SendCode);
            return;
        }

        setMessage("Uppdaterar telefonnummer ...");
        setSending(true);

        fetch(`/api/member/${user.memberId}`,
            {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRFToken': cookies.get('csrftoken'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user.memberId,
                    phone_number: phone
                }),
                cache: "no-store"
            }
        ).then((resp) => {
            if (resp.status >= 300) {
                resp.text().then(console.error);
                throw resp.statusText;
            }
        }).finally(() => {
            setSending(false);
            setTimeout(() => props.setState(State.SendCode), 100);
        });
    }

    return <div>
        <p>{message}</p>
        <Form>
            <Form.Group controlId="formBasicPhoneNumber">
                <Form.Label>Telefonnummer inkl. landskod (t.ex. +46701234567)</Form.Label>
                <Form.Control type="phone" placeholder="Hämtar ditt telefonnummer"
                    value={phone} onChange={onPhoneChange} />
                <Form.Text className="text-muted">
                    Vi skickar påminnelser och uppdateringar till din telefon.
                </Form.Text>
            </Form.Group>
            <Button variant="success" onClick={onButtonClick} disabled={sending}>
                Skicka verfieringskod
            </Button>
        </Form>
    </div>
}

const SendCode = (props: { setState: (state: State) => void }) => {
    const [message, setMessage] = useState('Skickar verifieringskod via SMS...');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setSending(true);

        const controller = new AbortController();
        fetch(`/api/verify/phone/send`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRFToken': cookies.get('csrftoken'),
            },
            signal: controller.signal,
            cache: "no-store"
        }).then(resp => {
            if (resp.status >= 300) {
                setMessage("Misslyckades med att skicka SMS: " + resp.statusText);
                resp.text().then(console.error);
                throw resp.statusText;
            }

            setTimeout(() => setMessage("SMS skickat!"), 1000);
        }).catch(err => { throw err }
        ).finally(() => setSending(false));

        return () => controller.abort();
    }, []);

    return <Form>
        <p>Status: {message}</p>
        <Button variant="success" onClick={() => props.setState(State.VerifyCode)} disabled={sending}>
            Jag fick en kod
        </Button>
        <span className='spacer' />
        <Button variant="warning" onClick={() => props.setState(State.CheckPhoneNumber)} disabled={sending}>
            Inget händer, dubbelkolla numret
        </Button>
    </Form>
}

const VerifyCode = (props: { setState: (state: State) => void}) => {
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("Skriv in koden");

    const onCodeChange = (e: any) => { setCode(e.target.value) };

    const onCodeSubmit = () => {
        const ctrl = new AbortController();
        setSubmitting(true);
        setMessage("Kontrollerar koden...");

        fetch(`/api/verify/phone/check/${code}`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRFToken': cookies.get('csrftoken'),
                },
                signal: ctrl.signal
            }).then(resp => {
                if (resp.status >= 300) {
                    resp.text().then(console.error);
                    throw resp.statusText;
                }

                return resp.text();
            }).then(status => {
                console.info("Phone verification: " + status);
                setMessage("Status: " + status);
                setTimeout(() => props.setState(status === '"approved"' ? State.Success : State.Failure), 1000);
                return;
            }).catch(err => {
                console.error(err);
                setMessage(`Något gick fel:\n${err}`);
            }).finally(() => {
                setSubmitting(false);               
            });
    };  

    return <>
        <p>{message}</p>
        <Form>
            <Form.Group controlId="formVerifyCode">
                <Form.Label>Verifieringskod</Form.Label>
                <Form.Control type="text" placeholder="Skriv koden du fick i ditt SMS"
                    value={code} onChange={onCodeChange} disabled={submitting} />
                <Form.Text className="text-muted">
                    Vi skickar påminnelser och uppdateringar till din telefon.
                </Form.Text>
            </Form.Group>
            <Button onClick={onCodeSubmit} variant="success" disabled={submitting}>Verifiera koden</Button>
            <span className="spacer" />
            <Button onClick={() => props.setState(State.SendCode)} variant="secondary" disabled={submitting}>Skicka ny kod</Button>
            <span className="spacer" />
            <Button onClick={() => props.setState(State.Failure)} variant="danger">Avbryt</Button>
        </Form>
    </>
}

const Success = () => {
    return <>
        <h3>Telefonnumret verifierat!</h3>
        <h1><span role="img" aria-label='thumbsup'>👍</span></h1>
        <p>Kör så det ryker!</p>
        <a href="/"><Button>Tillbaka till startsidan</Button></a>
    </>
}
const Failure = (props: { onRestart: () => void }) => {
    return <>
        <h3>Något gick fel!</h3>
        <h1><span role="img" aria-label='thinking-face'>🤔</span></h1>
        <p>
            Om ditt telefonnummer verkligen är rätt, försök igen lite senare eller kontakta kansliet.
        </p>
        <Button onClick={props.onRestart}>Försök igen</Button>
        <a href="/"><Button>Tillbaka till startsidan</Button></a>
    </>
}

export default VerifyPhonePage;