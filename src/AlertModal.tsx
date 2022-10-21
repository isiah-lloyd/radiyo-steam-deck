import { ConfirmModal, ConfirmModalProps, ModalRoot, ModalRootProps, QuickAccessTab, Router, TextField } from 'decky-frontend-lib';
type props = ConfirmModalProps & {
    title: string,
    description: string,
    onClosed?: () => void;
}
export const AlertModal = ({ closeModal, title, description }: props) => {
    return (
        <ConfirmModal closeModal={closeModal} strTitle={title} strDescription={description} onOK={() => Router.OpenQuickAccessMenu(QuickAccessTab.Decky)} bAlertDialog={true}>
        </ConfirmModal>
    );
};