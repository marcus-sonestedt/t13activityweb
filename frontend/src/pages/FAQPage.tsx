import React, { useState, useContext, useEffect } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import DataProvider from "../components/DataProvider";
import { deserialize } from 'class-transformer';
import { PagedFAQs, FAQ } from "../Models";
import { userContext } from "../components/UserContext";
import { useParams } from "react-router-dom";
import { MarkDown } from '../components/Utilities';


const FAQComponent = (props: { model: FAQ }) => {
    const { model } = props;
    const user = useContext(userContext);

    return <>
        <div className='model-header'>
            <h3>
                <a href={model.url()}>{model.question}</a>
            </h3>
            {user.isStaff ? <a href={model.adminUrl()}><Button variant='secondary' size='sm'>Editera</Button></a> : null}
        </div>
        <MarkDown source={model.answer} className='div-group'/>
    </>
}

export const FAQPage = () => {
    const { id } = useParams();
    const [faqs, setFAQs] = useState<PagedFAQs>(new PagedFAQs());
    const user = useContext(userContext);

    const renderFAQ = (model: FAQ) =>
        <Row key={model.id} id={`faq-${model.id}`}>
            <Col>
                <FAQComponent model={model} />
            </Col>
        </Row>

    useEffect(() => {
        if (id === undefined) return
        const q = document.getElementById(`faq-${id}`);
        q?.scrollIntoView();
    }, [id]);

    return <Container>
        <div className="model-header">
            <h1>Vanliga frågor och svar</h1>
            {user.isStaff ? <a href={FAQ.adminCreateUrl}><Button variant='secondary'>Skapa ny</Button></a> : null}
        </div>
        <DataProvider<PagedFAQs>
            url={FAQ.apiUrlsForAll}
            ctor={(json) => deserialize(PagedFAQs, json)}
            onLoaded={setFAQs}>
            {faqs.results.map(renderFAQ)}
        </DataProvider>
    </Container>
}

export default FAQPage;