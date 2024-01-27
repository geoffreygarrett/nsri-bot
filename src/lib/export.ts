import {IMarker, IExport, IPolygon, DataType} from "@/components/types";

function escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Helper function to format date
function formatDate(dateString: string): string {
    // Ensure the date string exists and is not empty
    if (!dateString) return '';

    // Parse the date string into a Date object
    const date = new Date(dateString);

    // Define options for date formatting
    const options = {
        year: 'numeric' as const, // "numeric" or "2-digit"
        month: 'long' as const, // "numeric", "2-digit", "long", "short", or "narrow"
        // "numeric", "2-digit", "long", "short", or "narrow"
        day: 'numeric' as const, // "numeric" or "2-digit"
        hour: '2-digit' as const, // "numeric" or "2-digit"
        minute: '2-digit' as const, // "numeric" or "2-digit"
        second: '2-digit' as const, // "numeric" or "2-digit"
        hour12: true // true or false
    };

    // Create an Intl.DateTimeFormat object with the desired locale and options
    const formatter = new Intl.DateTimeFormat('en-ZA', options);

    // Return the formatted date string
    return formatter.format(date);
}


import xmlFormat from 'xml-formatter';
import {isRescueBuoy} from "@/app/map/map";
import {BuoyStatus} from "@prisma/client";


export const exportCsv = (data_export: IMarker[], name: string = 'Locations'): void => {
    // Define CSV content with a header
    let csvContent = '"ID","Name","Description","Status","Longitude","Latitude","Altitude","Type"\n';  // Add a "Type" column

    data_export.forEach(marker => {
        // Determine the type of marker
        const type = isRescueBuoy(marker) ? "PINK_RESCUE_BUOY" : "STATION";
        const status = isRescueBuoy(marker) ? marker.status : "";

        // Ensure data is CSV safe
        const makeCsvSafe = (data: string | number) => `"${data.toString().replace(/"/g, '""')}"`;

        // Compile the CSV line from marker data
        const line = [
            makeCsvSafe(marker.id || ''),  // ID
            makeCsvSafe(marker.name),  // Name
            '',  // Description (or reuse name if description isn't separate)
            makeCsvSafe(status),  // Status
            makeCsvSafe(marker.location.coordinates[0]),  // Longitude
            makeCsvSafe(marker.location.coordinates[1]),  // Latitude
            makeCsvSafe(marker.location.coordinates[2]),  // Altitude
            makeCsvSafe(type)  // Type column for marker category/status
        ].join(',');

        csvContent += line + "\n";
    });

    // Trigger download or save the CSV file
    triggerDownload(csvContent, `${name}.csv`, 'text/csv');
}


export class KmlBuilder {
    private xmlHeader: string;
    private documentElements: string[];
    private styles: string[];
    private name: string;
    private description: string;
    private static XML_VERSION = '1.0';
    private static XML_ENCODING = 'utf-8';
    private static XMLNS = 'http://www.opengis.net/kml/2.2';

    constructor(name: string = 'Locations', description: string = 'Exported Locations') {
        this.xmlHeader = this.generateXmlHeader(KmlBuilder.XML_VERSION, KmlBuilder.XML_ENCODING);
        this.documentElements = [];
        this.styles = [];
        this.name = name;
        this.description = description;
    }

