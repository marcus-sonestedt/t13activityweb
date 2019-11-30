import React, { } from "react";
import { Container, Table } from 'react-bootstrap'
import { PagedT13Events,  T13Event } from '../Models'
import './Table.css'

export interface MyProps {
    events: PagedT13Events;
    title?: string
}

export function UpcomingEventsTable
    ({ events, title = "Kommande aktiviteter" }: MyProps) {

    const renderRow = (model: T13Event) => {
        const type = model.type === null ? null :
            <a href={"../" + model.type.url()}>{model.type.name}</a>

        return (
            <tr key={model.id}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td>{model.start_date} - {model.end_date}</td>
                <td>{type}</td>
            </tr>
        );
    }

    return (
        <Container className="table-container">
            <h3>
                <span className="table-title">{title}</span>
                <span className="table-count">
                    {events.results.length}/{events.count} st
                    </span>
            </h3>
            <Table>
                <thead>
                    <tr>
                        <th>Namn</th>
                        <th>Tid</th>
                        <th>Typ</th>
                    </tr>
                </thead>
                <tbody>
                    {events.results.map(renderRow)}
                </tbody>
            </Table>
        </Container>
    );
}

export default UpcomingEventsTable;

