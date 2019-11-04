import React, { Component } from "react";
import { Row, Col } from 'react-bootstrap'

class DataState<T> {
    data: T | null = null;
    placeholder: string = "Laddar...";
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
                        placeholder: `Oops. Något gick fel! :(\n(Error ${response.status}: ${response.statusText})`})
                    : response.json()
            }).then(data => {
                this.setState({ data: data });
                this.props.onLoaded(data);
            }).catch(e => {
                console.error(e);
                this.setState({
                    placeholder: "Oops. Något gick fel. :("
                });
            });
    }

    render = () => {
        const { data, placeholder } = this.state;

        return (data !== null && data !== undefined)
            ? this.props.render(data as T)
            : <div>
                <p>{placeholder}</p>
            </div>;
    }
}

export default DataProvider;
