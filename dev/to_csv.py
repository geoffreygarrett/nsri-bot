# Specify the CSV file name
csv_file_name = 'pink_buoy.csv'
json_file_name = 'placemarks.json'
import json
import csv

# Open json
with open(json_file_name, encoding='utf-8') as json_file:
    json_data = json.load(json_file)

    # drop address_components
    for item in json_data:
        item.pop('address_components', None)


# Open the CSV file for writing
with open(csv_file_name, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)

    # Write the header based on the keys of the first JSON object
    writer.writerow(json_data[0].keys())

    # Write the data
    for item in json_data:
        writer.writerow(item.values())

print(f"CSV file '{csv_file_name}' created successfully.")