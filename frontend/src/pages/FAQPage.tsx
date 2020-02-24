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
            {!user.isStaff ? null :
                <a href={model.adminUrl()}>
                    <Button variant='outline-secondary' size='sm'>Editera</Button>
                </a>
            }
        </div>
        <MarkDown source={model.answer} className='div-group' />
    </>
}

export const FAQPage = () => {
    const { id } = useParams();
    const [faqs, setFAQs] = useState<PagedFAQs>(new PagedFAQs());
    const user = useContext(userContext);

    const renderFAQ = (model: FAQ) =>
        <div key={model.id} id={`faq-${model.id}`}>
            <FAQComponent model={model} />
        </div>

    const renderQ = (model: FAQ) => {
        const text = model.question.length > 40
            ? model.question.substr(0, 37) + "..." : model.question;

        return <li><a href={`#faq-${model.id}`}>{text}</a></li>
    }

    useEffect(() => {
        if (id === undefined) return
        const q = document.getElementById(`faq-${id}`);
        q?.scrollIntoView();
    }, [id]);

    return <Container>
        <Row>
            <Col>
                <div className="model-header">
                    <h1>Vanliga frågor och svar</h1>
                    {user.isStaff ?
                        <a href={FAQ.adminCreateUrl}>
                            <Button variant='outline-secondary'>Skapa ny</Button>
                        </a> : null
                    }
                </div>
                <hr />
            </Col>
        </Row>
        <DataProvider<PagedFAQs>
            url={FAQ.apiUrlsForAll}
            ctor={(json) => deserialize(PagedFAQs, json)}
            onLoaded={setFAQs}>
            <Row>
                <Col lg={4} className='div-group'>
                    <p>{faqs.results.length} frågor &amp; svar</p>
                    <ul>
                        {faqs.results.map(renderQ)}
                    </ul>
                </Col>
                <Col lg={8}>
                    {faqs.results.map(renderFAQ)}
                </Col>
            </Row>
        </DataProvider>
    </Container>
}

export default FAQPage;