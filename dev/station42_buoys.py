import xml.etree.ElementTree as ET
import json
import re
import os
import googlemaps

# load dotenv from ../.env
from dotenv import load_dotenv
import os
load_dotenv("../.env.local")


def extract_placemarks_to_json(kml_file, json_file, cache_file='geocode_cache.json'):
    # Initialize Google Maps client
    gmaps = googlemaps.Client(key=os.environ.get("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"))

    # Load or initialize geocoding cache
    try:
        with open(cache_file, 'r') as file:
            geocode_cache = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        geocode_cache = {}

    # Parse the KML file
    tree = ET.parse(kml_file)
    root = tree.getroot()
    namespaces = {'kml': 'http://www.opengis.net/kml/2.2'}

    # Find all Placemark elements
    placemarks = root.findall('.//kml:Placemark', namespaces)
    data = []

    for placemark in placemarks:
        name = placemark.find('kml:name', namespaces).text
        coordinates = placemark.find('.//kml:coordinates', namespaces).text.strip()

        # Regular expressions to extract and clean the data
        id_match = re.search(r'\d{2,3}\s?\-\s?[\d\?]{2,3}', name)
        id = id_match.group(0) if id_match else None
        name = re.sub(r'\d{2,3}\s?\-\s?[\d\?]{2,3}', '', name).strip()
        status = "OK"
        if re.search(r'missing', name, re.IGNORECASE):
            status = "MISSING"
        if re.search(r'reposition', name, re.IGNORECASE) and status != "MISSING":
            status = "MAINTENANCE"
        if re.search(r'propose', name, re.IGNORECASE) and status == "OK":
            status = "PROPOSED"

        lng, lat, alt = coordinates.split(',')

        # Check cache or perform reverse geocoding
        coord_key = f"{lat},{lng}"
        if coord_key in geocode_cache:
            reverse_geocode_result = geocode_cache[coord_key]
            formatted_address = reverse_geocode_result[0]['formatted_address'] if reverse_geocode_result else "Address not found"
        else:
            reverse_geocode_result = gmaps.reverse_geocode((lat, lng))
            geocode_cache[coord_key] = reverse_geocode_result
            formatted_address = reverse_geocode_result[0]['formatted_address'] if reverse_geocode_result else "Address not found"

        # Remove , South Africa from the address
        formatted_address = formatted_address.replace(', South Africa', '')

        # If there's a ,, in the address, remove it and replace with a ,
        if ',,' in formatted_address:
            formatted_address = formatted_address.replace(',,', ',')

        # get town from addres componenets, iterate through and find type that is 'locality'
        for address_component in reverse_geocode_result[0]['address_components']:
            if 'sublocality' in address_component['types']:
                town = address_component['long_name']
                break

        # Append data to the list
        data.append({
            'name': name,
            'lat': lat,
            'lng': lng,
            'alt': alt,
            'id': id.replace(' ', '') if id else None,
            'old_id': id.replace(' ', '') if id else None,
            'status': status,
            'formatted_address': formatted_address,
#             'address_components': [x.strip() for x in formatted_address.split(',')],
            'town': town,
        })

    # iterate through the data, we need to modify the ids
    ids = []
    for item in data:
        ids.append(item['id'] if item['id'] else None)

#     # all id's of format XX-XX must become XXXX.
#     for item in data:
#         if item['id'] is not None and "-" in item['id']:
#             item['id'] = item['id'].replace("-", "")

    # update data dict again
    for idx, item in enumerate(data):
        if item['id'] is None:
            item['id'] = ids[idx]

    town_list = []
    for item in data:
        town_list.append(item['town'])

    town_codes = []
    for item in town_list:
        letter1 = item[0]
        letter2 = item[1]
#         if " " in item:
#             letter3 = item.split(" ")[1][0]
#         else:
        letter3 = item[2]
        letter4 = item[3]
        town_code = letter1 + letter2 + letter3 + letter4
        town_codes.append(town_code.upper())

    for idx, item in enumerate(data):
        item['town_code'] = town_codes[idx]

    # we need to generate id's where they are missing. some Ids are XX??, so a two numbers mut be assigned to the ??
    # in some cases, it is None, there we need to draw numbers starting from 1, PER TOWN code
    # first, we need to get a list of town codes
    town_codes = []
    for item in data:
        town_codes.append(item['town_code'])

    # now we need to get a list of unique town codes
    unique_town_codes = set(town_codes)
    unique_town_codes = list(unique_town_codes)

    # Initialize a dictionary to track the last used ID for each town
    town_counters = {}

    # Available numbers
    available = set(range(1, 10000))  # Up to 9999

    # Check taken numbers and remove them from the available set
    for id_str in ids:
        if id_str and '-' in id_str and '??' not in id_str:
            prefix, num_str = id_str.split('-')
            if num_str.isdigit():
                if prefix == '42':
                    num = int(num_str)
                    available.discard(num)

    # Iterate through the data to assign or update IDs
    for item in data:
        # If the ID is None, assign a new one
        prefix = item['id'].split("-")[0] if item['id'] is not None else '42'
        number = item['id'].split("-")[1] if item['id'] is not None else None
        if number is not None:
            number = None if "?" in number and not None else number
        number = int(number) if number is not None else None
        if prefix == '42' and number is None:
            # Assign the next available number for '42' prefix
            number = min(available)
            available.remove(number)

        # Assign and format the new ID
        item['id'] = f"{prefix}-{number:04d}"  # Pad the ID to 4 digits

    # Write the data to the JSON file
    with open(json_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)


# Example usage
extract_placemarks_to_json('NSRI_Lifebuoys_2023-10-25.kml', 'placemarks.json')
