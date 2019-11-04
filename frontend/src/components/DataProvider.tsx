import React, { Component } from "react";
import { Container, Alert, Image } from 'react-bootstrap'

class DataState<T> {
    data: T | null = null;
    placeholder: string = "Laddar...";
    error: string | null = null;
};

export class DataProps<T>  {
    endpoint: string = "";
    render = (data: T) => <div>{data}</div>;
    onLoaded = (data: T) => { };
}

export class DataProvider<T>
    extends Component<DataProps<T>, DataState<T>>
{
    state = new DataState<T>();

    componentDidMount = () => {

        fetch(this.props.endpoint)
            .then(response => {
                return response.status !== 200
                    ? this.setState({
                        placeholder: "Oops. Något gick fel! :(",
                        error: `Error ${response.status}: ${response.statusText}`
                    })
                    : response.json()
            }).then(data => {
                this.setState({ data: data });
                this.props.onLoaded(data);
            }).catch(e => {
                console.error(e);
                this.setState({
                    placeholder: "Oops. Något gick fel. :(",
                    error: e.toString()
                });
            });
    }

    render = () => {
        const { data, placeholder, error } = this.state;

        if (data !== null && data !== undefined)
            return this.props.render(data as T);

        if (error != null)
            return <Container fluid>
                <p>{placeholder}</p>
                <Image src='/static/brokenpiston.jpg' alt="Broken piston" className="errorImage"/>
                <Alert variant='warning'>{error}</Alert>
            </Container>;

        return <p>{placeholder}</p>
    }
}

export default DataProvider;
