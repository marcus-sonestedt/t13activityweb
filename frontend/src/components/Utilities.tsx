import { Converter } from "showdown";
import React, { useMemo, useState, useContext } from "react";
import { Placement } from "react-bootstrap/Overlay";
import { Image, Tooltip, OverlayTrigger, Pagination, Container, Row, Col, Alert, Button } from "react-bootstrap";
import DataProvider from "./DataProvider";
import { userContext } from "./UserContext";

interface CWProps {
    condition: boolean;
    wrap: (any: any) => any;
    children: any;
}

export const ConditionalWrapper: React.SFC<CWProps> = (p) => (
    p.condition ? p.wrap(p.children) : p.children
);

// see https://github.com/showdownjs/showdown#valid-options
export const converter = new Converter({
    headerLevelStart: 3,
    simplifiedAutoLink: true,
    openLinksInNewWindow: true,
});

export const MarkDown = (props: { source: string, className?: string }) => {
    const html = useMemo(() => converter.makeHtml(props.source), [props.source]);
    return <div className={props.className} dangerouslySetInnerHTML={{ __html: html }} />
}

export const HoverTooltip = (props: React.PropsWithChildren<{
    placement?: Placement, tooltip: React.ReactNode
}>) => {

    const { placement, tooltip } = props;

    function renderTooltip(props: any) {
        props.show = props.show.toString(); // react bootstrap bug?
        return <Tooltip {...props}>{tooltip}</Tooltip>;
    }

    return <OverlayTrigger
        placement={placement ?? "right"}
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip}
        children={() => props.children}/>
};

export const PageItems = (p: {
    count: number, pageSize: number,
    currentPage: number, setFunc: ((page: number) => void)
}) => {

    const numPages = Math.ceil(p.count / p.pageSize)

    if (p.count <= p.pageSize)
        return null;

    const pageNumbers = Array.from(Array(numPages).keys())
        .map(i => i + 1)

    return <>
        {pageNumbers.map(i =>
            <Pagination.Item key={i} active={i === p.currentPage}
                onClick={() => p.setFunc(i)}>
                {i}
            </Pagination.Item>)
        }
    </>
}


// see https://reactjs.org/docs/error-boundaries.html
export class ErrorBoundary extends React.Component<{}, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        //console.error(error);
        //console.error(errorInfo);

        // You can also log the error to an error reporting service
        //logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const errStr = this.state.error == null ? '' : this.state.error.toString();

            // You can render any custom fallback UI
            return <Container>
                <Row className="justify-content-md-center">
                    <Col md='12' lg='5'>
                        <h1>Något gick snett! <span role="img" aria-label="sadface">😥</span></h1>
                        <Alert variant='danger'>{errStr}</Alert>
                    </Col>
                    <Col md='12' lg='3'>
                        <Image src='/static/brokenpiston.jpg' alt="Broken piston" fluid />
                    </Col>
                </Row>
            </Container>
        }

        return this.props.children;
    }
}

export const InfoText = (props: { textKey: string }) => {
    const user = useContext(userContext);
    const [infoText, setInfoText] = useState('');

    const editButton = user.isStaff
        ? <a href={`/admin/app/infotext/${props.textKey}/change/`}>
            <Button variant='outline-secondary'>Editera</Button>
        </a>
        : null;

    return <DataProvider<any>
        url={`/api/infotext/${props.textKey}`}
        ctor={x => JSON.parse(x).content}
        onLoaded={setInfoText}>
        <>
            <MarkDown source={infoText} />
            {editButton}
        </>
    </DataProvider >
}

export const isoWeek = (date: Date) => {
    date = new Date(date);

    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
}