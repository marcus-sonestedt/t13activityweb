import React, { Component } from "react";
import { Container, Alert, Image } from 'react-bootstrap'

class DataState<T> {
    data: T | null = null;
    placeholder: string = "Laddar...";
    error: string | null = null;
};

export class DataProps<T>  {
    ctor!: {(any: any): T; };
    endpoint: string = "";
    onLoaded = (data: T) => { };
}

export class DataProvider<T>
    extends Component<DataProps<T>, DataState<T>>
{
    state = new DataState<T>();

    componentDidMount = () => {

        fetch(this.props.endpoint)
            .then(response =>
                response.status !== 200
                    ? (this.setState({
                        placeholder: "Oops. Något gick fel! :(" + response.text(),
                        error: `Error ${response.status}: ${response.statusText}`
                    }), "")
                    : response.text()
            ).then(data => {
                var typedData = this.props.ctor(data);
                this.setState({ data:typedData });
                this.props.onLoaded(typedData);
            }).catch(e => {
                console.error(e);
                this.setState({
                    placeholder: "Oops. Något gick fel. :(",
                    error: e.toString()
                });
            },);
    }

    /*
    componentWillUnmount = () => {
        this.setState({data: null})
        // todo: cancel fetch
    }
    */

    render = () => {
        const { data, placeholder, error } = this.state;

        if (data !== null && data !== undefined)
            return this.props.children;

        if (error != null)
            return <Container fluid>
                <p>{placeholder}</p>
                <Image src='/static/brokenpiston.jpg' alt="Broken piston" className="errorImage" mx-auto />
                <Alert variant='warning'>{error}</Alert>
            </Container>;

        return <p>{placeholder}</p>
    }
}

export default DataProvider;
