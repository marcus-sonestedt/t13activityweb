import React, { useState, useContext, useMemo } from "react";
import { Row, Col, Pagination, Table } from "react-bootstrap";
import { userContext } from "./UserContext";
import { useHistory } from "react-router-dom";
import { deserialize } from "class-transformer";

import { PagedActivities, T13Event, Activity } from "../Models";
import { EnlistButtons } from "../components/EnlistButtons";
import { HoverTooltip, PageItems } from "./Utilities";
import { Reimbursements } from "../pages/ActivityTypePage";
import DataProvider from "./DataProvider";

export const EventActivitiesTable = (props: { event?: T13Event }) => {
    const { event } = props;
    const [activities, setActivities] = useState(new PagedActivities());
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(0);
    const history = useHistory();
    const user = useContext(userContext);
    const pageSize = 8;

    const renderActivityRow = (activity: Activity) => {
        const type = activity.type !== null
            ? <a href={activity.type.url()}>{activity.type.name}</a>
            : '-';

        const className =
            (user.isLoggedIn && activity.assigned?.id === user.memberId) ? 'my-task' : null;

        let assigned = <span>{activity.assigned?.fullname}</span>

        if (user.isLoggedIn) {
            if (activity.assigned !== null) {
                assigned = <a href={activity.assigned.url()}>{activity.assigned.fullname}</a>
            }

            if (activity.active_delist_request || activity.bookable) {
                assigned = <>
                    {assigned}
                    {' '}
                    <EnlistButtons activity={activity}
                        reloadActivity={() => setReload(r => r+1)} />
                </>
            }
        }

        const rowClicked = () => history.push(activity.url());

        return (
            <tr key={activity.id} className={'linked ' + className} onClick={rowClicked}>
                <td><a href={activity.url()}>{activity.name}</a></td>
                <td>{type}</td>
                <td className='nowrap'>
                    {event?.date()}<br />{activity.time()}
                </td>
                <td>
                    {activity.weight === 1 ? null :
                        <HoverTooltip tooltip="Denna aktivitet räknas som flera">
                            <span className='weight'>{activity.weight}</span>
                        </HoverTooltip>}
                    {' '}
                    <Reimbursements model={activity.type} /></td>
                <td>{assigned}</td>
            </tr>
        )
    }

    if (!event)
        return null;

    const url = `/api/event_activities/${event?.id}?page=${page}&page_size=${pageSize}`;

    return <DataProvider<PagedActivities>
        key={reload}
        url={url}
        ctor={json => deserialize(PagedActivities, json)}
        onLoaded={setActivities}>
        <>
            <Row>
                <Col sm={4}>
                    <h3>Uppgifter</h3>
                </Col>
                <Col sm={4} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Pagination>
                        <PageItems count={activities.count} pageSize={pageSize} currentPage={page} setFunc={setPage} />
                    </Pagination>
                </Col>
                <Col sm={4} style={{ textAlign: 'right' }}>
                    <h3>
                        {(page - 1) * pageSize + 1}
                        {'-'}
                        {Math.min(page * pageSize, activities.count)}
                        {' / '}
                        {activities.count}
                        {' st'}
                    </h3>
                </Col>
            </Row>
            <Table hover striped responsive='lg'>
                <thead>
                    <tr>
                        <th>Beskrivning</th>
                        <th>Typ</th>
                        <th>Tid</th>
                        <th>Övrigt</th>
                        <th>Tilldelad</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.results.map(renderActivityRow)}
                </tbody>
            </Table>
        </>
    </DataProvider>
}