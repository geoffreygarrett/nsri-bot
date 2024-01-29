"use client";

import React, {useContext, useState} from 'react';
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
import {AppContext} from "@/app/app";
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
import {useNetworkState} from "@uidotdev/usehooks";

export function RescueBuoyForm({buoy, onClose, className}: { buoy: any, onClose: () => void, className?: string }) {
    const supabase = useSupabaseClient<Database>();
    const {state, dispatch} = useContext(AppContext);
    const [loading, setLoading] = React.useState(false);
    const [image, setImage] = React.useState<string | null>(buoy.image_url);

    const network = useNetworkState();

    const form = useForm({
        defaultValues: {
            name: buoy.name,
            lat: Number(buoy.location.coordinates[1]),
            lng: Number(buoy.location.coordinates[0]),
            alt: Number(buoy.location.coordinates[2]),
            status: buoy.status,
            description: buoy.description ? buoy.description : "",
            comment: "",
            buoy_id: buoy.buoy_id,
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

    // Enhanced uploadImage function
    async function uploadImage(file: File) {
        if (!file) throw new Error('No file provided');

        const [filename, extension] = file.name.split('.');
        const newFileName = `${filename}-${new Date().toISOString()}.${extension}`;
        const path = `public/${newFileName}`;

        const {error: uploadError} = await supabase.storage.from(RESCUE_BUOYS)
            .upload(path, file, {cacheControl: '3600', upsert: true});

        if (uploadError) throw uploadError;

        const {data} = supabase.storage.from(RESCUE_BUOYS).getPublicUrl(path);
        return data.publicUrl;
    }

    // Refined handleImageChange function
    // const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     if (event.target.files?.[0]) {
    //         setImage(URL.createObjectURL(event.target.files[0]));
    //     }
    // };
    const [imageFile, setImageFile] = useState<File | null>(null); // New state for the file object
    const [imagePreview, setImagePreview] = useState<string | null>(buoy.image_url); // For image preview

    // Enhanced handleImageChange for immediate preview and file state update
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setImageFile(file);
        }
    };

    // Optimized onSubmit function
    const onSubmit = async (values: z.infer<typeof rescueBuoySchema>) => {
        try {
            setLoading(true);
            onClose();

            let imageUrl = values.image ? await uploadImage(values.image) : buoy.image_url;
            const updatedBuoy = {
                ...buoy,
                image_url: imageUrl,
                name: values.name,
                description: values.description,
                buoy_id: values.buoy_id,
                location: {type: "Point", coordinates: [values.lng, values.lat, values.alt]},
                status: values.status,
                updated_at: new Date().toISOString(),
            };

            const data = getChangedFields(buoy, updatedBuoy);
            dispatch(updateItemAction('rescue_buoys', {data, column: 'id', value: buoy.id}, SOURCE.CLIENT));
            toast.success('Buoy updated successfully');
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };


    // export function BuoyForm({ form, onSubmit, onClose, handleImageChange, image, buoy, BuoyStatus }) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("w-full", className)}>
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="location">Location</TabsTrigger>
                        <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        {/*<Card className="p-1 bg-none border-none">*/}
                        <CardHeader className="p-4">
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Fill in the general information about the buoy.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 p-4">
                            {/*<div className="flex justify-center">*/}
                            {/*    {image ? (*/}
                            {/*        <Image src={image} alt="Buoy" width={200} height={200} objectFit="cover"/>*/}
                            {/*    ) : (*/}
                            {/*        <div*/}
                            {/*            className="w-48 h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-800">*/}
                            {/*            <CameraIcon className="h-24 w-24 text-gray-400" aria-hidden="true"/>*/}
                            {/*        </div>*/}
                            {/*    )}*/}
                            {/*</div>*/}
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
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Buoy Name" className="h-9"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="buoy_id"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Buoy ID</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Buoy ID" type="number" step={1}
                                                   className="h-9"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" className="h-9"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(BuoyStatus).map((status) => (
                                                        <SelectItem key={status} value={status}
                                                                    onSelect={() => field.onChange(status)}>
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Description" rows={3}
                                                      className="resize-none"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">Save</Button>
                        </CardFooter>
                        {/*</Card>*/}
                    </TabsContent>

                    <TabsContent value="location">
                        <CardHeader className="p-4">
                            <CardTitle>Location Details</CardTitle>
                            <CardDescription>Specify the exact location of the buoy.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 p-4">
                            <FormField
                                control={form.control}
                                name="lat"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Latitude</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Latitude" type="number" step={0.0000001}
                                                   className="h-9"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lng"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Longitude</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Longitude" type="number" step={0.0000001}
                                                   className="h-9"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="alt"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Altitude</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Altitude" type="number" step={0.0000001}
                                                   className="h-9"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">Save Location</Button>
                        </CardFooter>
                    </TabsContent>

                    <TabsContent value="metadata">
                        {/*<Card>*/}
                        <CardHeader className="p-4">
                            <CardTitle>Additional Metadata</CardTitle>
                            <CardDescription>Provide any additional information or comments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 p-4">
                            <FormField
                                control={form.control}
                                name="comment"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Change Comments</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Comment" rows={3}
                                                      className="resize-none"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">Save Metadata</Button>
                        </CardFooter>
                        {/*</Card>*/}
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );
}


//
//     return (
//
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//                 <div className="grid grid-cols-1 gap-4">
//                     <div className="flex justify-center">
//                         {image ? (
//                             <Image src={image} alt="Buoy" width={200} height={200} objectFit="cover"/>
//                         ) : (
//                             <div className="w-48 h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
//                                 <CameraIcon className="h-24 w-24 text-gray-400" aria-hidden="true"/>
//                             </div>
//                         )}
//                     </div>
//
//                     <FormField
//                         control={form.control}
//                         name="name"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Name</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="Buoy Name"/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="buoy_id"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Buoy ID</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="Buoy ID" type="number" step={1}/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="status"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Status</FormLabel>
//                                 <FormControl>
//                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                         <SelectTrigger>
//                                             <SelectValue placeholder="Select Status"/>
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {Object.values(BuoyStatus).map((status) => (
//                                                 <SelectItem key={status} value={status}
//                                                             onSelect={() => field.onChange(status)}>
//                                                     {status}
//                                                 </SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="description"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Description</FormLabel>
//                                 <FormControl>
//                                     <Textarea {...field} placeholder="Description" rows={3} className="resize-none"/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="image"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Image</FormLabel>
//                                 <FormControl>
//                                     <Input type="file" accept="image/x-png,image/gif,image/jpeg" onChange={(event) => {
//                                         const file = event.target.files?.[0];
//                                         field.onChange(file);
//                                         handleImageChange(event);
//                                     }}/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <Separator/>
//
//                     <FormLabel>Location</FormLabel>
//
//                     <FormField
//                         control={form.control}
//                         name="lat"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Latitude</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="Latitude" type="number" step={0.0000001}/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="lng"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Longitude</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="Longitude" type="number" step={0.0000001}/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="alt"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Altitude</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="Altitude" type="number" step={0.0000001}/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <Separator/>
//
//                     <FormLabel>Metadata</FormLabel>
//                     <FormField
//                         control={form.control}
//                         name="comment"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Change Comments</FormLabel>
//                                 <FormControl>
//                                     <Textarea {...field} placeholder="Comment" rows={3} className="resize-none"/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <div className="flex space-x-4">
//                         <Button type="submit">Save</Button>
//                         <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
//                     </div>
//                 </div>
//             </form>
//         </Form>
//
//
//     );
// }
