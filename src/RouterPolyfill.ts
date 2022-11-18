// @ts-nocheck
import { QuickAccessTab, Router } from "decky-frontend-lib";
export const OpenQuickAccessMenu = () => {
    Router?.WindowStore?.GamepadUIMainWindowInstance?.MenuStore.OpenQuickAccessMenu(QuickAccessTab.Decky);
}