"use client";

import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Separator} from "@/components/ui/separator";
import {TagInput} from "@/components/ui/tag-input";
import {isPossiblePhoneNumber} from "libphonenumber-js";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import React, {RefAttributes, useEffect, useMemo, useState} from "react";
import {SelectTriggerProps} from "@radix-ui/react-select";
import {Database, Tables} from "@/types/supabase";
import {invitationSchema} from "@/schema";
import {useFetch} from "@/hooks/use-fetch";
import {useAsync} from "@/hooks/use-async";
import {useSupabaseClient, useUser} from "@supabase/auth-helpers-react";
import {QueryData} from "@supabase/supabase-js";

// Enum for roles
enum Role {
    SUPER_ADMIN = "Super Admin",
    STATION_ADMIN = "Station Admin",
    USER = "User",
}

// props for enum combobox
interface EnumComboboxProps {
    enumObject: { [key: string]: string };
    className?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    defaultValue?: string;
    // ... other props
}

const EnumSelect = React.forwardRef<HTMLSelectElement, EnumComboboxProps>(
    ({enumObject, className, placeholder, onChange, ...props}, ref) => {
        const selectItems = Object.entries(enumObject)
            .filter(([key]) => isNaN(Number(key))) // Filter out reverse mappings
            .map(([key, value]) => ({
                value: key, // The enum key as value
                label: value, // The enum value as label
            }));

        return (
            <Select onValueChange={onChange ? (value) => onChange(value) : undefined}
                    defaultValue={props?.defaultValue?.toString() || undefined}>
                <SelectTrigger className={className}>
                    <SelectValue placeholder={placeholder}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {selectItems.map((item) => (
                            <SelectItem value={item.value} key={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        );
    }
);

EnumSelect.displayName = "EnumSelect";


const PhoneTagInput = ({tags, setTags, className}: {
    tags: string[];
    className?: string;
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
}) => {

    const validateE164 = (number: string): boolean => {
        const regex = "^\\+[1-9]\\d{1,14}$";
        return number.match(regex) !== null;
    }

    return (
        <TagInput
            tags={tags}
            setTags={setTags}
            placeholder="Enter phone numbers here."
            validateTag={
                (number: string
                ) => validateE164(number) && isPossiblePhoneNumber(number)
            }
            className={cn(className)}
            separator={[',', ';']}
            onValidationResult={(tag: string, isValid: boolean) => {
                if (!isValid) {
                    if (!isPossiblePhoneNumber(tag)) {
                        toast.error("Invalid phone number: " + tag + ". Please use a valid phone number.");
                    } else if (!validateE164(tag)) {
                        toast.error("Invalid phone number format: " + tag + ". Please use E.164 format. Example: +27821234567");
                    }
                }
            }
            }
        />
    )
}

export type InvitationFormValues = z.infer<typeof invitationSchema>;

export default function InvitationForm({onSubmit}: {
    onSubmit: (values: InvitationFormValues) => void;
}) {

    // Get current user
    const user = useUser();
    const supabase = useSupabaseClient<Database>();

    // Form validation
    const form = useForm({
        resolver: zodResolver(invitationSchema),
        defaultValues: {
            role: '',
            station_id: undefined,
            numbers: [],
            note: '',
        },
    });

    // Fetch roles and permissions of current user
    const {
        error: errorRoles,
        loading: loadingRoles,
        value: rolesPermissions
    } = useFetch<{ roles: string[], permissions: string[] }>(
        "/api/roles-permissions",
        {},
        []
    )

    // Fetch stations
    const {
        error: errorStations,
        loading: loadingStations,
        value: stations
    } = useFetch<Tables<'nsri_stations'>[]>(
        "/api/stations",
        {},
        []
    )

    const roleshipQuery = supabase
        .from('roleships')
        .select('*, roles (*), nsri_stations (*)');

    type RoleshipQueryType = QueryData<typeof roleshipQuery>;


    const {
        error: errorRoleships,
        loading: loadingRoleships,
        value: roleships
    } = useAsync<RoleshipQueryType>(
        async () => supabase.from('roleships')
            .select('*, roles (*), nsri_stations (*)')
            .eq('user_id', user?.id ?? '')
            .returns<RoleshipQueryType>()
            .then((res) => {
                if (res.error) {
                    throw res.error;

                } else {
                    return res.data;
                }
            })
        , []
    );

    const {
        error: error_all_roles,
        loading: loading_all_roles,
        value: roles
    } = useAsync<Tables<'roles'>[]>(
        async () => supabase.from('roles')
            .select('*')
            .returns<Tables<'roles'>[]>()
            .then((res) => {
                if (res.error) {
                    throw res.error;

                } else {
                    return res.data;
                }
            })
        , []
    );

    const [invitableRoles, setInvitableRoles] = useState<Tables<'roles'>[]>([]);
    const [roleStationMapping, setRoleStationMapping] = useState<Record<string, number[]>>({});

    useEffect(() => {
        if (!roleships || !roles || errorRoleships || !stations || errorStations) return;

        const isSuperAdmin = roleships.some(r => r.roles?.name === 'super-admin');
        const allStationIds = stations.map(station => station.id);

        // Determine the minimum role level of the user
        const minRole = roleships.reduce((acc: number, roleship) => {
            return Math.min(acc, roleship.roles?.level ?? Infinity);
        }, Infinity);

        // Set invitable roles for all users
        setInvitableRoles(roles.filter(role => isSuperAdmin || role.level >= minRole));

        // Set role-station mapping
        setRoleStationMapping(
            roles.reduce((acc, role) => {
                if (isSuperAdmin) {
                    // Super-admins can invite any role to any station
                    acc[role.id] = allStationIds;
                } else {
                    // Other users can invite only to stations where they have roleships
                    acc[role.id] = roleships
                        .filter(r => r.roles?.name === role.name)
                        .map(r => r.station_id)
                        .filter((id): id is number => id !== null) // Explicit type guard
                        .filter((id, index, self) => self.indexOf(id) === index);
                }
                return acc;
            }, {} as Record<string, number[]>)
        );
    }, [roleships, roles, stations, errorRoleships, errorStations]);

    const selectedRole = form.watch("role");

    // Filter stations based on the selected role
    const filteredStations = useMemo(() => {
        return roleStationMapping[selectedRole] || [];
    }, [roleStationMapping, selectedRole]);

    const stationsDisabled = useMemo(() => {
        return (
            !roles ||
            selectedRole === undefined ||
            selectedRole === null ||
            selectedRole === "" ||
            filteredStations.length === 0 ||
            loadingStations ||
            loadingRoles ||
            roles.some(role => role.id === selectedRole && role.name === "super-admin")
        );
    }, [roles, selectedRole, filteredStations.length, loadingStations, loadingRoles]);

    const roleDisabled = useMemo(() => !roles || loadingRoles, [roles, loadingRoles]);

    return (
        <>
            {/* Dialog Body within Form */}
            <Form {...form}>

                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">

                    {/* Role input */}
                    <FormField
                        control={form.control}
                        name="role"
                        render={({field}) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                                <FormLabel className="text-right">
                                    Role
                                </FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}
                                            disabled={roleDisabled}>
                                        <SelectTrigger className={cn("col-span-4 col-start-2")}>
                                            <SelectValue placeholder="Select a role..."/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>

                                                {
                                                    !loadingRoles && roles && roleStationMapping && invitableRoles.map((role) => (
                                                        <SelectItem value={role.id.toString()} key={role.id}
                                                                    onSelect={() => {
                                                                        field.onChange(role.id);
                                                                    }}>
                                                            {role.name
                                                                .replace(/-/g, ' ')
                                                                .split(' ')
                                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                .join(' ')}
                                                        </SelectItem>
                                                    ))

                                                }

                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>

                                </FormControl>
                                {/*<FormDescription className="col-span-4 col-start-2">*/}
                                {/*    This is the name you&apos;ll use to log in.*/}
                                {/*</FormDescription>*/}
                                <FormMessage className="col-span-4 col-start-2"/>
                            </FormItem>
                        )}
                    />

                    {/* Station input */}
                    <FormField
                        control={form.control}
                        name="station_id"
                        render={({field}) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                                <FormLabel className="text-right">
                                    Station
                                </FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange}
                                            defaultValue={field.value ? field.value : undefined}
                                            disabled={stationsDisabled}>
                                        <SelectTrigger className={cn("col-span-4 col-start-2")}>
                                            <SelectValue placeholder="Select a station..."/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>

                                                {
                                                    stations?.filter(station => filteredStations.includes(station.id)).map((item) => (
                                                        <SelectItem
                                                            value={item.id.toString()}
                                                            key={item.id}
                                                            onSelect={() => {
                                                                field.onChange(item.id);
                                                            }}>
                                                            {item.name} ({item.id})
                                                        </SelectItem>
                                                    ))

                                                }

                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>

                                </FormControl>
                                {/*<FormDescription className="col-span-3 col-start-2">*/}
                                {/*    This is the name you&apos;ll use to log in.*/}
                                {/*</FormDescription>*/}
                                <FormMessage className="col-span-4 col-start-2 auth-form-message"/>
                            </FormItem>
                        )}/>

                    {/* Additional inputs for single use and note */}
                    <Separator/>

                    {/*Numbers input */}
                    <FormField
                        control={form.control}
                        name="numbers"
                        render={({field}) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                                <FormLabel className="text-right">
                                    Numbers
                                </FormLabel>
                                <FormControl>
                                    <PhoneTagInput tags={field.value} setTags={field.onChange}
                                                   className="col-span-3"/>
                                </FormControl>
                                <FormMessage className="col-span-4 col-start-2 auth-form-message"/>
                            </FormItem>
                        )}
                    />

                    {/* Note input */}
                    <FormField
                        control={form.control}
                        name="note"
                        render={({field}) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                                <FormLabel className="text-right">
                                    Note
                                </FormLabel>
                                <FormControl>
                                    <Textarea id="note" className="col-span-3 resize-none" {...field} rows={4}/>
                                </FormControl>
                                <FormMessage className="col-span-4 col-start-2 auth-form-message"/>
                            </FormItem>
                        )}
                    />

                    {/* Submit button */}
                    <Button type="submit">Create Invitation</Button>
                </form>

            </Form>
        </>
    )
}