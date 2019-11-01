import React, { Component } from "react";

class DataState<T> {
    data: T[] | null = null;
    placeholder: string = "Laddar...";
};

export class DataProps<T>  {
    endpoint: string = "";
    render = (data: T[]) => <div>{data}</div>;
    onLoaded = (data: T[]) => { };
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
            });
    }

    render = () => {
        const { data, placeholder } = this.state;

        return data !== null
            ? this.props.render(data as T[])
            : <p>{placeholder}</p>;
    }
}

export default DataProvider;
