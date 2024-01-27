file_name =  "./buoy_rescues.xlsx"
sheet =  "Rescue Details "
from dateutil.parser import parse
from datetime import datetime
import dateutil
import pandas as pd
df = pd.read_excel(io=file_name, sheet_name=sheet, header=2, index_col=0, engine='openpyxl')

# Function to try multiple date formats
def try_parsing_date(text):
    try:
        if text == "March":
            return "2018-03-01"
        else:
            res = parse(text, dayfirst=True, yearfirst=False, fuzzy=True, default=datetime(1900, 1, 1))
            return res.strftime('%Y-%m-%d')
    except:
        return text

# ATTEMPT TO CONVERT THIRD COL TO DATE, EXAMPLE 28.12.17
df['Date'] = df['Date'].apply(lambda x: str(x).replace('.', '-'))
df['Date'] = df['Date'].apply(lambda x: str(x).replace('.', '-'))
df['Date'] = df['Date'].apply(lambda x: str(x).replace(',', '-'))
df['Date'] = df['Date'].apply(try_parsing_date)
df['Date'] = df['Date'].apply(lambda x: pd.to_datetime(x, format='%Y-%m-%d', errors='coerce'))

# new_df = pandas.DataFrame(columns


# print(df['Date'].values)

# NUMBER ASSISTED
df['Number of people assisted'] = df['Number of people assisted'].apply(lambda x: int(x) if x == x else None)

# sent print limits
pd.set_option('display.max_columns', 10)
pd.set_option('display.max_rows', 10)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', None)
pd.set_option('display.expand_frame_repr', False)
pd.set_option('display.precision', 2)

print(df.columns)  # print column names
# print(df.head(5))  # print first 5 rows of the dataframe

buoy_rescue = []
rescuer_details = []
rescued_details = []

count = 1

from uuid import uuid4

for index, row in df.iterrows():

    _rescuer_details = {
        "id": uuid4(),
#         "name": row['Name'],
#         "age": row['Age'],
#         "experience": row['Experience'],
        "capacity": row['Capacity'],
#         "used_buoy": row['Used buoy'],
        "buoy_rescue_id": count
    }

    _rescued_details = {
        "id": uuid4(),
    }

    _buoy_rescue = {
        "id": count,
        "datetime": row['Date'],
        "people_assisted": row['Number of people assisted'],
        "pink_buoy_not_used_people": row['# of  Persons in trouble -  Pink buoy deployed but not used '],
        "max_persons_floated": row['Max number of persons floated'],
        "prb_location_number": row['PRB location number'],
        "place": row['Place'],
        "city": row['City'],
        "sponsor": row['Sponsor'],
        "rescue": row['Rescue '],
        "additional_info": row['Additional '],
        "link": row['Link ']
    }

    print(row['Date'], row['Number of people assisted'])


    count +=1


# export as json
df.to_json(r'./buoy_rescues.json', orient='records', date_format='iso')

#   id                        Int              @id @default(autoincrement())
#   reference_no              String?
#   datetime                  DateTime?
#   people_assisted           Int?
#   pink_buoy_not_used_people Int?
#   max_persons_floated       Int?
#   prb_location_number       String?
#   place                     String?
#   city                      String?
#   sponsor                   String?
#   rescue                    String?
#   drowning_cause_id         Int?
#   drowning_cause            drowning_cause?  @relation(fields: [drowning_cause_id], references: [id])
#   additional_info           String?
#   link                      String?
#   rescuer_details           rescuer_detail[]
#   rescued_details           rescued_detail[]
#   rescue_buoy_id            String           @db.Uuid
#   rescue_buoy               rescue_buoys     @relation(fields: [rescue_buoy_id], references: [id])
#
#   rescue_buoys_log    rescue_buoys_logs? @relation(fields: [rescue_buoys_log_id], references: [id])
#   rescue_buoys_log_id String?            @db.Uuid
#
#   @@schema("public")


# enum Ethnicity {
#   COLOURED // Person of Colour, POC?
#   WHITE
#   BLACK
#   INDIAN
#   CHINESE
#   FOREIGN
#   UNKNOWN
#
#   @@map("ethnicity")
#   @@schema("public")
# }
#
# enum Gender {
#   MALE
#   FEMALE
#   UNKNOWN
#
#   @@map("gender")
#   @@schema("public")
# }
#
# enum AgeGroup {
#   ADULT
#   CHILD
#   UNKNOWN
#
#   @@map("age_group")
#   @@schema("public")
# }
#
# model buoy_rescue {

# }
#
# model rescuer_detail {
#   id             Int          @id @default(autoincrement())
#   name           String?
#   age            String?
#   experience     String?
#   capacity       String?
#   used_buoy      Boolean?
#   buoy_rescue    buoy_rescue? @relation(fields: [buoy_rescue_id], references: [id])
#   buoy_rescue_id Int?
#
#   @@schema("public")
# }
#
# model rescued_detail {
#   id             Int          @id @default(autoincrement())
#   ethnicity      Ethnicity?
#   gender         Gender?
#   age_group      AgeGroup?
#   age            String?
#   used_buoy      Boolean?
#   buoy_rescue    buoy_rescue? @relation(fields: [buoy_rescue_id], references: [id])
#   buoy_rescue_id Int?
#
#   @@schema("public")
# }
