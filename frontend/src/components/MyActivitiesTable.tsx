import React, { useContext } from "react";
import { Container, Button, Table } from 'react-bootstrap'
import { Activity } from '../Models'
import './Table.css'
import Cookies from "universal-cookie"
import { userContext } from "../App"

export class MyActivitiesProps {
    values: Activity[] = [];
}

export const MyActivitiesTable = (props: MyActivitiesProps) => {
    const user = useContext(userContext)

    const unlistFromActivity = (model: Activity) => {
        const reason = prompt(
            "Ange varför du vill avboka ditt åtagande.\n" +
            "Observera att det gäller till det har bekräftats av klubben");
        if (reason === null)
            return

        const cookies = new Cookies();

        fetch(`/api/activity_delist/${model.id}`,
            {
                method: 'POST',
                headers: { 'X-CSRFToken': cookies.get('csrftoken') },
                body: JSON.stringify({
                    member: user.memberId,
                    activity: model.id,
                    reason: reason
                })
            })
            .then(r => {
                if (r.status !== 200) {
                    r.text().then(t => console.error(t));
                    throw r.statusText;
                }
            }, r => { throw r }
            )
            .catch(err => {
                console.error(err);
                alert("Något gick fel! :(\n" + err);
            })
            .finally(() => window.location.reload());
    }

    const today = new Date();

    const renderRow = (model: Activity) => {
        const unlistPossible = model.event.start_date > today;

        return (
            <tr key={model.id}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td><a href={model.event.url()}>{model.event.name}</a></td>
                <td>{model.event.date()}</td>
                <td>{model.time()}</td>
                <td>{model.completed ? "✔" : "❌"}</td>
                <td>{unlistPossible ? null :
                    <Button
                        onClick={() => unlistFromActivity(model)}
                        variant='danger' size='sm'>
                            Avboka
                        </Button>
                }
                </td>
            </tr>
        );
    }

    if (props.values === undefined)
        return <p>Oops</p>

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
                        .sort((a, b) => a.date < b.date ? 1 : 0)
                        .map(renderRow)}
                </tbody>
            </Table>
        </Container>
    )
}