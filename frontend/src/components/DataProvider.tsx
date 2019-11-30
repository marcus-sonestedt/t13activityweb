import React, { Component } from "react";
import { Container, Alert, Image } from 'react-bootstrap'

class DataState<T> {
    data: T | null = null;
    placeholder: string = "Laddar...";
    error: string | null = null;
};

export class DataProps<T>  {
    ctor!: { (any: any): T; };
    endpoint: string = "";
    onLoaded = (data: T) => { };
}

export class DataProvider<T>
    extends Component<DataProps<T>, DataState<T>>
{
    state = new DataState<T>();

    controller = new AbortController();

    componentDidMount = () => {

        fetch(this.props.endpoint, { signal: this.controller.signal })
            .then(r => {
                if (r.status !== 200) {
                    this.setState({
                        placeholder: "Oops. Något gick fel! :(",
                        error: `Error ${r.status}: ${r.statusText}}\n`
                    });
                    r.text().then(errorBody => this.setState(
                        { error: this.state.error + errorBody }
                    ));
                } else {
                    return r.text();
                }
            }).then(data => {
                if (this.controller.signal.aborted)
                    return;
                var typedData = this.props.ctor(data);
                this.setState({ data: typedData });
                this.props.onLoaded(typedData);
            }).catch(e => {
                if (e.name === 'AbortError')
                    return
                console.error(e);
                this.setState({
                    placeholder: "Oops. Något gick fel. :(",
                    error: e.toString()
                });
            });
    }

    componentWillUnmount = () => {
        this.controller.abort()
    }

    render = () => {
        const { data, placeholder, error } = this.state;

        if (data !== null && data !== undefined)
            return this.props.children;

        if (error != null)
            return <Container fluid>
                <p>{placeholder}</p>
                <Image src='/static/brokenpiston.jpg' alt="Broken piston" className="errorImage" fluid />
                <Alert variant='warning'>{error}</Alert>
            </Container>;

        return <p>{placeholder}</p>
    }
}

export default DataProvider;
