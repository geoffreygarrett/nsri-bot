import re
import json

# Load data from 'base_info.txt'
with open('prb_site.txt', 'r') as file:
    data = file.read()
    data.replace("&#039;", "'")
#     print(data)

# Extracting the content part
pattern = r'<h3>(.*?)<\\/h3>.*<strong>Coordinates: <\\/strong>([-\d\s\.\,]*)'
matches = re.findall(pattern, data, re.MULTILINE)

name_regex = r"^(\d{2})?\s+([A-Za-z'\ ]+)\s+\-?\s*([\d\w]{2,3}-?[\d\w ]{2,}?)?(- [\w\s]+)?$"

# Parsing the extracted data into a structured format
parsed_data = []
for match in matches:
    name, coordinates = match
    lat, lng = coordinates.split(',')

    name = name.replace("&#039;", "'")

    # match name with regex
    name_match = re.match(name_regex, name)
    if name_match:
        print(name_match.groups())
    else:
        print("No match")

    parsed_data.append({
        'name':  name_match.group(4) if name_match is not None and name_match.group(4) is not None else name,
        'station': int(name_match.group(1)) if name_match is not None and name_match.group(1) is not None else None,
        'location': name_match.group(2) if name_match is not None and name_match.group(2) is not None else None,
        'number': name_match.group(3) if name_match is not None and name_match.group(3) is not None else None,
        'raw_name': name,
        'lat': float(lat.strip()),
        'lng': float(lng.strip())
    })

# print all names
# for station in parsed_data:
#     print(station['name'], station['lat'], station['lng'])
#     print(station['name'])

# save all names to a file
# with open('prb_names.txt', 'w') as file:
#     for station in parsed_data:
#         file.write(station['name'] + '\n')

# Saving the parsed data to a JSON file
with open('nsri_prb.json', 'w') as file:
    json.dump(parsed_data, file, indent=4)