    private escapeXml(str: string): string {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    private generateXmlHeader(version: string, encoding: string): string {
        return `<?xml version="${version}" encoding="${encoding}"?>`;
    }

    private createElement(tagName: string, content: string = '', attributes: Record<string, string> = {}): string {
        const attrs = Object.entries(attributes)
            .map(([key, value]) => `${key}="${this.escapeXml(value)}"`)
            .join(' ');
        return `<${tagName} ${attrs.trim()}>\n${content.split('\n').map(line => '    ' + line).join('\n')}\n</${tagName}>`;
    }

    public addElement(xmlString: string): KmlBuilder {
        this.documentElements.push(xmlString);
        return this;
    }

// Utility method to create ExtendedData XML string from key-value pairs
    private createExtendedData(extendedData: Record<string, string | Record<string, string>> | undefined): string {
        if (!extendedData) {
            return '';
        }
        const dataEntries = Object.entries(extendedData).map(([key, value]) => {
            // Check if value is a string or a nested object with displayName and value
            if (typeof value === 'string') {
                return this.createElement('Data', this.createElement('value', this.escapeXml(value)), {name: key});
            } else {
                // Handle the more complex structure with displayName and value
                const displayNameElement = value.displayName ? this.createElement('displayName', this.escapeXml(value.displayName)) : '';
                const valueElement = value.value ? this.createElement('value', this.escapeXml(value.value)) : '';
                return this.createElement('Data', displayNameElement + valueElement, {name: key});
            }
        });

        return this.createElement('ExtendedData', dataEntries.join('\n'));
    }

    // Modified addPlacemark method to include extendedData argument
    public addPlacemark(
        name: string,
        description: string,
        lng: number,
        lat: number,
        alt?: number,
        styleUrl?: string,
        extendedData?: Record<string, string | Record<string, string>>
    ): KmlBuilder {
        const nameElement = this.createElement('name', this.escapeXml(name));
        const descriptionElement = description ? this.createElement('description', this.escapeXml(description)) : '';
        const styleUrlElement = styleUrl ? this.createElement('styleUrl', styleUrl) : '';
        const coordinates = `${lng},${lat}${alt ? ',' + alt : ''}`;
        const pointElement = this.createElement('Point', this.createElement('coordinates', coordinates));
        const extendedDataElement = this.createExtendedData(extendedData); // Create ExtendedData element
        const placemark = this.createElement('Placemark', nameElement + descriptionElement + styleUrlElement + pointElement + extendedDataElement);
        this.documentElements.push(placemark);
        return this;
    }

    private createStyle(id: string, iconHref: string): string {
        return this.createElement('Style', this.createElement('IconStyle', this.createElement('Icon',
            this.createElement('href', iconHref)
        )), {id});
    }

    public addStyle(id: string, iconHref: string): KmlBuilder {
        const style = this.createStyle(id, iconHref);
        this.styles.push(style);
        return this;
    }

    public addFolder(name: string, description: string, elements: KmlBuilder[] = []): KmlBuilder {
        const nameElement = this.createElement('name', this.escapeXml(name));
        const descriptionElement = description ? this.createElement('description', this.escapeXml(description)) : '';
        const content = elements.map(element => element.build(false)).join('\n');
        const folder = this.createElement('Folder', nameElement + descriptionElement + content);
        this.documentElements.push(folder);
        return this;
    }

    // Example
    //let kmlBuilder = new KmlBuilder("My KML Document", "A document with paths and overlays");
    // kmlBuilder
    //     .addPlacemark("My Place", "A nice place to visit", -122.0822, 37.4222)
    //     .addPath("Hiking Trail", [[-112.2, 36.0, 1500], [-112.0, 35.9, 1500]], 1, 1, 'relativeToGround')
    //     .addGroundOverlay("Historical Map", "http://example.com/map.jpg", {
    //         north: 37.919,
    //         south: 37.465,
    //         east: 15.358,
    //         west: 14.601,
    //         rotation: -0.155
    //     });
    //
    // console.log(kmlBuilder.build());


    // New Method to add Ground Overlay
    public addGroundOverlay(name: string, imageHref: string, latLonBox: Record<string, number>): KmlBuilder {
        const nameElement = this.createElement('name', this.escapeXml(name));
        const iconElement = this.createElement('Icon', this.createElement('href', imageHref));
        const latLonBoxElement = this.createElement('LatLonBox',
            Object.entries(latLonBox).map(([key, val]) => this.createElement(key, val.toString())).join(''));

        const groundOverlayContent = nameElement + this.createElement('Icon', iconElement) + latLonBoxElement;
        const groundOverlayElement = this.createElement('GroundOverlay', groundOverlayContent);

        this.documentElements.push(groundOverlayElement);
        return this;
    }

    // New Method to add Path
    public addPath(name: string, coordinates: Array<[number, number, number]>, extrude: number = 0, tessellate: number = 0, altitudeMode: string = 'absolute'): KmlBuilder {
        const nameElement = this.createElement('name', this.escapeXml(name));
        const coordString = coordinates.map(coord => coord.join(',')).join(' ');
        const coordinatesElement = this.createElement('coordinates', coordString);
        const lineStringContent = this.createElement('extrude', extrude.toString()) +
            this.createElement('tessellate', tessellate.toString()) +
            this.createElement('altitudeMode', altitudeMode) +
            coordinatesElement;
        const lineStringElement = this.createElement('LineString', lineStringContent);
        const placemark = this.createElement('Placemark', nameElement + lineStringElement);
        this.documentElements.push(placemark);
        return this;
    }

    public build(isRoot: boolean = true): string {
        // Build the current elements as usual
        const content = this.documentElements.join('\n');
        const nameElement = this.createElement('name', this.escapeXml(this.name));
        const descriptionElement = this.description ? this.createElement('description', this.escapeXml(this.description)) : '';
        const styleElements = this.styles.join('\n');
        const mainContent = nameElement + descriptionElement + styleElements + content;
        const finalContent = isRoot  // Check if it's the root
            ? this.generateRootContent(mainContent)  // If it's the root, wrap with Document and XML header
            : content;  // If it's not the root, just return the content

        return xmlFormat(finalContent);
    }

    private generateRootContent(content: string): string {
        const document = this.createElement('Document', content);
        const kmlContent = this.createElement('kml', document, {xmlns: KmlBuilder.XMLNS});
        return this.xmlHeader + kmlContent;
    }

    public export(filename: string = 'document.kml'): void {
        const fullKml = this.build();
        triggerDownload(xmlFormat(fullKml), filename, 'application/vnd.google-earth.kml+xml');
    }
}


export const exportKml = (data_export: IMarker[], name: string = 'Locations'): void => {
    const kmlBuilder = new KmlBuilder(name, 'Exported Locations');
    const markers = data_export; //.filter(element => element.type === DataType.MARKER) as IMarker[];
    // const polygons = data_export.filter(element => element.type === DataType.POLYGON) as IPolygon[];
//
//     <Style id="custom_pink_pin">
// //                 <IconStyle>
// //                     <Icon>
// //                         <href>http://maps.google.com/mapfiles/kml/paddle/pink-blank.png</href>
// //                     </Icon>
// //                 </IconStyle>
// //             </Style>`;

    // kmlBuilder.addStyle('custom_pink_pin', 'http://maps.google.com/mapfiles/kml/paddle/pink-blank.png');


    const styleMapper = (marker: IMarker) => {
        if (isRescueBuoy(marker)) {
            switch (marker.status) {
                case 'OK':
                    return '#nsri_prb_ok_pin';
                case 'MISSING':
                    return '#nsri_prb_missing_pin';
                case 'PROPOSED':
                    return '#nsri_prb_proposed_pin';
                case 'ATTENTION':
                    return '#nsri_prb_attention_pin';
                case 'UNKNOWN':
                    return '#nsri_prb_unknown_pin';
                default:
                    return '#nsri_prb_unknown_pin';
            }
        } else {
            return '#nsri_station_pin';
        }
    }

    // Helper function to format date

    // Divide markers into two groups
    const rescueBuoys = markers.filter(marker => isRescueBuoy(marker));
    const nsriStations = markers.filter(marker => !isRescueBuoy(marker));

    // Create top-level folders
    const rescueBuoyFolder = new KmlBuilder("Pink Rescue Buoys");
    const nsriStationFolder = new KmlBuilder("NSRI Stations");

    kmlBuilder.addStyle('nsri_prb_ok_pin', 'https://maps.google.com/mapfiles/kml/paddle/pink-blank.png')
        .addStyle('nsri_prb_unknown_pin', 'https://maps.google.com/mapfiles/kml/paddle/wht-blank.png')
        .addStyle('nsri_prb_missing_pin', 'https://maps.google.com/mapfiles/kml/paddle/red-blank.png')
        .addStyle('nsri_prb_attention_pin', 'https://maps.google.com/mapfiles/kml/paddle/blu-blank.png')
        .addStyle('nsri_prb_proposed_pin', 'https://maps.google.com/mapfiles/kml/paddle/ylw-blank.png')
        .addStyle('nsri_station_pin', 'https://maps.google.com/mapfiles/kml/pal3/icon23.png');

    // Create a folder for buoy status
    const BuoyFolders: Record<string, KmlBuilder> = Object.values(BuoyStatus).reduce((folders: Record<string, KmlBuilder>, status: BuoyStatus) => {
        // Assign a new KmlBuilder to each status
        folders[status] = new KmlBuilder(status.toString());
        return folders;
    }, {});

    for (const marker of markers) {
        // Prepare the extended data object conditionally
        let extendedData;
        if (isRescueBuoy(marker)) {
            extendedData = {
                ...marker.id && {id: {displayName: "ID", value: marker.id.toString()}},
                ...marker.status && {status: {displayName: "Status", value: marker.status}},
                ...marker.created_at && {
                    created_at: {
                        displayName: "Creation Date",
                        value: formatDate(marker.created_at)
                    }
                },
                ...marker.updated_at && {
                    last_checked: {
                        displayName: "Last Checked",
                        value: formatDate(marker.updated_at)
                    }
                },
                ...marker.station_id && {station_id: {displayName: "Station ID", value: marker.station_id.toString()}},
                ...marker.buoy_id && {buoy_id: {displayName: "Buoy ID", value: marker.buoy_id.toString()}},
                ...marker.image_url && {image_url: {displayName: "Image URL", value: marker.image_url}},
            };

            // Add the placemark to the appropriate folder
            BuoyFolders[marker.status].addPlacemark(
                marker.name,
                marker.name,
                marker.location.coordinates[0],
                marker.location.coordinates[1],
                marker.location.coordinates[2],
                styleMapper(marker),
                extendedData
            );

        } else {
            extendedData = {
                ...marker.id && {id: {displayName: "ID", value: marker.id.toString()}},
                ...marker.name && {name: {displayName: "Name", value: marker.name}},
            };

            // Add the placemark to the appropriate folder
            nsriStationFolder.addPlacemark(
                marker.name,
                marker.name,
                marker.location.coordinates[0],
                marker.location.coordinates[1],
                marker.location.coordinates[2],
                styleMapper(marker),
                extendedData
            );
        }


        // // Add the placemark with the conditional extendedData
        // kmlBuilder.addPlacemark(
        //     marker.name,
        //     marker.name,
        //     marker.lng,
        //     marker.lat,
        //     marker.alt,
        //     styleMapper(marker),
        //     extendedData
        // );
    }


    Object.entries(BuoyFolders).forEach(([status, folder]) => {
            rescueBuoyFolder.addFolder(status, status, [folder]);
        }
    );

    kmlBuilder.addFolder("Pink Rescue Buoys", "Pink Rescue Buoys", [rescueBuoyFolder]);
    kmlBuilder.addFolder("NSRI Stations", "NSRI Stations", [nsriStationFolder]);
    kmlBuilder.export(name + '.kml');
}

function process_polygon(polygon: IPolygon): string {
    // Implement the logic to process polygon and generate KML content
    // This would be specific to IPolygon
    return ` `;
}

// export function export_csv(data_export: IExport[], name: string = 'Locations'): void {
//     // Define CSV content
//     let csvContent: string = "Name,Description,Longitude,Latitude,Altitude\n";  // CSV Header
//
//     data_export.forEach(element => {
//         // if (element.type === DataType.MARKER) {
//         const marker = element as IMarker;
//         const line = `${marker.name},${marker.name || ''},${marker.lng},${marker.lat},${marker.alt || 0}`;
//         csvContent += line + "\n";
//         // }
//         // Add similar handling for IPolygon if needed
//     });
//
//     // Trigger download
//     triggerDownload(csvContent, `${name}.csv`, 'text/csv');
// }

// function triggerDownload(content: string, filename: string): void {
//     const blob: Blob = new Blob([content], {type: 'application/vnd.google-earth.kml+xml'});
//     const link: HTMLAnchorElement = document.createElement("a");
//     const url: string = URL.createObjectURL(blob);
//
//     link.href = url;
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();
//
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
// }

// Utility function outside the class for downloading the KML
export function triggerDownload(content: string, filename: string, mimeType: string): void {
    const blob: Blob = new Blob([content], {type: mimeType});
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}