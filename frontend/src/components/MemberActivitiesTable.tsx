import React, { useState, useCallback, useContext } from "react";
import { PagedActivities } from "../Models";
import DataProvider from "./DataProvider";
import { deserialize } from "class-transformer";
import { MyActivitiesTable } from "./MyActivitiesTable";
import { Pagination } from "react-bootstrap";
import { PageItems } from "./Utilities";
import { userContext } from "./UserContext";

export const MemberActivitiesTable = (props: { memberId: string }) => {
    const [activities, setActivities] = useState(new PagedActivities());
    const [activitiesPage, setActivitiesPage] = useState(1);
    const [reload, setReload] = useState(1);
    const user = useContext(userContext);

    const incReload = () => setReload(reload + 1);
    const handleLoaded = useCallback((data: PagedActivities) => {
        if (reload > 0)
            setActivities(data);
    }, [reload]);

    const ACTIVITIES_PAGE_SIZE = 20;

    const url = props.memberId === user.memberId
        ? `/api/activity_my?page=${activitiesPage}&page_size=${ACTIVITIES_PAGE_SIZE}`
        : `/api/activity_for_proxy/${props.memberId}?page=${activitiesPage}&page_size=${ACTIVITIES_PAGE_SIZE}`;

    return <DataProvider< PagedActivities >
        ctor={t => deserialize(PagedActivities, t)}
        url={url}
        onLoaded={handleLoaded}>
        <MyActivitiesTable
            values={activities.results}
            reload={incReload}
        />
        <Pagination>
            <PageItems count={activities.count}
                pageSize={ACTIVITIES_PAGE_SIZE}
                currentPage={activitiesPage}
                setFunc={setActivitiesPage} />
        </Pagination>
    </DataProvider>
}
