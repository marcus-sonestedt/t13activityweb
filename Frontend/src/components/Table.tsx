import React, { Component } from "react";
import { IdValue } from '../Models'
import { Table } from 'react-bootstrap'

export class TableView<T extends IdValue>
{
    constructor(onRowClick: (id:string) => void)
    {
        this.onRowClick = onRowClick;
    }

    onRowClick: (id:string) => void;

    handleRowClick = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
        e.preventDefault();
        const id = e.currentTarget.getAttribute("data-item");
        this.onRowClick(id as string);
    }

    render = (data: T[]) => {

        if (!data.length)
            return <p>Nothing to show</p>

        return (
            <div className="table-container">
                <h2 className="subtitle">
                    Showing <strong>{data.length} item(s)</strong>
                </h2>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            {Object.entries(data[0]).map(el => <th key={el[0]}>{el[0]}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(model => (
                            <tr key={model.id} data-item={model.id} onClick={this.handleRowClick}>
                                {Object.entries(model).map(el => <td key={(model.id, el[0])}>{el[1]}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default TableView;
