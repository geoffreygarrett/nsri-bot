import re
import json

# Load data from 'base_info.txt'
with open('base_info.txt', 'r') as file:
    data = file.read()
    print(data)

# Extracting the content part
pattern = r'<h3>(.*)<\\\/h3>.*\s<\\\/strong>([\d]*)<\\\/p>.*tel:([\d\s]*)\\\".*Coordinates:\s<\\\/strong>([-\d\.\,\s]*)<\\\/p>.*'
matches = re.findall(pattern, data, re.MULTILINE)

# Parsing the extracted data into a structured format
parsed_data = []
for match in matches:
    name, station_number, emergency_number, coordinates = match

    if station_number=='42':
        lat, lng = "-34.34369986368882", "19.01492343540651"

    else:
        lat, lng = coordinates.split(',')

    parsed_data.append({
        'name': name,
        'station_number': station_number,
        'emergency_number': emergency_number.strip().replace(' ', ''),
        'lat': lat.strip(),
        'lng': lng.strip()
    })

# Saving the parsed data to a JSON file
with open('nsri_stations.json', 'w') as file:

    # Pretty-print the data
    json.dump(parsed_data, file, indent=4)