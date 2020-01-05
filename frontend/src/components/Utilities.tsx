import { Converter } from "showdown";
import React, { useMemo } from "react";

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

