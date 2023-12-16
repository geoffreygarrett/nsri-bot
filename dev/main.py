from pykml import parser
from pykml.factory import KML_ElementMaker as KML
from lxml import etree
import os
import copy
import logging
import glob

logging.basicConfig(level=logging.INFO)


def create_new_kml_root():
    new_kml_root = KML.kml()
    new_document = KML.Document(
        KML.name("NSRI Lifebuoys")
    )
    new_kml_root.append(new_document)
    return new_kml_root, new_document


def load_kml_document(file_path):
    with open(file_path, 'r') as f:
        root = parser.parse(f).getroot()
    return root.Document


# Standard styles dict to maintain consistency
standard_styles = {
    "__managed_style_44BE954C0C2C98161F2F": {
        "IconStyle": {
            "scale": "1.2",
            "Icon": {
                "href": "https://earth.google.com/earth/rpc/cc/icon?color=f142e5&amp;id=2000&amp;scale=4"
            }
        },
        "LabelStyle": {
            "color": "ff58eeff"
        }
    }
    # Add more standard styles here
}


def apply_standard_styles(element):
    style_id = element.get("id")
    if style_id and style_id in standard_styles:
        standard_style = standard_styles[style_id]
        for style_type, style_value in standard_style.items():
            elem = element.find(".//{0}".format(style_type))
            if elem is not None:
                for k, v in style_value.items():
                    sub_elem = elem.find(".//{0}".format(k))
                    if sub_elem is not None:
                        sub_elem.text = v


import hashlib

# Store a mapping between original style IDs and standardized IDs
id_mapping = {}

# Store coalesced styles
coalesced_styles = {}


def coalesce_style(element, new_document):
    if not etree.tostring(element, method="text").strip():
        logging.warning(f"Empty style detected: {element.get('kml:id') or element.get('id')}")
        return  # Skip adding to new_document

    style_data = etree.tostring(element, pretty_print=True)
    style_hash = hashlib.md5(style_data).hexdigest()

    if style_hash in coalesced_styles:
        standardized_id = coalesced_styles[style_hash]
    else:
        standardized_id = style_hash
        coalesced_styles[style_hash] = standardized_id
        # Add to new document
        new_document.append(element)

    original_id = element.get("kml:id") or element.get("id")
    if original_id:
        id_mapping[original_id] = standardized_id


def combine_documents_into_folder(file_path, new_document):
    document = load_kml_document(file_path)
    folder_name = document.name.text if hasattr(document, 'name') else "Unnamed"

    new_folder = KML.Folder(
        KML.name(folder_name)
    )

    for elem in document.iterchildren():
        if elem.tag.endswith('name'):
            continue
        if elem.tag.endswith('Style') or elem.tag.endswith('CascadingStyle'):
            coalesce_style(elem, new_document)
            continue

        # Deep copy the element to avoid modifying the original tree
        new_elem = copy.deepcopy(elem)
        new_folder.append(new_elem)

    new_document.append(new_folder)


import re


def replace_ids_in_kml(root):
    xml_string = etree.tostring(root, pretty_print=True).decode("utf-8")
    replaced_ids = set()
    for original_id, standardized_id in id_mapping.items():
        xml_string, num_replaced = re.subn(f"#{re.escape(original_id)}", f"#{standardized_id}", xml_string)
        if num_replaced > 0:
            replaced_ids.add(original_id)

    for original_id in id_mapping.keys():
        if original_id not in replaced_ids:
            logging.warning(f"Unused ID: {original_id}")

    return etree.fromstring(xml_string.encode("utf-8"))


def process_files_in_directory(directory_path, new_document):
    for file_path in glob.glob(os.path.join(directory_path, '*.kml')):
        logging.info(f"Processing {file_path}")
        combine_documents_into_folder(file_path, new_document)


def save_combined_kml_file(new_kml_root, output_path):
    with open(output_path, 'wb') as f:
        f.write(etree.tostring(new_kml_root, pretty_print=True))

import datetime

def main():
    new_kml_root, new_document = create_new_kml_root()
    data_path = './data'
    process_files_in_directory(data_path, new_document)
    final_kml_root = replace_ids_in_kml(new_kml_root)
    date_today = datetime.datetime.today().strftime('%Y-%m-%d')
    save_combined_kml_file(final_kml_root, f'./NSRI_Lifebuoys_{date_today}.kml')


if __name__ == "__main__":
    main()
