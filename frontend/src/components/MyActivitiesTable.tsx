import React from "react";
import { Container, Button } from 'react-bootstrap'
import { Activity } from '../Models'
import { Table } from 'react-bootstrap'
import './Table.css'
import Cookies from "universal-cookie";

export class MyActivitiesProps {
    values: Activity[] = [];
}

export const MyActivitiesTable = (props: MyActivitiesProps) => {

    const unlistFromActivity = (model: Activity) => {
        const cookies = new Cookies();
        fetch(`/api/activity_delist/${model.id}`,
            {
                method: 'POST',
                headers: { 'X-CSRFToken': cookies.get('csrftoken') }
            })
            .then(r => {
                if (r.status === 200)
                    window.location.reload()
                else {
                    r.text().then(t => console.error(t));
                    throw r.statusText;
                }
            }, r => { throw r })
            .catch(err => {
                console.error(err);
                alert("Något gick fel! :(\n" + err);
                
            })
            .finally(() => window.location.reload());
    }

    const renderRow = (model: Activity) => {
        const unlistPossible = model.event.date < new Date();

        return (
            <tr key={model.id}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td><a href={model.event.url()}>{model.event.name}</a></td>
                <td>{model.event.date}</td>
                <td>{model.start_time} - {model.end_time}</td>
                <td>{model.completed ? "✔" : "❌"}</td>
                <td>{unlistPossible ? null :
                    <Button
                        onClick={() => unlistFromActivity(model)}
                        variant='danger'>Avboka</Button>
                }
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
                    {props.values
                        .sort((a,b) => a.date < b.date ? 1 : 0)
                        .map(renderRow)}
                </tbody>
            </Table>
        </Container>
    )
}