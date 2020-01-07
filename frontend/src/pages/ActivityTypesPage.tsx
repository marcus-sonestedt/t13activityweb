import React, { useState } from "react"
import { Container, Row, Col, Table, Pagination } from "react-bootstrap"
import { PagedActivityTypes, ActivityType } from "../Models";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import { PageItems } from "../components/Utilities";

export const ActivityTypesPage = () => {
    return <Container className="table-container">
        <Row>
            <Col md={12}>
                <TaskTypesComponent/>
            </Col>
        </Row>
    </Container>
}


export const TaskTypesComponent = () => {
    const [data, setData] = useState<PagedActivityTypes>(new PagedActivityTypes());
    const [page, setPage] = useState(1);

    const renderRow = (model: ActivityType) => {
        return <tr key={model.id}>
            <td><a href={model.url()}>{model.name}</a></td>
            <td>{model.description}</td>
        </tr>
    }


    return <DataProvider<PagedActivityTypes>
        ctor={json => deserialize(PagedActivityTypes, json)}
        url={ActivityType.apiUrlAll() + `?page=${page}`}
        onLoaded={setData}>
        <h1>
            <span className="table-title">Uppgiftstyper</span>
            <span className="table-count">
                {data.results.length}/{data.count} st
                        </span>
        </h1>
        <Table >
            <thead>
                <tr>
                    <th>Namn</th>
                    <th>Beskrivning</th>
                </tr>
            </thead>
            <tbody>
                {data.results.map(renderRow)}
            </tbody>
        </Table>
        <Pagination>
            <PageItems count={data.count} pageSize={10} currentPage={page} setFunc={setPage} />
        </Pagination>
    </DataProvider>
}
export default ActivityTypesPage;