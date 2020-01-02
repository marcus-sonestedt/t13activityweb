import React, { useContext, useMemo } from "react";
import { Table } from 'react-bootstrap'
import { useHistory } from "react-router-dom";

import { Activity, ActivityDelistRequest } from '../Models';
import { userContext } from "./UserContext"
import { createADR, cancelADRByActivity } from "../logic/ADRActions";
import { CancelAdrButton, RequestAdrButton } from '../pages/ADRPage';
import './Table.css'

export const MyActivitiesTable = (props: {
    values: Activity[],
    reload: () => void
}) => {
    const { values, reload } = props;
    const history = useHistory();
    const user = useContext(userContext)
    const today = new Date();
    const bookedCount = useMemo(() => values.filter(a => !a.delist_requested).length, [values])
    const completedCount = useMemo(() => values.filter(a => a.completed === true).length, [values])
    const canRequestUnlist = bookedCount > user.settings.minSignups

    const buttonClick = (f: () => Promise<void>) => (e: any) => {
        e.stopPropagation();
        f().then(reload);
    }


    const renderRow = (activity: Activity) => {
        const eventInPast = activity.event.start_date <= today;
        const rowClick = (e: any) => {
            if (e.target?.tagName === 'A')
                return

            e.preventDefault();
            history.push(activity.url());
        }

        return (
            <tr key={activity.id} className='clickable-row' onClick={rowClick}>
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
                    (activity.delist_requests.length === 0
                        ? <span>Bokad</span>
                        : <a href={ActivityDelistRequest.urlForId(activity.delist_requests[0])}>Avbokningsfråga inlagd</a>
                    )
                }
                </td>
                <td>
                    {activity.delist_requests.length === 0
                        ? <RequestAdrButton onClick={buttonClick(() => createADR(activity, user))} disabled={!canRequestUnlist} />
                        : <CancelAdrButton onClick={buttonClick(() => cancelADRByActivity(activity.id))} />
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
                        <th>Åtgärd</th>
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