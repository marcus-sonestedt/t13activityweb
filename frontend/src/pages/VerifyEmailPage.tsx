import React, { useMemo, FormEvent, useEffect } from "react";
import { useContext, useState } from "react"
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { userContext } from "../components/UserContext"
import Cookies from "universal-cookie";
import { useParams } from "react-router-dom";

enum State {
    CheckAddress = 1,
    SendEmail = 2,
    VerifyResult = 3,
    Success = 4,
    Failure = 5
}

const cookies = new Cookies();

export const VerifyEmailPage = (props: {}) => {
    const { initialState } = useParams();
    const [state, setState] = useState(initialState !== undefined ? parseInt(initialState) as State : State.CheckAddress);

    const stateForms: any = useMemo(() => {
        return {
            1: <CheckAddress onNext={() => setState(State.SendEmail)} />,
            2: <SendEmail onNext={() => setState(State.VerifyResult)} />,
            3: <VerifyResult onNext={(ok: boolean) => setState(ok ? State.Success : State.Failure)} />,
            4: <Success />,
            5: <Failure onRestart={() => setState(State.CheckAddress)} />
        }
    }, []);

    return <Container>
        <Row className="justify-content-md-center">
            <Col md='auto'>
                <h1>Verifiera emailaddress</h1>
                {stateForms[state.valueOf()]}
            </Col>
        </Row>
    </Container>
}

const CheckAddress = (props: { onNext: () => void }) => {
    const user = useContext(userContext);
    const [email, setEmail] = useState('');

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
                    setEmail(data.results[0].email);
                })
            });

        return () => controller.abort();
    }, [user.memberId])

    const onEmailChange = (e: FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        setEmail(target.value);
    }

    return <div>
        <p>Kolla att din emailadress är rätt innan vi skickar mailet.</p>
        <Form>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email-address</Form.Label>
                <Form.Control type="email" placeholder="Hämtar din emailaddress"
                    value={email} onChange={onEmailChange} />
                <Form.Text className="text-muted">
                    Vi skickar information, påminnelser och uppdateringar till din emailadress.
                </Form.Text>
            </Form.Group>
            <Button variant="success" onClick={props.onNext}>
                Skicka verifieringsmail
            </Button>
        </Form>
    </div>
}

const SendEmail = (props: { onNext: () => void }) => {
    const [attempt, setAttempt] = useState(1);
    const [message, setMessage] = useState('Skickar verifieringsmail');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (attempt > 5) {
            setMessage("Det verkar gå dåligt. Försök senare eller kontakta kansliet.")
            return;
        }
        setSending(true);

        const controller = new AbortController();
        fetch(`/api/verify/email/send?attempt=${attempt}`,
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
                setMessage("Misslyckades med att skicka Mail: " + resp.statusText);
                resp.text().then(console.error)
                throw resp.statusText;
            }

            setMessage("Mail skickat!");
            resp.text().then(() => props.onNext());
        })
            .catch(err => {
                console.error(err);
                alert("Något gick fel: " + err);
            })
            .finally(() => setSending(false));

        return () => controller.abort();
    }, [attempt, props]);

    const disable = sending || attempt > 5;

    return <div>
        <Form>
            <p>{message}</p>
        </Form>
        <Button variant="success" onClick={props.onNext} disabled={disable}>
            Jag fick mailet, har klickat på länken.
            </Button>
        <Button variant="warning" onClick={() => setAttempt(attempt + 1)} disabled={disable}>
            Inget mail. Skicka igen.
            </Button>
    </div>
}

const VerifyResult = (props: { onNext: (ok: boolean) => void }) => {
    const { onNext } = props;
    const user = useContext(userContext);

    const [message, setMessage] = useState('Kontrollerar med servern...');
    const [checking, setChecking] = useState(false);
    const [recheck, setRecheck] = useState(0);

    useEffect(() => {
        if (recheck > 120) {
            setMessage("Ingen idé att vänta längre här");
            return;
        }

        const controller = new AbortController();
        setChecking(true);
        fetch(`/api/member/${user.memberId}`,
            {
                headers: {
                    Accept: 'application/json',
                    'X-CSRFToken': cookies.get('csrftoken'),
                },
                signal: controller.signal,
                cache: "no-store"
            }).then(resp => {
                if (resp.status >= 300)
                    throw resp.statusText;
                resp.json().then(data => {
                    const verified = data.results[0].email_verified;
                    setMessage(verified ? "Klart!" : "Ej verifierad.");
                    if (verified === true) {
                        setTimeout(() => onNext(true), 500);
                    } else {
                        setTimeout(() => setRecheck(recheck + 1), 1000);
                    }
                });
            }).catch(e => {
                if (e.name === 'AbortError') {
                    console.debug("Silencing AbortError: " + e);
                    return;
                }
                throw e;
            }).finally(() => setChecking(false));

        return () => controller.abort();
    }, [user.memberId, onNext, recheck])

    return <>
        <h3>{message}</h3>
        <Button onClick={() => setRecheck(0)} variant="secondary" disabled={checking}>Kolla igen?</Button>
        <Button onClick={() => onNext(false)} variant="danger">Avbryt?</Button>
    </>
}

const Success = (props: {}) => {
    return <>
        <h3>Emailadressen verifierad!</h3>
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
            Om din emailaddress verkligen är rätt, försök igen lite senare eller kontakta kansliet.
        </p>
        <Button onClick={props.onRestart}>Försök igen</Button>
        <a href="/"><Button>Tillbaka till startsidan</Button></a>
    </>
}


export default VerifyEmailPage;