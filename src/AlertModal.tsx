import { ConfirmModal, ConfirmModalProps, Navigation } from 'decky-frontend-lib';
type props = ConfirmModalProps & {
    title: string,
    description: string,
    onClosed?: () => void;
}
export const AlertModal = ({ closeModal, title, description }: props) => {
    return (
        <ConfirmModal closeModal={closeModal} strTitle={title} strDescription={description} onOK={() => Navigation.OpenQuickAccessMenu()} bAlertDialog={true}>
        </ConfirmModal>
    );
};