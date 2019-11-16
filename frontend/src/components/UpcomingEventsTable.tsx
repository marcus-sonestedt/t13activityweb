import React, { Component } from "react";
import { Container } from 'react-bootstrap'
import { Table } from 'react-bootstrap'
import { PagedValues, T13EventType, T13Event } from '../Models'
import { withRouter, RouteComponentProps } from 'react-router-dom';
import './Table.css'
import { ConditionalWrapper } from "./Utils";

interface Props
{
    values: PagedValues<T13Event>;
}

type MyProps = Props & RouteComponentProps<any>;

class UpcomingEvents extends Component<MyProps, {}>
{
    handleRowClick =
        (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, model: T13Event) =>
    {
        e.preventDefault();
        this.props.history.push(model.url());
    }

    render = () =>
        <Container className="table-container">
            <h3>
                <span className="table-title">Kommande händelser</span>
                <span className="table-count">
                    {this.props.values.results.length}/{this.props.values.count} st
                </span>
            </h3>
            <Table>
                <thead>
                    <th>Namn</th>
                    <th>Tid</th>
                    <th>Typ</th>
                </thead>
                <tbody>
                    {this.props.values.results.map(this.renderRow)}
                </tbody>
            </Table>
        </Container>

    renderRow = (model: T13Event) => {
        const type = model.type as T13EventType;
        return (
            <tr onClick={e => this.handleRowClick(e, model)}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td>{model.start_date} - {model.end_date}</td>
                <td>
                    <ConditionalWrapper condition={model.type != null}
                        wrap={(c:any) => <a href={type.url()}>{c}</a>}>
                        {model.type != null ? type.name : ""}
                    </ConditionalWrapper>
                </td>
            </tr>
        );
    }
}

export const UpcomingEventsTable = withRouter(UpcomingEvents);

