import React, { useContext } from "react";
import { Button, Table } from 'react-bootstrap'
import { Activity } from '../Models'
import './Table.css'
import { userContext } from "../App"
import { requestActivityDelist, cancelDLR } from "../logic/DelistRequestActions";

export class MyActivitiesProps {
    values: Activity[] = [];
}

export const MyActivitiesTable = (props: MyActivitiesProps) => {
    const user = useContext(userContext)
    const today = new Date();

    const renderRow = (model: Activity) => {
        const unlistPossible = model.event.start_date > today;
        const delistRequest = model.delistRequest;

        return (
            <tr key={model.id}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td><a href={model.event.url()}>{model.event.name}</a></td>
                <td>{model.event.date()}</td>
                <td>{model.time()}</td>
                <td>{!unlistPossible ? (model.completed ? "✔" : "❌") :
                    (delistRequest === null ?
                        <Button variant='danger' size='sm'
                            onClick={() => requestActivityDelist(model, user)}>
                            Avboka?
                        </Button>
                        : <Button variant='success' size='sm'
                            onClick={() => cancelDLR(delistRequest)}>
                            Återboka
                        </Button>
                    )}
                </td>
            </tr>
        );
    }

    if (props.values === undefined)
        return <p>Oops</p>

    return (
        <div className="table-container">
            <h3>
                <span className="table-title">Mina uppgifter</span>
                <span className="table-count">({props.values.length} st)</span>
            </h3>
            <Table striped>
                <thead>
                    <tr>
                        <th>Namn</th>
                        <th>Aktivitet</th>
                        <th>Datum</th>
                        <th>Tid</th>
                        <th>Utförd</th>
                    </tr>
                </thead>
                <tbody>
                    {props.values
                        .sort((a, b) => a.date < b.date ? 1 : 0)
                        .map(renderRow)}
                </tbody>
            </Table>
        </div>
    )
}