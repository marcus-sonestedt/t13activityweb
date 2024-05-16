import React, { useMemo, useEffect, ChangeEvent } from "react";
import { useContext, useState } from "react"
import { useParams } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { userContext } from "../components/UserContext"
import Cookies from "universal-cookie";

enum State {
    CheckAddress = 1,
    SendEmail = 2,
    VerifyResult = 3,
    Success = 4,
    Failure = 5
}

const cookies = new Cookies();

export const VerifyEmailPage = () => {
    const { initialState } = useParams();
    const startState : State = initialState !== undefined
        ? (State[initialState as string as keyof typeof State])
        : State.CheckAddress;
    const [state, setState] = useState(startState ?? State.CheckAddress);

    const stateForms: any = useMemo(() => {
        return {
            1: <CheckAddress onNext={() => setState(State.SendEmail)} />,
            2: <SendEmail onNext={() => setState(State.VerifyResult)} />,
            3: <VerifyResult setState={setState} />,
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
    const [storedEmail, setStoredEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('Kolla att din emailadress är rätt innan vi skickar mailet.')

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
                    const email = data.results[0].email;
                    setStoredEmail(email)
                    setEmail(email);
                })
            });

        return () => controller.abort();
    }, [user.memberId])

    const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        setEmail(target.value);
    }

    const onButtonClick = () => {
        if (email === storedEmail) {
            props.onNext();
            return;
        }

        setMessage("Uppdaterar emailaddress ...");
        setSending(true);

        fetch(`/api/user/${user.userId}`,
            {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRFToken': cookies.get('csrftoken'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email 
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
            setTimeout(props.onNext, 100);
        });
    }

    return <div>
        <p>{message}</p>
        <Form>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email-address</Form.Label>
                <Form.Control type="email" placeholder="Hämtar din emailaddress"
                    value={email} onChange={onEmailChange} />
                <Form.Text className="text-muted">
                    Vi skickar information, påminnelser och uppdateringar till din emailadress.
                </Form.Text>
            </Form.Group>
            <Button variant="success" onClick={onButtonClick} disabled={sending}>
                Skicka verifieringsmail
            </Button>
        </Form>
    </div>
}

const SendEmail = (props: { onNext: () => void }) => {
    const [attempt, setAttempt] = useState(1);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (attempt > 5) {
            setMessage("Det verkar gå dåligt. Försök senare eller kontakta kansliet.")
            return;
        }

        setMessage('Skickar verifieringsmail');
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
        }).catch(err => {
            console.error(err);
            alert("Något gick fel: " + err);
        }).finally(() => setSending(false));

        return () => controller.abort();
    }, [attempt, props]);

    const disable = sending || attempt > 5;

    return <div>
        <Form>
            <p>{message}</p>
            <Button variant="success" onClick={props.onNext} disabled={disable}>
                Jag fick mailet, har klickat på länken.
            </Button>
            {' '}
            <Button variant="warning" onClick={() => setAttempt(attempt + 1)} disabled={disable}>
                Inget mail. Skicka igen.
            </Button>
        </Form>
    </div>
}

const VerifyResult = (props: { setState: (state: State) => void }) => {
    const { setState } = props;
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
                    'Accept': 'application/json',
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
                        setTimeout(() => setState(State.Success), 500);
                    } else {
                        setMessage('Väntar lite...')
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
    }, [user.memberId, setState, recheck])

    return <>
        <h3>{message}</h3>
        <Button onClick={() => setState(State.CheckAddress)} variant="secondary" disabled={checking}>
            Kolla igen
        </Button>
        <Button onClick={() => setState(State.Failure)} variant="danger">
            Avbryt
        </Button>
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