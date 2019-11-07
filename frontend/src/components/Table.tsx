import './Table.css'
import React from "react";
import { IdValue } from '../Models'
import { Table } from 'react-bootstrap'

export class TableView<T extends IdValue>
{
    constructor(onRowClick: (model:T) => void)
    {
        this.onRowClick = onRowClick;
    }

    onRowClick: (model:T) => void;

    handleRowClick = (
        e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, model: T) => {
        e.preventDefault();
        this.onRowClick(model);
    }

    render = (data: T[]) => {
        const content =
            data.length === 0
            ? <p>Ingen data</p>
            :
            <Table striped bordered hover>
            <thead>
                <tr>
                {data.length > 0 ?
                    Object.entries(data[0]).map(el => <th key={el[0]}>{el[0]}</th>)
                    : ''}
                </tr>
            </thead>
            <tbody>
                {data.map(this.renderRow)}
            </tbody>
        </Table>;

        return (
            <div className="table-container">
                {content}
            </div>
        );
    }

    private renderRow = (model: T) =>
        <tr key={model.id} data-item={model.id}
            onClick={e => this.handleRowClick(e, model)}>
            {Object.entries(model).map(el =>
                <td key={(model.id, el[0])}>{this.renderCell(el[1])}</td>
            )}
        </tr>;

    private renderCell = (data: any) => {
        if ( data.hasOwnProperty('name'))
            return data.name;
        else
            return data;
    }
}

export class PagedData<T>
{
    count:number = 0;
    next:any = null;
    previous:any = null;
    results:T[] = [];
}

export class PagedTableView<T extends IdValue> extends TableView<T>
{
    renderPaged = (data: PagedData<T>) =>
        <>
            {this.render(data.results)}
            <p>Visar {data.results.length}/{data.count} post(er).</p>
        </>;
}


export default TableView;
