

interface CWProps
{
    condition:boolean;
    wrap:(any:any) => any;
    children: any;
}

export const ConditionalWrapper: React.SFC<CWProps> = (p) => (
    p.condition ? p.wrap(p.children) : p.children
);