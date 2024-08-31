import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

function Editor(props) {
    let [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    if (loaded) {
        return (
            <CKEditor
                editor={ClassicEditor}
                data={props.data ?? ""}
                onChange={(event, editor) => {  // do something when editor's content changed
                    const data = editor.getData();
                    props.setData(data);
                }}
            />
        );
    } else {
        return <div></div>;
    }
}

export default Editor;