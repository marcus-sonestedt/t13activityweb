import { Attachment } from "../Models";
import { HoverTooltip } from "./Utilities";
import React from "react";


export const AttachmentComponent = (props: { model: Attachment }) => {
    const { model } = props;
    const filename = /[^/]*$/.exec(model.file);
    const tooltip = `Uppladdad av ${model.uploader?.first_name} ${model.uploader?.last_name} den ${model.modified}`

    return <HoverTooltip tooltip={tooltip} placement='left'>
        <>
            <a href={model.file}>
                <span role='img' aria-label='document'>📃</span>
                {' '}
                {filename}
            </a>
            {' - '}
            {model.comment}
        </>
    </HoverTooltip>
}

export const Attachments = (props: { models: Attachment[] }) => {
    if (!props.models?.length)
        return null

    return <>
        <h4>Filer</h4>
        <ul>
            {props.models.map(m => <li key={m.id}> <AttachmentComponent model={m} /></li>)}
        </ul>
    </>
}
