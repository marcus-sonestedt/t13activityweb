import React, { Component } from "react";
import { Table } from './Table'
import { Container, Row, Col } from 'react-bootstrap'
import DataProvider from './DataProvider'
import ActivityForm from '../forms/ActivityForm'
import { Activity, ActivityType } from '../Models'

export class HomeProps {
    loginToken: string = "";
}

class HomeState {
    myActivities: Activity[] = [];
    selectedActivity: Activity | null = null;
}

export class Home extends Component<HomeProps, HomeState>
{
    state = new HomeState();

    handleMyActivitiesLoaded = (data: Activity[]) => {
        this.setState({ myActivities: data });
    }

    handleActivitySave = (data: Activity) => {
        return true;
    }

    render = () => {
        let type = this.state.selectedActivity == null ? null
            : this.state.selectedActivity.type;

        return (
            <Container>
                <Row>
                    <Col md={12}>
                        <h3>Mina aktiviteter</h3>
                        <DataProvider<Activity>
                            endpoint="/api/myactivities"
                            render={Table}
                            onLoaded={this.handleMyActivitiesLoaded} />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12} md={6}>
                        <ActivityForm
                            model={this.state.selectedActivity}
                            onSave={this.handleActivitySave} />
                    </Col>
                    {type == null ? null :
                    <Col sm={12} md={6}>
                        <ActivityTypeView {...type} />
                    </Col>
                    }
                </Row>
            </Container>
        );
    }
}

const ActivityTypeView:React.SFC<ActivityType | null> = (props) => {
    if (props == null)
        return null;

    return (
        <div>
            <h3>{props.name}</h3>
            <p>{props.description}</p>
        </div>
    );
}

export default Home;
