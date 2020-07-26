import React, { useState, useContext, useCallback, useEffect } from "react";
import { Row, Col, Pagination, Table } from "react-bootstrap";
import { userContext } from "./UserContext";
//import { useHistory } from "react-router-dom";
import { deserialize, deserializeArray } from "class-transformer";

import { PagedActivities, T13Event, Activity, LicenseType } from "../Models";
import { EnlistButtons } from "../components/EnlistButtons";
import { HoverTooltip, PageItems } from "./Utilities";
import { Reimbursements } from "../pages/ActivityTypePage";
import DataProvider from "./DataProvider";
import { getJsonHeaders } from "../logic/ADRActions";

export const EventActivitiesTable = (props: { event?: T13Event }) => {
    const { event } = props;
    const [activities, setActivities] = useState(new PagedActivities());
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(0);
    const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
    const user = useContext(userContext);
    const pageSize = 8;

    const handleLoaded = useCallback((as: PagedActivities) => {
        if (event) {
            as.results.forEach(a => a.event = event);
        }
        setActivities(as);
    }, [event]);


    useEffect(() => {
        const controller = new AbortController();

        fetch(LicenseType.apiUrlLíst, {
            signal: controller.signal,
            headers: getJsonHeaders()
        }).then(r => {
            if (r.status !== 200)
                throw r.statusText;
            return r.text();
        }).catch(e => {
            console.error(e);
            throw e;
        }).then(json => {
            if (json)
                setLicenseTypes(deserializeArray(LicenseType, json));
        });

        return function cleanup() { controller.abort(); }
    }, [setLicenseTypes]);


    const renderActivityRow = (activity: Activity) => {
        const type = activity.type !== null
            ? <a href={activity.type.url()}>{activity.type.name}</a>
            : '-';

        const className =
            (user.isLoggedIn && activity.assigned?.id === user.memberId) ? 'my-task' : null;

        let assigned = [<span>{activity.assigned?.fullname}</span>]

        if (user.isLoggedIn) {
            assigned = []
            if (activity.assigned) {
                assigned.push(<a href={activity.assigned.url()}>{activity.assigned.fullname}</a>)
            }

            if (activity.active_delist_request || activity.bookable) {
                assigned.push(<>{' '}</>)
                assigned.push(
                    <EnlistButtons activity={activity} reloadActivity={() => setReload(r => r + 1)} />)
            }

            if (activity.assigned && (user.isStaff || activity.event.coordinators.find(m => m.id === user.memberId))) {
                activity.assigned.license_set.forEach(l =>  {
                    assigned.push(<br/>)
                    assigned.push(<>{`${licenseTypes.find(t => t.id === l.type)?.name} - ${l.level}`}</>)
                })
            }
        }

        //const rowClicked = () => history.push(activity.url());

        const weight = (activity.weight === 0)
            ? <HoverTooltip tooltip="Denna uppgift räknas inte mot guldkortet">
                <span>X</span>    
            </HoverTooltip>
            : (activity.weight > 1) ?
                <HoverTooltip tooltip="Denna uppgift räknas som flera">
                    <span className='weight'>{activity.weight}</span>
                </HoverTooltip>
            : null;

        return (
            <tr key={activity.id} className={'linked ' + className}>
                <td><a href={activity.url()}>{activity.name}</a></td>
                <td>{type}</td>
                <td className='nowrap'>
                    {event?.date()}<br />{activity.time()}
                </td>
                <td>
                    {weight}
                    {weight ? ' ' : null}
                    <Reimbursements model={activity.type} /></td>
                <td>{assigned}</td>
            </tr>
        )
    }

    if (!event)
        return null;

    const url = `/api/event_activities/${event?.id}?page=${page}&page_size=${pageSize}&_=${reload}`;

    return <DataProvider<PagedActivities>
        key={reload}
        url={url}
        ctor={json => deserialize(PagedActivities, json)}
        onLoaded={handleLoaded}>
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