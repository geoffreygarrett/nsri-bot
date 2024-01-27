"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Define types for settings
type Setting = {
    id: string;
    name: string;
    enabled: boolean;
};

interface SettingsControlProps {
    className?: string;
    settings: Setting[];
    onSettingChange: (id: string, enabled: boolean) => void;
}

const SettingsControl: React.FC<SettingsControlProps> = ({ className, settings, onSettingChange }) => {
    const [open, setOpen] = useState(false);

    // Function to handle setting change
    const handleSettingChange = async (settingId: string, enabled: boolean) => {
        onSettingChange(settingId, enabled);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    className={cn(
                        "h-10 w-10 bg-white p-2 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 border-1 shadow-sm rounded-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                        className
                    )}
                >
                    <Cog6ToothIcon className="w-6 h-6" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("w-[200px] p-0", className, "mt-0")}>
                {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center space-x-2 p-2">
                        <Switch id={setting.id} checked={setting.enabled}
                                onCheckedChange={() => handleSettingChange(setting.id, !setting.enabled)}/>
                        <Label htmlFor={setting.id}>{setting.name}</Label>
                    </div>
                ))}
            </PopoverContent>
        </Popover>
    );
};

export default SettingsControl;
