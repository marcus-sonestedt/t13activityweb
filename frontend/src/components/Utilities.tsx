import { Converter } from "showdown";
import React, { useMemo } from "react";
import { Placement } from "react-bootstrap/Overlay";
import { Tooltip, OverlayTrigger, Pagination } from "react-bootstrap";

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
    placement?: Placement, tooltip: string
}>) => {

    const { placement, tooltip } = props;

    function renderTooltip(props: any) {
        props.show = props.show.toString(); // react bootstrap bug?
        return <Tooltip {...props}>{tooltip}</Tooltip>;
    }

    return <OverlayTrigger
        placement={placement ?? "right"}
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip}>
        {props.children}
    </OverlayTrigger>
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

