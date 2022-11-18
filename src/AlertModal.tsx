import { ConfirmModal, ConfirmModalProps, QuickAccessTab, Router } from 'decky-frontend-lib';
import { OpenQuickAccessMenu } from './RouterPolyfill';
type props = ConfirmModalProps & {
    title: string,
    description: string,
    onClosed?: () => void;
}
export const AlertModal = ({ closeModal, title, description }: props) => {
    return (
        <ConfirmModal closeModal={closeModal} strTitle={title} strDescription={description} onOK={() => OpenQuickAccessMenu()} bAlertDialog={true}>
        </ConfirmModal>
    );
};