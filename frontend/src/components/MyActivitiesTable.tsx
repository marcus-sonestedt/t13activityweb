import React from "react";
import { Container, Button } from 'react-bootstrap'
import { Activity } from '../Models'
import { Table } from 'react-bootstrap'
import './Table.css'

export class MyActivitiesProps {
    values: Activity[] = [];
}

export const MyActivitiesTable = (props: MyActivitiesProps) => {
    const renderRow = (model: Activity) => {
        const event = model.event !== null
            ? <a href={model.event.url()}>{model.event.name}</a>
            : null;

        return (
            <tr key={model.id}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td>{event}</td>
                <td>{model.date}</td>
                <td>{model.start_time} - {model.end_time}</td>
                <td>{model.completed ? "✔" : "❌"}</td>
                <td>{model.date <= new Date() ?
                    <a href={`/api/activity_unlist/${model.id}`}>
                        <Button variant='danger'>Avboka</Button>
                    </a> : null}
                </td>
            </tr>
        );
    }


    return (
        <Container className="table-container">
            <h3>
                <span className="table-title">Mina uppgifter</span>
                <span className="table-count">{props.values.length} st</span>
            </h3>
            <Table>
                <thead>
                    <tr>
                        <th>Namn</th>
                        <th>Aktivitet</th>
                        <th>Datum</th>
                        <th>Tid</th>
                        <th>Utförd</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {props.values.map(renderRow)}
                </tbody>
            </Table>
        </Container>
    )
}