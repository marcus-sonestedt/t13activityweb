import React, { Component, MouseEvent } from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

export class LoginProps {
    onLoggedIn: ((token: string) => void) | null = null;
}

export class LoginForm extends Component<LoginProps, {}>
{
    state = {}

    handleLoginClick = (event: MouseEvent) => {
        event.preventDefault();
        if (this.props.onLoggedIn != null)
            this.props.onLoggedIn("macke");
    }

    handleSetupClick = (event: MouseEvent) => {
        event.preventDefault();
        //this.props.onSetup();
    }

    render() {
        return <Form>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>E-mailadress</Form.Label>
                <Form.Control type="email" placeholder="email@adress.se" />
                <Form.Text className="text-muted">
                    Vi delar inte din e-mailadress med någon annan.
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
                <Form.Label>Lösenord</Form.Label>
                <Form.Control type="password" placeholder="Lösenord" />
            </Form.Group>

            <Button variant="primary" type="submit" onClick={this.handleLoginClick}>
                Logga in
            </Button>
            &nbsp;
            <Button variant="primary" type="submit" onClick={this.handleSetupClick}>
                Skapa nytt konto
            </Button>
        </Form>;
    }
}

export default LoginForm;