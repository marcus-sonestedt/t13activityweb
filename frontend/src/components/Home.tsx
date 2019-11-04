import React, { Component } from "react";
import { Container, Row, Col, Jumbotron } from 'react-bootstrap'
import { Activity, ActivityType, T13Event } from '../Models'
import DataProvider from './DataProvider'
import { TableView } from './Table'
import ActivityForm from '../forms/ActivityForm'
import { useHistory } from "react-router"
import { WelcomeText } from './Welcome'

interface HomeProps {
    loginToken: string;
    serverAddress: string;
}

class HomeState {
    myActivities: Activity[] = [];
    selectedActivity: Activity | undefined = undefined;
    events: T13Event[] = [];
}

export class Home extends Component<HomeProps, HomeState>
{
    constructor(props: HomeProps) {
        super(props);
        this.activityTable = new TableView<Activity>(
            this.handleActivitySelect
        );
        this.eventTable = new TableView<T13Event>(
            this.handleActivitySelect
        );
    }

    state = new HomeState();
    activityTable: TableView<Activity>;
    eventTable: TableView<T13Event>;

    handleMyActivitiesLoaded = (data: Activity[]) => {
        this.setState({ myActivities: data });
    }

    handleActivitySelect = (modelId: string) => {
        const model = this.state.myActivities.find(a => a.id === modelId);
        this.setState({ selectedActivity: model });
    }

    handleActivitySave = (data: Activity) => {
        return true;
    }

    handleEventsLoaded = (data: T13Event[]) => {
        this.setState({ events: data });
    }

    handleEventSelect = (id: string) => {
        const history = useHistory();
        history.push(`/home/events/${id}`)
    }

    render = () => {
        let type = this.state.selectedActivity === undefined ? null
            : this.state.selectedActivity.type;

        return (
            <Container>
                <Row>
                    <Col sm={12} mx-auto>
                        <Jumbotron>
                           <WelcomeText/>
                        </Jumbotron>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12} lg={6}>
                        <h3>Mina aktiviteter</h3>
                        <DataProvider<Activity[]>
                            endpoint={this.props.serverAddress  + "/api/myactivities"}
                            render={this.activityTable.render}
                            onLoaded={this.handleMyActivitiesLoaded} />
                    </Col>
                    <Col sm={12} lg={6}>
                        <h3>Kommande händelser</h3>
                        <DataProvider<T13Event[]>
                            endpoint={this.props.serverAddress  + "/api/events"}
                            render={this.eventTable.render}
                            onLoaded={this.handleEventsLoaded} />
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
