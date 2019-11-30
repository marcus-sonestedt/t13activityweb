import React, { } from "react";
import { useHistory } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap'
import { PagedT13Events,  T13Event } from '../Models'
import './Table.css'

export interface MyProps {
    events: PagedT13Events;
    title?: string
}

export function UpcomingEventsTable
    ({ events, title = "Kommande aktiviteter" }: MyProps) {
    const history = useHistory();

    const handleRowClick =
        (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, model: T13Event) => {
            e.preventDefault();
            history.push(model.url());
        };

    const renderRow = (model: T13Event) => {
        return (
            <tr key={model.id} onClick={e => handleRowClick(e, model)}
                className='linked'>
                <td><a href={model.url()}>{model.name}</a></td>
                <td>{model.start_date} - {model.end_date}</td>
                <td>{model.type != null ? model.type.name : null}</td>
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

