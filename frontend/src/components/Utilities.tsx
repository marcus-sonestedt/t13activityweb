import { Converter } from "showdown";
import React, { useMemo } from "react";
import { Placement } from "react-bootstrap/Overlay";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

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

    const {placement, tooltip} = props;

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
