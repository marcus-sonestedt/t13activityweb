import React from "react";
import IdValue from '../Models'

export function Table<T extends IdValue>(data: T[]) {
    if (!data.length)
        return <p>Nothing to show</p>

    return (
        <div className="table-container">
            <h2 className="subtitle">
                Showing <strong>{data.length} item(s)</strong>
            </h2>
            <table className="table is-striped">
                <thead>
                    <tr>
                        {Object.entries(data[0]).map(el => <th key={el[0]}>{el[0]}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map(a => (
                        <tr key={a.id}>
                            {Object.entries(a).map(el => <td key={(a.id, el[0])}>{el[1]}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
