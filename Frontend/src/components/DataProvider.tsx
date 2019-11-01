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
                if (response.status !== 200) {
                    console.error(response.statusText);
                    this.setState({
                        placeholder: "Oops. Något gick fel. :("
                    });
                    return;
                }

                return response.json();
            })
            .then(data => {
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

        return data !== null
            ? this.props.render(data as T)
            : <Row><Col lg={12}><p>{placeholder}</p></Col></Row>;
    }
}

export default DataProvider;
