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
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const controller = new AbortController();
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
                    setPhone(data.results[0].phone_number);
                })
            });

        return () => controller.abort();
    }, [user.memberId])

    const onPhoneChange = (e: FormEvent<HTMLInputElement>) => {
        const control = e.target as HTMLInputElement;
        setPhone(control.value);
    }

    return <div>
        <p>Först kollar vi att ditt telefonnummer är rätt:</p>
        <Form>
            <Form.Group controlId="formBasicPhoneNumber">
                <Form.Label>Telefonnummer</Form.Label>
                <Form.Control type="phone" placeholder="Hämtar ditt telefonnummer"
                    value={phone} onChange={onPhoneChange} />
                <Form.Text className="text-muted">
                    Vi skickar påminnelser och uppdateringar till din telefon.
                </Form.Text>
            </Form.Group>
            <Button variant="success" onClick={props.onNext}>
                Skicka verfieringskod
            </Button>
        </Form>
    </div>
}

const SendCode = (props: { onNext: () => void }) => {
    const [attempt, setAttempt] = useState(1);
    const [message, setMessage] = useState('Skickar verifieringskod via SMS...');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (attempt > 5) {
            setMessage("Det verkar gå dåligt. Försök senare eller kontakta kansliet.")
            return;
        }

        setSending(true);

        const controller = new AbortController();
        fetch(`/api/verify/phone/send?attempt=${attempt}`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRFToken': cookies.get('csrftoken'),
                },
                signal: controller.signal,
                cache: "no-store"
            }
        ).then(resp => {
            if (resp.status >= 300) {
                setMessage("Misslyckades med att skicka SMS: " + resp.statusText);
                resp.text().then(console.error);
                throw resp.statusText;
            }

            setMessage("SMS skickat!");
        })
        .catch(err => { throw err })
        .finally(() => setSending(false));
        
        return () => controller.abort();
    }, [attempt]);

    return <Form>
        <p>Status: {message}</p>
        <Button variant="success" onClick={props.onNext} disabled={sending}>
            Jag fick en kod
        </Button>
        <span className='spacer'/>
        <Button variant="warning" onClick={() => setAttempt(attempt + 1)} disabled={sending}>
            Testa igen
        </Button>
    </Form>
}

const VerifyCode = (props: { onNext: (ok: boolean) => void, onPrevious: () => void }) => {
    const user = useContext(userContext);
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const onCodeChange = ((e: any) => setCode(e.target.value));

    const onCodeSubmit = () => {
        setSubmitting(true);
        const controller = new AbortController();
        fetch(`/api/member/${user.memberId}`,
            {
                headers: {
                    Accept: 'application/json',
                    'X-CSRFToken': cookies.get('csrftoken'),
                },
                signal: controller.signal,
                cache: "no-store"

            }).then(resp => {
                if (resp.status >= 300) {
                    resp.text().then(console.error);
                    throw resp.statusText;
                }

                return resp.text()
            })
            .then(status => props.onNext(status === 'approved'))
            .catch(err => {
                alert(`Något gick fel:\n${err}`); 
                console.error(err);
            })
            .finally(() => setSubmitting(false));
    };

    return <Form onSubmit={onCodeSubmit}>
        <Form.Group controlId="formVerifyCode">
            <Form.Label>Verifieringskod</Form.Label>
            <Form.Control type="text" placeholder="Skriv koden du fick i ditt SMS"
                value={code} onChange={onCodeChange}  disabled={submitting}/>
            <Form.Text className="text-muted">
                Vi skickar påminnelser och uppdateringar till din telefon.
            </Form.Text>
        </Form.Group>
        <Button variant="success" type="submit" disabled={submitting}>
            Skicka verfieringskod
        </Button>
        <Button onClick={props.onPrevious} variant="secondary" disabled={submitting}>Skicka kod igen</Button>
        <Button onClick={() => props.onNext(false)} variant="danger">Avbryt</Button>
    </Form>
}

const Success = (props: {}) => {
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