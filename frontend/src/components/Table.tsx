import './Table.css'
import React, { Component } from "react";
import { IdValue, PagedValues } from '../Models'
import { Table } from 'react-bootstrap'

export type TableProps<T> =
{
    title: string,
    columns: any,
    values: T[],

    onRowClick: (model:T) => void,
    renderCount: () => JSX.Element | null,
}

const defaultTableProps = {
    title: "Tabell",
    values: [],
    onRowClick: (_:any) => {},
    renderCount: null as ((() => JSX.Element) | null)
}

export class TableView<T extends IdValue> extends Component<TableProps<T>>
{
    static defaultProps = defaultTableProps;

    renderCount = () => (this.props.renderCount || this.DefaultRenderCount)();

    private DefaultRenderCount = () => <span>({this.props.values.length})</span>

    handleRowClick =
        (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, model: T) =>
    {
        e.preventDefault();
        this.props.onRowClick(model);
    }

    render = () =>
        <div className="table-container">
            <h3>
                <span className="table-title">{this.props.title}</span>
                <span className="table-count">{this.renderCount()}</span>
            </h3>
            <Table striped hover>
                <thead>
                    <tr>
                        {Object.entries(this.props.columns).map(el =>
                            <th key={el[0]}>{this.props.columns[el[0]]}</th>)
                        }
                    </tr>
                </thead>
                <tbody>
                    {this.props.values.map(this.renderRow)}
                </tbody>
            </Table>
        </div>;

    private renderRow = (model: T) =>
        <tr key={model.id} data-item={model.id}
            onClick={e => this.handleRowClick(e, model)}>
            {Object.entries(this.props.columns).map(col =>
                    <td key={model.id + " " + col[0]}>
                        <a href={"/frontend/something/" + model.id}>
                            {this.renderCell((model as any)[col[0]])}
                        </a>
                    </td>
            )}
        </tr>;

    private renderCell = (data: any) => {
        if ( data === undefined || data === null)
            return data;
        if ( data.hasOwnProperty('name'))
            return data.name;

        return data;
    }
}

export type PagedTableProps<T> = {
    pagedValues: PagedValues<T>;
} & TableProps<T>;

export class PagedTableView<T extends IdValue> extends Component<PagedTableProps<T>, {}>
{
    static defaultProps = defaultTableProps;

    renderCount = () => (this.props.renderCount || this.DefaultRenderCount)();

    DefaultRenderCount = () =>
        <span>
            ({this.props.pagedValues.results.length}/{this.props.pagedValues.count})
        </span>;

    render = () =>
        <TableView
            {...this.props}
            values={this.props.pagedValues.results}
            renderCount={this.renderCount}
        />;
}

export default TableView;
