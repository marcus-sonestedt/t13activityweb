import React, { useEffect, useState, ReactNode, ReactElement, useCallback } from "react";
import { Container, Alert, Image } from 'react-bootstrap'

export interface DataProps<T> {
    ctor: ((json: string) => T);
    url: string;
    onLoaded?: ((data: T) => void);
    render?: (() => ReactNode);
}

export function DataProvider<T>(props: React.PropsWithChildren<DataProps<T>>) {
    const { ctor, url, onLoaded, render, children } = props;
    const [data, setData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [placeHolder, setPlaceHolder] = useState("Laddar...");

    const handleData = useCallback((json: string) => {
        var typedData = ctor(json);
        setData(typedData);
        if (onLoaded !== undefined)
            onLoaded(typedData);
    },
        // eslint-disable-next-line
        []);

    useEffect(() => {
        const controller = new AbortController();
        setPlaceHolder("Laddar...");
        setError(null);

        fetch(url, {
            signal: controller.signal,
            cache: "no-cache"
        })
            .then(r => {
                if (r.status !== 200) {
                    setPlaceHolder("Oops. Något gick fel! :(");
                    setError(`Error ${r.status}: ${r.statusText}}\n`);
                    r.text().then(errorBody => setError(err => err + errorBody));
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
                if (e.name === 'AbortError')
                    return
                console.error(e);
                setPlaceHolder("Oops. Något gick fel. :(");
                setError(e.toString());
            });

        return function cleanup() {
            controller.abort();
        }
    }, [url, handleData]);

    if (data !== null && data !== undefined)
        // see https://stackoverflow.com/questions/54905376/type-error-jsx-element-type-null-undefined-is-not-a-constructor-functi/54908762
        if (render !== undefined)
            return render() as ReactElement<any>;
        else
            return children as ReactElement<any>;

    if (error != null)
        return <Container fluid>
            <p>{placeHolder}</p>
            <Image src='/static/brokenpiston.jpg'
                alt="Broken piston"
                className="errorImage"
                fluid />
            <Alert variant='warning'>{error}</Alert>
        </Container>;

    return <p>{placeHolder}</p>
}

export default DataProvider;
