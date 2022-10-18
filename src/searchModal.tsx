import { ModalRoot, ModalRootProps, TextField } from 'decky-frontend-lib';
import { useEffect, useRef, useState } from 'react';
type props = ModalRootProps & {
    onClosed: (searchQuery: string) => void;
}
export const SearchModal = ({ closeModal, onClosed }: props) => {
    const [searchText, setSearchText] = useState('');
    const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };
    const textField = useRef<any>();
    useEffect(() => {
        //This will open up the virtual keyboard
        textField.current?.element?.click();
    }, []);
    const submit = () => onClosed(searchText)
    return (
        <ModalRoot closeModal={closeModal}>
            <form onSubmit={submit}>
                <TextField
                    //@ts-ignore
                    ref={textField}
                    focusOnMount={true}
                    label="Search"
                    placeholder={'Search by station name or artists'}
                    onChange={handleText}
                />
            </form>
        </ModalRoot>
    );
};