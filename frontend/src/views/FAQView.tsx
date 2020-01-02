import React, { useState, useContext, useEffect } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import DataProvider from "../components/DataProvider";
import { deserialize } from 'class-transformer';
import { PagedFAQs, FAQ } from "../Models";
import { userContext } from "../components/UserContext";
import { useParams } from "react-router-dom";



export const FAQView = () => {
    const { id } = useParams();
    const [faqs, setFAQs] = useState<PagedFAQs>(new PagedFAQs());
    const user = useContext(userContext);

    const renderFAQ = (model: FAQ) =>
        <Row key={model.id} id={`faq-${model.id}`}>
            <Col>
                <h3>
                    {model.question}
                    &nbsp;
                    <a href={model.url()}>#</a>
                    &nbsp;
                    {user.isStaff ? <a href={model.adminUrl()}><Button variant='secondary' size='sm'>Editera</Button></a> : null}
                </h3>
                <p className='div-group'>{model.answer}</p>
            </Col>
        </Row>

    useEffect(() => {
        if (id === undefined) return
        const q = document.getElementById(`faq-${id}`);
        q?.scrollIntoView();
    }, [id]);

    return <Container>
        <h1>
            Vanliga frågor och svar
            &nbsp;
            {user.isStaff ? <a href={FAQ.adminCreateUrl}><Button variant='secondary'>Skapa ny</Button></a> : null}
        </h1>
        <DataProvider<PagedFAQs>
            url={FAQ.apiUrlsForAll}
            ctor={(json) => deserialize(PagedFAQs, json)}
            onLoaded={setFAQs}>
            {faqs.results.map(renderFAQ)}
        </DataProvider>
    </Container>
}

export default FAQView;