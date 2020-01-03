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
            3: <VerifyResult onNext={(ok: boolean) => setState(ok ? State.Success : State.Failure)}
                onPrevious={() => setState(State.SendEmail)} />,
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
                resp.json().then(member => {
                    setEmail(member.email);
                })
            });

        return controller.abort;
    }, [user.memberId])

    const onSubmit = () => {
        props.onNext();
    }

    const onEmailChange = (e: FormEvent<HTMLInputElement>) => {
        const control = e.target as HTMLInputElement;
        setEmail(control.value);
    }

    return <div>
        <p>Först kollar vi att din emailadress är rätt:</p>
        <Form onSubmit={onSubmit}>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email-address</Form.Label>
                <Form.Control type="phone" placeholder="Hämtar din emailaddress"
                    value={email} onChange={onEmailChange} />
                <Form.Text className="text-muted">
                    Vi skickar påminnelser och uppdateringar till din telefon.
                </Form.Text>
            </Form.Group>
            <Button variant="success" type="submit">
                Skicka verfieringsmail
            </Button>
        </Form>
    </div>
}

const SendEmail = (props: { onNext: () => void }) => {
    const [attempt, setAttempt] = useState(1);
    const [message, setMessage] = useState('Skickar verifieringsmail');

    useEffect(() => {
        if (attempt > 5) {
            setMessage("Det verkar gå dåligt. Försök senare eller kontakta kansliet.")
            return;
        }

        const controller = new AbortController();
        fetch(`/api/verify/email?attempt=${attempt}`,
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
        });

        return controller.abort;
    }, [attempt]);

    return <div>
        <Form>
            <p>{message}</p>
            <Button variant="success" type="submit" onClick={props.onNext}>
                Jag fick mailet, har klickat på länken.
            </Button>
            <Button variant="warning" type="submit" onClick={() => setAttempt(attempt + 1)}>
                Inget mail. Skicka igen.
            </Button>
        </Form>
    </div>
}

const VerifyResult = (props: { onNext: (ok: boolean) => void, onPrevious: () => void }) => {
    const user = useContext(userContext);
    const [verified, setVerified] = useState<boolean | null>(null);

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
                resp.json().then(member => {
                    setVerified(member.email_verified);
                })
            });

        return controller.abort;
    }, [user.memberId])

    if (verified === null)
        return <p>Väntar på svar...</p>

    if (verified === true) {
        props.onNext(true);
        return null;
    }

    return <>
        <h3>Kunde inte verifiera</h3>
        <Button onClick={() => props.onNext(false)} variant="danger">Avbryt</Button>
        <Button onClick={props.onPrevious} variant="secondary">Försök igen?</Button>
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