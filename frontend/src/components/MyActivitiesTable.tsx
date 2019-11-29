import React, { Component } from "react";
import { Container } from 'react-bootstrap'
import { Activity, T13Event } from '../Models'
import { Table } from 'react-bootstrap'
import { ConditionalWrapper } from "./Utils";
import './Table.css'

class Props
{
    values: Activity[] = [];
    onRowClick: (model: Activity) => void = (_) => {}
}

export class MyActivitiesTable extends Component<Props, {}>
{
    handleRowClick =
        (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, model: Activity) =>
    {
        e.preventDefault();
        this.props.onRowClick(model);
    }

    render = () =>
        <Container className="table-container">
            <h3>
                <span className="table-title">Mina aktivititeter</span>
                <span className="table-count">{this.props.values.length} st</span>
            </h3>
            <Table>
                <thead>
                    <tr>
                        <th>Namn</th>
                        <th>Händelse</th>
                        <th>Tid</th>
                        <th>Utförd</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.values.map(this.renderRow)}
                </tbody>
            </Table>
        </Container>

    renderRow = (model: Activity) => {
        const event = model.event as T13Event;
        return (
            <tr key={model.id} onClick={e => this.handleRowClick(e, model)}className='linked'>
                <td><a href={model.url()}>{model.name}</a></td>
                <td>
                    <ConditionalWrapper condition={event != null}
                        wrap={(c:any) => <a href={event.url()}>{c}</a>}>
                        {model.event != null ? event.name : ""}
                    </ConditionalWrapper>
                </td>
                <td>{model.start_time} - {model.end_time}</td>
                <td>{model.completed ? "✔" : "❌" }</td>
            </tr>
        );
    }
}