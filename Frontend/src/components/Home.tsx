import React, { Component } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import { Activity, ActivityType } from '../Models'
import DataProvider from './DataProvider'
import { TableView } from './Table'
import ActivityForm from '../forms/ActivityForm'

export class HomeProps {
    loginToken: string = "";
}

class HomeState {
    myActivities: Activity[] = [];
    selectedActivity: Activity | undefined = undefined;
}

export class Home extends Component<HomeProps, HomeState>
{
    constructor(props: HomeProps) {
        super(props);
        this.activityTable = new TableView<Activity>(
            this.handleRowClicked
        );
    }

    state = new HomeState();

    handleMyActivitiesLoaded = (data: Activity[]) => {
        this.setState({ myActivities: data });
    }

    handleActivitySave = (data: Activity) => {
        return true;
    }

    handleRowClicked = (modelId: string) => {
        const model = this.state.myActivities.find(a => a.id === modelId);
        this.setState({ selectedActivity: model });
    }

    activityTable: TableView<Activity>;

    render = () => {
        let type = this.state.selectedActivity === undefined ? null
            : this.state.selectedActivity.type;

        return (
            <Container>
                <Row>
                    <Col md={12}>
                        <h3>Mina aktiviteter</h3>
                        <DataProvider<Activity[]>
                            endpoint="/api/myactivities"
                            render={this.activityTable.render}
                            onLoaded={this.handleMyActivitiesLoaded} />
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

const ActivityTypeView: React.SFC<ActivityType | null> = (props: ActivityType) => (
    <div>
        <h3>{props.name}</h3>
        <p>{props.description}</p>
    </div>
);


export default Home;
