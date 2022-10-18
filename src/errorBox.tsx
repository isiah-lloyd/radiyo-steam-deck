import { VFC } from "react";
import { MdErrorOutline } from "react-icons/md";

const errorWindow: React.CSSProperties = {
    position: 'relative',
    backgroundColor: 'red',
    color: 'white'
}
const centered: React.CSSProperties = {
    textAlign: "center"
}
export const ErrorBox: VFC<{ msg: string }> = ({ msg }) => {
    return (
        <div style={errorWindow}>
            {msg}
        </div>
    )
};
export const ErrorMessage: VFC<{ msg: string }> = ({ msg }) => {
    return (
        <div style={centered}>
            <h1><MdErrorOutline /></h1>
            <p>{msg}</p>
        </div>
    )
};