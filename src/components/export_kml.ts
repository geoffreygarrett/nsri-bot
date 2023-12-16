import {IMarker, IExport, IPolygon, DataType} from "@/components/types";

const XML_ENCODING = 'utf-8';
const XML_VERSION = '1.0';

function escape_xml(str: string): string {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export default function export_kml(data_export: IExport[], name: string = 'Locations'): void {
    let kml_content: string = `<?xml version="${XML_VERSION}" encoding="${XML_ENCODING}"?>`;
    kml_content += `
    <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
            <name>${escape_xml(name)}</name>
            <description>Exported Locations</description>
            <Style id="custom_pink_pin">
                <IconStyle>
                    <Icon>
                        <href>http://maps.google.com/mapfiles/kml/paddle/pink-blank.png</href>
                    </Icon>
                </IconStyle>
            </Style>`;

    data_export.forEach(element => {
        if (element.type === DataType.MARKER) {
            kml_content += process_marker(element as IMarker);
        } else if (element.type === DataType.POLYGON) {
            kml_content += process_polygon(element as IPolygon);
        }
    });

    kml_content += `
        </Document>
    </kml>`;

    trigger_download(kml_content, "locations.kml");
}

function process_marker(marker: IMarker): string {
    return `
    <Placemark>
        <name>${escape_xml(marker.name)}</name>
        <description>${escape_xml(marker.description || '')}</description>
        <styleUrl>#custom_pink_pin</styleUrl>
        <Point>
            <coordinates>${marker.lng},${marker.lat},${marker.alt || 0}</coordinates>
        </Point>
    </Placemark>`;
}

function process_polygon(polygon: IPolygon): string {
    // Implement the logic to process polygon and generate KML content
    // This would be specific to IPolygon
    return ` `;
}

function trigger_download(content: string, filename: string): void {
    const blob: Blob = new Blob([content], {type: 'application/vnd.google-earth.kml+xml'});
    const link: HTMLAnchorElement = document.createElement("a");
    const url: string = URL.createObjectURL(blob);

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
