import React, {  } from "react";
import { Container } from 'react-bootstrap'
import { Table } from 'react-bootstrap'
import { PagedT13Events, T13EventType, T13Event } from '../Models'
import { useHistory } from 'react-router-dom';
import { ConditionalWrapper } from "./Utils";
import './Table.css'

export interface MyProps {
    events: PagedT13Events;
    title?: string
}

export function UpcomingEventsTable
    ({ events, title = "Kommande händelser" }: MyProps) {
        const history = useHistory();

        const handleRowClick =
            (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, model: T13Event) => {
                e.preventDefault();
                history.push(model.url());
            };

        const renderRow = (model: T13Event) => {
            const type = model.type as T13EventType;
            return (
                <tr onClick={e => handleRowClick(e, model)}>
                    <td><a href={model.url()}>{model.name}</a></td>
                    <td>{model.start_date} - {model.end_date}</td>
                    <td>
                        <ConditionalWrapper condition={model.type != null}
                            wrap={(c: any) => <a href={type.url()}>{c}</a>}>
                            {model.type != null ? type.name : ""}
                        </ConditionalWrapper>
                    </td>
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
                        <th>Namn</th>
                        <th>Tid</th>
                        <th>Typ</th>
                    </thead>
                    <tbody>
                        {events.results.map(renderRow)}
                    </tbody>
                </Table>
            </Container>
        );
    }

export default UpcomingEventsTable;

