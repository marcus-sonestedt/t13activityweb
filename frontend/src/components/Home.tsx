import React, { Component } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import { useHistory } from "react-router"
import * as H from 'history';

import { Activity, ActivityType, T13Event } from '../Models'
import { TableView, PagedTableView, PagedValues } from './Table'
import { DataProvider } from './DataProvider'
import { ActivityForm } from '../forms/ActivityForm'

interface HomeProps {
}

class HomeState {
    myActivities: Activity[] = [];
    selectedActivity: Activity | undefined = undefined;
    events: PagedValues<T13Event> = new PagedValues<T13Event>();
    history: H.History<H.LocationState> | null = null;
}

export class Home extends Component<HomeProps, HomeState>
{
    state = new HomeState();

    handleMyActivitiesLoaded = (data: Activity[]) => {
        this.setState({ myActivities: data });
    }

    handleActivitySelect = (model: Activity) => {
        this.setState({ selectedActivity: model });
    }

    handleActivitySave = (data: Activity) => {
        return true;
    }

    handleEventsLoaded = (data: PagedValues<T13Event>) => {
        this.setState({ events: data });
    }

    handleEventSelect = (model: T13Event) => {
        console.log("clicked: " + model.name);
    }

    render = () => {
        let type = this.state.selectedActivity === undefined ? null
            : this.state.selectedActivity.type;

        return (
            <Container>
                <Row>
                    <Col sm={12} lg={6}>
                        <DataProvider<Activity[]>
                            endpoint={"/api/myactivities"}
                            onLoaded={this.handleMyActivitiesLoaded}>
                            <TableView
                                    title={"Mina aktiviteter"}
                                    values={this.state.myActivities}
                                    onRowClick={this.handleActivitySelect}
                                    columns={{
                                        name: "Namn",
                                        event:"Händelse", start_time:"Börjar",
                                        end_time:"Slutar", completed:"Utförd"
                                    }}
                            />
                        </DataProvider>
                    </Col>
                    <Col sm={12} lg={6}>
                        <DataProvider< PagedValues<T13Event> >
                            endpoint={"/api/events"}
                            onLoaded={this.handleEventsLoaded}>
                                <PagedTableView
                                    title="Kommande händelser"
                                    pagedValues={this.state.events}
                                    onRowClick={this.handleEventSelect}
                                    columns={{
                                        name: "Namn",
                                        start_date: 'Start',
                                        end_date: 'Slut',
                                        type: 'Typ'
                                    }}
                                    values={this.state.events.results}
                                />
                            </DataProvider>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12} md={6}>
                        <ActivityForm
                            model={this.state.selectedActivity}
                            onSave={this.handleActivitySave} />
                    </Col>
                    <Col sm={12} md={6}>
                        {type == null ? null :
                            <ActivityTypeView {...type} />
                        }
                    </Col>
                </Row>
            </Container>
        );
    }
}

const ActivityTypeView: React.SFC<ActivityType | null> =
    (model: ActivityType) => (
        <div>
            <h3>{model.name}</h3>
            <p>{model.description}</p>
        </div>
    );


export default Home;
