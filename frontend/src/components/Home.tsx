import React, { Component } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import * as H from 'history';
import { deserialize } from "class-transformer";
import { Activity, ActivityType, T13Event, PagedT13Events, PagedActivities } from '../Models'
import { MyActivitiesTable } from './MyActivitiesTable'
import { UpcomingEventsTable } from './UpcomingEventsTable'
import { DataProvider } from './DataProvider'
import { ActivityView } from './ActivityView'

interface HomeProps {
}

class HomeState {
    myActivities: PagedActivities = new PagedActivities();
    events: PagedT13Events = new PagedT13Events();

    selectedActivity: Activity | null = null;
    selectedEvent: T13Event | null = null;

    history: H.History<H.LocationState> | null = null;
}

export class Home extends Component<HomeProps, HomeState>
{
    state = new HomeState();

    handleMyActivitiesLoaded = (data: PagedActivities) => {
        this.setState({ myActivities: data });
    }

    handleActivitySelect = (model: Activity) => {
        this.setState({ selectedActivity: model });
    }

    handleEventsLoaded = (data: PagedT13Events) => {
        this.setState({ events: data });
    }

    handleEventSelect = (model: T13Event) => {
        this.setState({ selectedEvent: model });
    }

    render = () => {
        let activity = this.state.selectedActivity;
        let activityType = this.state.selectedActivity == null ? null : this.state.selectedActivity.type;
        let event = this.state.selectedEvent;
        let eventType = this.state.selectedEvent == null ? null : this.state.selectedEvent.type;

        return (
            <Container>
                <Row>
                    <Col sm={12} lg={6}>
                        <DataProvider< PagedActivities >
                            ctor={t => deserialize(PagedActivities, t)}
                            endpoint={"/api/myactivities"}
                            onLoaded={this.handleMyActivitiesLoaded}>
                            <MyActivitiesTable
                                values={this.state.myActivities.results}
                                onRowClick={this.handleActivitySelect}
                            />
                        </DataProvider>
                    </Col>
                    <Col sm={12} lg={6}>
                        <DataProvider< PagedT13Events >
                            ctor={t => deserialize(PagedT13Events, t)}
                            endpoint={"/api/events"}
                            onLoaded={this.handleEventsLoaded}>
                                <UpcomingEventsTable
                                    events={this.state.events}
                                    //onRowClick={this.handleEventSelect}
                                />
                            </DataProvider>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12} md={6}>
                        {this.state.selectedActivity == null ? null : <>
                        <h3>Aktivitet</h3>
                        <ActivityView model={activity} onSave={_ => true}/>
                        <ActivityTypeView model={activityType} />
                    </>}
                    </Col>
                    <Col sm={12} md={6}>
                        {event == null ? null :
                        <>
                            <h3>{event.name}</h3>
                            <p>{event.comment}</p>
                            <EventTypeView model={eventType} />
                        </>}
                    </Col>
                </Row>
            </Container>
        );
    }
}

interface ATVProps {
    model: ActivityType | null;
}

const ActivityTypeView: React.SFC<ATVProps> = (p) => (
        p.model === null ? null :
        <div>
            <h3>{p.model.name}</h3>
            <p>{p.model.description}</p>
        </div>
    );


interface ETVProps {
    model: ActivityType | null;
}

const EventTypeView: React.SFC<ETVProps> = (p) => (
        p.model === null ? null :
        <div>
            <h3>{p.model.name}</h3>
            <p>{p.model.description}</p>
        </div>
    );

export default Home;
