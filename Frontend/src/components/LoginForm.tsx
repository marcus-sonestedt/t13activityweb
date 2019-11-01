import React, { Component, MouseEvent } from "react";
import { Form, FormControlProps, Button, Alert } from 'react-bootstrap'

export class LoginProps {
    onLoggedIn: ((token: string) => void) = (_) => { };
}

class LoginState {
    busy: boolean = false;
    errorMessage: string | null = null;
    email: string = "";
    password: string = "";
}

export class LoginForm extends Component<LoginProps, LoginState>
{
    state = new LoginState();

    handleLoginClick = (event: MouseEvent) => {
        event.preventDefault();
        this.setState({ errorMessage: null, busy: true });

        // TODO: Call backend and get login token
        setTimeout(() => {
            this.setState({ busy: false });

            if (this.state.email !== "macke@yar.nu")
                this.setState({ errorMessage: "Wrong email" });
            else {
                this.props.onLoggedIn("macke-token");
            }
        }, 1000);
    }

    handleSetupClick = (event: MouseEvent) => {
        event.preventDefault();
        //this.props.onSetup();
        alert("Not implemented yet");
    }

    handleEmailChange = (e: React.FormEvent<FormControlProps>) =>
        this.setState({ email: e.currentTarget.value as string });

    handlePasswordChange = (e: React.FormEvent<FormControlProps>) =>
        this.setState({ password: e.currentTarget.value as string });

    render = () => {
        const alert = this.state.errorMessage != null
            ? <Alert variant="danger">{this.state.errorMessage}</Alert> : null;

        return (
            <Form className={this.state.busy ? "busy" : ""}>
                <fieldset disabled={this.state.busy}>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>E-mailadress</Form.Label>
                        <Form.Control type="email"
                            placeholder="email@adress.se"
                            value={this.state.email}
                            onChange={this.handleEmailChange} />
                        <Form.Text className="text-muted">
                            Vi delar inte din e-mailadress med någon annan.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword">
                        <Form.Label>Lösenord</Form.Label>
                        <Form.Control type="password"
                            placeholder="Lösenord"
                            value={this.state.password}
                            onChange={this.handlePasswordChange} />
                    </Form.Group>

                    {alert}

                    <Button variant="primary" type="submit"
                        onClick={this.handleLoginClick}>
                        Logga in
                    </Button>

                    &nbsp;

                    <Button variant="primary" type="submit"
                        onClick={this.handleSetupClick}>
                            Skapa nytt konto
                    </Button>
                </fieldset>
            </Form>
        );
    }
}

export default LoginForm;