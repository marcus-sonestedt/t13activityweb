import React, { useContext } from "react";
import { Container, Button } from 'react-bootstrap'
import { Activity } from '../Models'
import { Table } from 'react-bootstrap'
import './Table.css'
import Cookies from "universal-cookie";
import { userContext } from "../App";

export class MyActivitiesProps {
    values: Activity[] = [];
}

export const MyActivitiesTable = (props: MyActivitiesProps) => {

    const user = useContext(userContext);

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
            .catch(e => {
                console.error(e);
                alert("Något gick fel! :(\n" + e);
                window.location.reload()
            });
    }

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
                <td>{model.date < new Date() ? null :
                    <Button
                        onClick={() => unlistFromActivity(model)}
                        variant='danger'>Avboka</Button>
                }
                </td><td>
                    {user.isStaff ? <a href={model.adminUrl()}>
                        <Button variant="secondary">Editera</Button></a> : null}
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