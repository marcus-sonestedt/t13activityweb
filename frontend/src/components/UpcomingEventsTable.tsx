import React, { } from "react";
import { Table } from 'react-bootstrap'
import { PagedT13Events, T13Event } from '../Models'
import './Table.css'

export interface MyProps {
    events: PagedT13Events;
    title?: string
}

export function UpcomingEventsTable
    ({ events, title = "Kommande aktiviteter" }: MyProps) {

    const renderRow = (model: T13Event) => {
        const type = model.type === null ? null :
            <a href={model.type.url()}>{model.type.name}</a>

        return (
            <tr key={model.id}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td>{model.date()}</td>
                <td>{type}</td>
                <td></td>
            </tr>
        );
    }

    return (
        <div className="table-container">
            <h3>
                <span className="table-title">{title}</span>
                <span className="table-count">
                    ({events.results.length}/{events.count})
                </span>
            </h3>
            <Table>
                <thead>
                    <tr>
                        <th>Namn</th>
                        <th>Datum</th>
                        <th>Typ</th>
                        <th>Uppgifter</th>
                    </tr>
                </thead>
                <tbody>
                    {events.results.map(renderRow)}
                </tbody>
            </Table>
        </div>
    );
}

export default UpcomingEventsTable;

