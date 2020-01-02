import React, { useContext, useMemo } from "react";
import { Button, Table } from 'react-bootstrap'
import { useHistory } from "react-router-dom";

import { Activity } from '../Models'
import { userContext } from "./UserContext"
import { createADR, cancelADRByActivity } from "../logic/ADRActions";
import './Table.css'
import { CancelAdrButton } from '../views/ActivityDelistRequestsView';

export class MyActivitiesProps {
    values: Activity[] = [];
    reload: () => void = () => { };
}

export const MyActivitiesTable = (props: MyActivitiesProps) => {
    const { values, reload } = props;
    const history = useHistory();
    const user = useContext(userContext)
    const today = new Date();
    const bookedCount = useMemo(() => values.filter(a => !a.delist_requested).length, [values])
    const completedCount = useMemo(() => values.filter(a => a.completed === true).length, [values])

    const canRequestUnlist = bookedCount > user.settings.minSignups

    const buttonClick = (f: () => Promise<void>) =>
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            f().then(reload);
        }

    const renderRow = (activity: Activity) => {
        const eventInPast = activity.event.start_date <= today;

        return (
            <tr key={activity.id} className='clickable-row' onClick={() => history.push(activity.url())}>
                <td><a href={activity.url()}>{activity.name}</a></td>
                <td><a href={activity.event.url()}>{activity.event.name}</a></td>
                <td className='nowrap'>
                    {activity.date()}<br />{activity.time()}
                </td>
                <td>{eventInPast ?
                    (activity.completed === null
                        ? <span>Obekräftad <span role="img" aria-label="clock">⏰</span><span className="text-tooltip">Bra jobbat!</span></span>
                        : activity.completed === true
                            ? <span>Utförd <span role="img" aria-label="thumbsup">👍</span><span className="text-tooltip">Bra jobbat!</span></span>
                            : <span>Missad <span role="img" aria-label="ohno">😨</span><span className="text-tooltip">Du missade din uppgift!</span></span>) :
                    (!activity.delist_requested ?
                        <Button variant='outline-danger' size='sm' disabled={!canRequestUnlist}
                            onClick={buttonClick(() => createADR(activity, user))}>
                            Avboka?
                            <span className='text-tooltip'>
                                {canRequestUnlist ?
                                    "Begär att avboka uppgiften" :
                                    "Du kan inte begära att avboka då du skulle få mindre än " + user.settings.minSignups + " uppgifter om det godkändes"}
                            </span>
                        </Button>
                        : <CancelAdrButton onClick={buttonClick(() => cancelADRByActivity(activity.id))}/>
                    )
                }
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
                <span className="table-count">{values.length} totalt, {completedCount} utförda, {bookedCount} bokade</span>
            </h3>
            <Table striped>
                <thead>
                    <tr>
                        <th>Namn</th>
                        <th>Aktivitet</th>
                        <th>Tidpunkt</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {values
                        .sort((a, b) => a.date < b.date ? 1 : 0)
                        .map(renderRow)}
                </tbody>
            </Table>
        </div>
    )
}