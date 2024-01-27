"use client";

import React, {useContext} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {buoyStatusEnum, rescueBuoySchema} from "@/schema"; // Define this schema as per your data model
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {BuoyStatus} from "@/types/temp";
import Image from "next/image";
import {CameraIcon} from "@heroicons/react/24/outline";
import {Separator} from "@/components/ui/separator";
import {Textarea} from "@/components/ui/textarea";
import {AppContext} from "@/app/map/map";
import {Database, Tables} from "@/supabase";
import {cn} from "@/lib/utils";
import {SOURCE, updateItemAction} from "@/store/table-reducer";
import {TablesUpdate} from "@/types/supabase";

import {diff} from 'json-diff-ts';
import {toast} from "sonner";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from "@/components/ui/label";

export function EditRescueBuoyForm({buoy, open, onClose}: { buoy: any, open: boolean, onClose: () => void }) {
    const supabase = useSupabaseClient<Database>();
    const {state, dispatch} = useContext(AppContext);
    const [loading, setLoading] = React.useState(false);
    const [image, setImage] = React.useState<string | null>(buoy.image_url);

    const form = useForm({
        defaultValues: {
            name: buoy.name,
            lat: Number(buoy.location.coordinates[1]),
            lng: Number(buoy.location.coordinates[0]),
            alt: Number(buoy.location.coordinates[2]),
            status: buoy.status,
            description: "",
            comment: "",
            buoy_id: 0,
            image: "",
            // metadata: JSON.stringify(buoy.metadata, null, 2),
        },
        resolver: zodResolver(rescueBuoySchema),
    });


    const getChangedFields = <T extends keyof Database['public']['Tables']>(original: Tables<T>, updated: TablesUpdate<T>) => {
        const changes: Record<string, any> = {};
        for (const key in updated) {
            if (updated[key] !== original[key as keyof typeof original]) {
                changes[key] = updated[key];
            }
        }
        return changes;
    };

    const RESCUE_BUOYS = 'rescue_buoys';

    async function uploadImage(file: File) {
        if (!file) {
            throw new Error('No file provided');
        }

        // const path = `public/${params.id}/${params.message_sid}.png`;

        console.log(file);
        const extension = file.name.split('.')[1]
        const filename = file.name.split('.')[0]

        const newFileName = `${filename}-${new Date().toISOString()}.${extension}`;

        const path = `public/${newFileName}`;

        const {error: uploadError} = await supabase.storage.from(RESCUE_BUOYS).upload(path, file, {
            cacheControl: '3600',
            upsert: true
        });

        if (uploadError) throw uploadError;

        const {data} = supabase.storage.from(RESCUE_BUOYS).getPublicUrl(path);

        return data.publicUrl;
    }



    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event)
        if (event.target.files && event.target.files[0]) {
            setImage(URL.createObjectURL(event.target.files[0]));
        }
    };

    const onSubmit = async (values: z.infer<typeof rescueBuoySchema>) => {
        setLoading(true);
        onClose();

        console.log(values.image)

        try {
            let imageUrl = buoy.image_url;

            console.log(values.image)

            let stuff = {};

            // Check if a new image file is selected
            if (values.image) {
                imageUrl = await uploadImage(values.image);
                stuff = {
                    ...stuff,
                    image_url: imageUrl,
                }
            }

            const update = {
                ...buoy,
                ...stuff,
                name: values.name,
                location: {
                    type: "Point",
                    coordinates: [values.lng, values.lat, values.alt],
                },
                status: values.status,
                id: buoy.id,
                updated_at: new Date().toISOString(),
            };

            const data = getChangedFields(buoy, update);
            console.log(data);

            dispatch(updateItemAction('rescue_buoys', {data, column: 'id', value: buoy.id}, SOURCE.CLIENT));
            setLoading(false);
            toast.success('Buoy updated successfully');
        } catch (error : any) {
            console.error(error);
            toast.error(`Error: ${error.message}`);
            setLoading(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="md:w-[600px] grid grid-cols-3 gap-4 max-w-full overflow-auto max-h-[100dvh]">

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className={"col-span-3 grid grid-cols-3 gap-4"}>
                        {/*<Tabs defaultValue="account" className="col-span-3">*/}
                        {/*    <TabsContent value="Details">*/}

                        {/*    </TabsContent>*/}
                        {/*    <TabsContent value="Location">*/}


                        {/*    </TabsContent>*/}
                        {/*    <TabsList className="grid w-full mt-2 grid-cols-2 col-span-3">*/}
                        {/*        <TabsTrigger value="account">Details</TabsTrigger>*/}
                        {/*        <TabsTrigger value="password">Location</TabsTrigger>*/}
                        {/*    </TabsList>*/}
                        {/*</Tabs>*/}


                        <div className="col-span-1">
                            {image ? (
                                <Image src={image} alt="Buoy" width={200} height={200} objectFit="cover"/>
                            ) : (
                                <div
                                    className="w-full aspect-square flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                                    <CameraIcon className="h-24 w-24 text-gray-400" aria-hidden="true"/>
                                </div>
                            )}
                        </div>



                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Buoy Name"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <div className={"grid grid-cols-2 space-x-2"}>
                                <FormField
                                    control={form.control}
                                    name="buoy_id"
                                    render={({field}) => (
                                        <FormItem className={"py-2 col-span-1"}>
                                            <FormLabel>Buoy ID</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Buoy ID" type={"number"} step={1}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({field}) => (
                                        <FormItem className={"py-2 col-span-1 h-10"}>
                                            <FormLabel>Status</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Status"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(BuoyStatus).map((status) => (
                                                            <SelectItem key={status} value={status} onSelect={() => {
                                                                field.onChange(status);
                                                            }}>{status}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                            </div>



                            <FormField
                                control={form.control}
                                name="description"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Description" rows={3}
                                                      className={"resize-none"}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <div className="my-4 col-span-2">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Image</FormLabel>
                                            <FormControl>
                                                <Input type="file" id="picture"
                                                       accept="image/x-png,image/gif,image/jpeg" onChange={
                                                    (event) => {
                                                        const file = event.target.files?.[0];
                                                        field.onChange(event.target.files?.[0]);

                                                        // field.onChange(event);
                                                        handleImageChange(event);
                                                    }
                                                }/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                        </div>


                        <Separator className="my-4 col-span-3"/>
                        <FormLabel className="col-span-1">Location</FormLabel>

                        <div className="col-span-2">

                            <FormField
                                control={form.control}
                                name="lat"
                                render={({field}) => (
                                    <FormItem className={"pb-2"}>
                                        <FormLabel>Latitude</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Latitude" type={"number"} step={0.0000001}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lng"
                                render={({field}) => (
                                    <FormItem className={"py-2"}>
                                        <FormLabel>Longitude</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Longitude" type={"number"} step={0.0000001}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="alt"
                                render={({field}) => (
                                    <FormItem className={"py-2"}>
                                        <FormLabel>Altitude</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Altitude" type={"number"} step={0.0000001}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                        </div>

                        <Separator className="my-4 col-span-3"/>
                        <FormLabel className="col-span-1">Metadata</FormLabel>
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({field}) => (
                                <FormItem className={"col-span-2"}>
                                    <FormLabel>Change Comments</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Comment" rows={3}
                                                  className={"resize-none"}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        {/*<Button type="submit">Save Changes</Button>*/}
                        {/*<Button variant="secondary" onClick={onClose}>Cancel</Button>*/}
                        <DialogFooter className="col-span-3">
                            <Button type="submit">Save</Button>
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        </DialogFooter>
                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    );
}
