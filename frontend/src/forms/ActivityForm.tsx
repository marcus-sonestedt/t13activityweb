import React, { Component } from "react";
import { Form, FormControlProps, Button, Alert } from 'react-bootstrap'
import { Activity } from '../Models'

export class ActivityFormProps {
    model: Activity | undefined = undefined;
    onSave = (model: Activity) => true;
}

class ActivityFormState {
    model: Activity | undefined = undefined;
    changed: boolean = false;
}

export class ActivityForm
    extends Component<ActivityFormProps, ActivityFormState>
{
    state = new ActivityFormState();

    handleSave = (e: React.FormEvent<FormControlProps>) => {
        if(this.props.onSave(this.state.model as Activity))
            this.setState({changed: false});
    }

    handleReset = (e: React.FormEvent<FormControlProps>) => {
        this.setState({model: this.props.model})
    }

    render = () => {
        if (this.state.model === undefined)
            return null;

        return <Form>
            <Form.Label>Namn</Form.Label>
            <Form.Control type="text" disabled={true}
                value={this.state.model.name} />
            <Form.Label>Kommentar</Form.Label>
            <Form.Control type="text"
                value={this.state.model.comment} />
            <Button variant="primary" type="submit"
                onClick={this.handleSave}>Spara</Button>
            <Button variant="secondary" type="submit"
                onClick={this.handleReset}>Återställ</Button>
        </Form>
    }
}

export default ActivityForm;