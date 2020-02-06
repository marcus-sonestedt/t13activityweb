import React, { useEffect, useState, ReactNode, ReactElement, useCallback } from "react";
import { Alert, Image } from 'react-bootstrap'

export interface DataProps<T> {
    ctor: ((json: string) => T);
    url: string;
    onLoaded?: ((data: T) => void);
    render?: (() => ReactNode);
}

export function DataProvider<T>(props: React.PropsWithChildren<DataProps<T>>) {
    const { ctor, url, onLoaded, render, children } = props;
    const [data, setData] = useState<any | null>(null);
    const [error, setError] = useState<ReactElement>();
    const [placeHolder, setPlaceHolder] = useState("Laddar...");

    const handleData = useCallback((json: string) => {
        var typedData = ctor(json);
        setData(typedData);
        if (onLoaded !== undefined)
            onLoaded(typedData);

    },  // eslint-disable-next-line            
        [ onLoaded /*, ctor */] // weird, but infinite loop otherwise, even if useCallback is used
    );

    useEffect(() => {
        const controller = new AbortController();
        setPlaceHolder("Laddar...");
        setError(undefined);

        fetch(url, {
            signal: controller.signal,
            cache: "no-store",
            headers: { 'Accept': 'application/json' }
        })
            .then(r => {
                if (r.status >= 300) {
                    setPlaceHolder("Oops. Något gick fel! :(");
                    setError(<h2>{r.status}: {r.statusText}</h2>);
                    r.text().then(htmlError => setError(err => <><p>{err}</p><div dangerouslySetInnerHTML={{ __html: htmlError }} /></>));
                } else {
                    return r.text();
                }
            }).then(json => {
                if (controller.signal.aborted)
                    return;
                if (json === undefined)
                    return;
                handleData(json)
            }).catch(e => {
                if (e.name === 'AbortError') {
                    console.debug("Silencing AbortError: " + e);
                    return
                }
                console.error(e);
                setPlaceHolder("Oops. Något gick fel. :(");
                setError(e.toString());
            });

        return function cleanup() {
            controller.abort();
        }
    }, [url, handleData]);

    if (data !== null && data !== undefined) {
        // see https://stackoverflow.com/questions/54905376/type-error-jsx-element-type-null-undefined-is-not-a-constructor-functi/54908762
        if (render !== undefined)
            return render() as ReactElement<any>;
        else
            return children as ReactElement<any>;
    }

    if (error != null) {
        return <>
            <p>{placeHolder}</p>
            <Image src='/static/brokenpiston.jpg'
                alt="Broken piston"
                className="errorImage"
                fluid />
            <Alert variant='warning'>{error}</Alert>
        </>;
    }

    return <div><p>{placeHolder}</p></div>
}

export default DataProvider;
