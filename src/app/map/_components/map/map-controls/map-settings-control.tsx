import React, {useContext} from "react";
import SettingsControl from "./settings-control";
import {AppContext} from "@/app/map/map";

export const MapSettingsControl = ({className, onSettingChange}: { className?: string, onSettingChange?: (id: string, enabled: boolean) => void }) => {
    const {state, dispatch} = useContext(AppContext);
    return (<SettingsControl className="ml-2 mb-2 border border-gray-400 dark:border-gray-600"
                             settings={[
                                 {
                                     id: 'show_stations',
                                     name: 'Show stations',
                                     enabled: state.settings.toggles.show_stations.enabled
                                 },
                                 {
                                     id: 'show_buoys',
                                     name: 'Show buoys',
                                     enabled: state.settings.toggles.show_buoys.enabled
                                 },
                                 {
                                     id: 'enable_location',
                                     name: 'Enable location',
                                     enabled: state.settings.toggles.enable_location.enabled
                                 },
                                 {
                                     id: 'enable_clustering',
                                     name: 'Enable clustering',
                                     enabled: state.settings.toggles.enable_clustering.enabled
                                 },
                                 {
                                     id: 'enable_performance_mode',
                                     name: 'Enable performance mode',
                                     enabled: state.settings.toggles.enable_performance_mode.enabled
                                 },

                             ]}
                             onSettingChange={onSettingChange !== undefined ? onSettingChange : (id, enabled) => {}}

        />
    )
}
