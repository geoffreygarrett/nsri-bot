import {BuoyStatus, PrismaClient} from '@prisma/client';
import fs from 'fs';
import path from 'path';
import {
    Prisma,
} from ".prisma/client";

import {invitationRLS} from "./rls";

import dotenv from 'dotenv';

dotenv.config({path: path.resolve(__dirname, '../.env.local')});

import {createClient} from "@supabase/supabase-js";
import {supabaseRPC} from "./rpc";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const prisma = new PrismaClient();


async function main() {

    // Invitation RLS
    await invitationRLS(prisma);
    await supabaseRPC(prisma);

    // Grant permissions for supabase api
    // https://supabase.com/docs/guides/integrations/prisma
    await prisma.$executeRaw(
        Prisma.sql`grant usage on schema public to postgres, anon, authenticated, service_role;`
    );
    await prisma.$executeRaw(
        Prisma.sql`grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;`
    );
    await prisma.$executeRaw(
        Prisma.sql`grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;`
    );
    await prisma.$executeRaw(
        Prisma.sql`grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;`
    );
    await prisma.$executeRaw(
        Prisma.sql`alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;`
    );
    await prisma.$executeRaw(
        Prisma.sql`alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;`
    );
    await prisma.$executeRaw(
        Prisma.sql`alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;`
    );

    await prisma.$executeRaw(Prisma.sql`
        CREATE OR REPLACE FUNCTION execute_schema_tables(_schema text, _tables text[])
        RETURNS text AS
        $$
        DECLARE
            tbl text;
            already_exists boolean;
        BEGIN
            FOR tbl IN SELECT unnest(_tables)
            LOOP
                -- Check if table is already in the publication
                SELECT EXISTS (
                    SELECT 1
                    FROM pg_publication_tables
                    WHERE tablename = tbl AND pubname = 'supabase_realtime'
                ) INTO already_exists;
        
                IF NOT already_exists THEN
                    EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
                END IF;
            END LOOP;
            RETURN 'success';
        END;
        $$ LANGUAGE 'plpgsql';
    `);

    await prisma.$executeRaw(Prisma.sql`
        SELECT execute_schema_tables('public', ARRAY['rescue_buoys', 'messages_sent', 'nsri_stations']);
    `);

    // await prisma.$executeRaw(Prisma.sql`
    //     CREATE OR REPLACE FUNCTION execute_schema_tables(_schema text, _query text)
    //     RETURNS text AS
    //     $$
    //     DECLARE
    //     row record;
    //     BEGIN
    //     FOR row IN SELECT tablename FROM pg_tables AS t
    //     WHERE t.schemaname = _schema
    //     LOOP
    //     -- run query
    //     EXECUTE format(_query, row.tablename);
    //     END LOOP;
    //     RETURN 'success';
    //     END;
    //     $$ LANGUAGE 'plpgsql';
    //     `
    // );

    // await prisma.$executeRaw(Prisma.sql`
    //     SELECT execute_schema_tables('public', 'ALTER PUBLICATION supabase_realtime ADD TABLE %I;');
    //     `
    // );


    // Create custom sequence in PostgreSQL
    // await prisma.$executeRaw(Prisma.sql`CREATE SEQUENCE rescue_buoy_seq;`);
    // await prisma.$executeRaw(Prisma.sql`CREATE EXTENSION IF NOT EXISTS postgis with schema extensions;`);

    // -- Enable the "pg_hashids" extension
    // create extension pg_hashids with schema extensions;
    // await prisma.$executeRaw(Prisma.sql`CREATE EXTENSION IF NOT EXISTS pg_hashids with schema extensions;`);

    // USER AUTH -> PUBLIC
    // await prisma.$executeRaw(Prisma.sql`
    //     -- Function: handle_user_insert
    //     CREATE OR REPLACE FUNCTION public.handle_user_insert()
    //     RETURNS TRIGGER AS $$
    //     BEGIN
    //         -- Insert new user into public.users from auth.users
    //         INSERT INTO public.users(id, phone, role, encrypted_password, raw_user_meta_data, created_at, updated_at)
    //         VALUES (NEW.id, NEW.phone, NEW.role, NEW.encrypted_password, NEW.raw_user_meta_data, NEW.created_at, NEW.updated_at);
    //         RETURN NEW;
    //     END;
    //     $$ LANGUAGE plpgsql;
    // `);


    // await prisma.$executeRaw(Prisma.sql`
    //     -- Function: handle_user_insert
    //     CREATE OR REPLACE FUNCTION public.handle_user_insert()
    //     RETURNS TRIGGER AS $$
    //     BEGIN
    //         -- Insert new user into public.users from auth.users
    //         INSERT INTO public.users(
    //             id, wa_id, name, email, password, phone, created_at, updated_at, role_id
    //         )
    //         VALUES (
    //             NEW.id, NEW.wa_id, NEW.name, NEW.email, NEW.encrypted_password, NEW.phone, NEW.created_at, NEW.updated_at, NEW.role_id
    //         );
    //         RETURN NEW;
    //     END;
    //     $$ LANGUAGE plpgsql;
    // `);

    // await prisma.$executeRaw(Prisma.sql`
    //     -- Function: handle_user_delete
    //     CREATE OR REPLACE FUNCTION public.handle_user_delete()
    //     RETURNS TRIGGER AS $$
    //     BEGIN
    //         -- Delete user from public.users when deleted from auth.users
    //         DELETE FROM public.users WHERE id = OLD.id;
    //         RETURN OLD;
    //     END;
    //     $$ LANGUAGE plpgsql;
    // `);

    // await prisma.$executeRaw(Prisma.sql`
    //     -- Function: handle_user_update
    //     CREATE OR REPLACE FUNCTION public.handle_user_update()
    //     RETURNS TRIGGER AS $$
    //     BEGIN
    //         -- Update user details in public.users when updated in auth.users
    //         UPDATE public.users
    //         SET phone = NEW.phone,
    //             role = NEW.role,
    //             encrypted_password = NEW.encrypted_password,
    //             raw_user_meta_data = NEW.raw_user_meta_data,
    //             updated_at = NEW.updated_at
    //         WHERE id = NEW.id;
    //         RETURN NEW;
    //     END;
    //     $$ LANGUAGE plpgsql;
    // `);

    // await prisma.$executeRaw(Prisma.sql`
    //     -- Function: handle_user_update
    //     CREATE OR REPLACE FUNCTION public.handle_user_update()
    //     RETURNS TRIGGER AS $$
    //     BEGIN
    //         -- Update user details in public.users when updated in auth.users
    //         UPDATE public.users
    //         SET
    //             wa_id = NEW.wa_id,
    //             name = NEW.name,
    //             email = NEW.email,
    //             password = NEW.encrypted_password,  -- assuming you're storing hashed passwords
    //             phone = NEW.phone,
    //             updated_at = NEW.updated_at,
    //             role_id = NEW.role_id
    //         WHERE id = NEW.id;
    //         RETURN NEW;
    //     END;
    //     $$ LANGUAGE plpgsql;
    // `);
    //
    // await prisma.$executeRaw(Prisma.sql`
    //     -- Trigger: trigger_user_insert
    //     CREATE TRIGGER trigger_user_insert
    //     AFTER INSERT ON auth.users
    //     FOR EACH ROW
    //     EXECUTE FUNCTION public.handle_user_insert();
    // `);

    // await prisma.$executeRaw(Prisma.sql`
    //     -- Trigger: trigger_user_delete
    //     CREATE TRIGGER trigger_user_delete
    //     AFTER DELETE ON auth.users
    //     FOR EACH ROW
    //     EXECUTE FUNCTION public.handle_user_delete();
    // `);
    //
    // await prisma.$executeRaw(Prisma.sql`
    //     -- Trigger: trigger_user_update
    //     CREATE TRIGGER trigger_user_update
    //     AFTER UPDATE ON auth.users
    //     FOR EACH ROW
    //     EXECUTE FUNCTION public.handle_user_update();
    // `);


    // Create custom function in PostgreSQL
    // await prisma.$executeRaw(Prisma.sql`
    //     CREATE OR REPLACE FUNCTION generate_rescue_buoy_id(station_id TEXT, seq_id INT)
    //     RETURNS TEXT AS $$
    //     BEGIN
    //         RETURN station_id || '-' || TO_CHAR(seq_id, 'FM0000');
    //     END;
    //     $$ LANGUAGE plpgsql IMMUTABLE;
    // `);


    // Create custom function in PostgreSQL
    // await prisma.$executeRaw(Prisma.sql`
    //     CREATE OR REPLACE FUNCTION generate_rescue_buoy_id(station_id TEXT)
    //     RETURNS TEXT AS $$
    //     DECLARE
    //         next_seq_id INT;
    //         new_pbr_id TEXT;
    //     BEGIN
    //         LOOP
    //             -- Get the next sequence value
    //             next_seq_id := NEXTVAL('rescue_buoy_seq');
    //
    //             -- Create a potential new pbr_id
    //             new_pbr_id := station_id || '-' || TO_CHAR(next_seq_id, 'FM0000');
    //
    //             -- Check if this pbr_id already exists in the table
    //             PERFORM 1 FROM rescue_buoys WHERE pbr_id = new_pbr_id;
    //             IF NOT FOUND THEN
    //                 -- If not found, we can use this new pbr_id
    //                 EXIT;
    //             END IF;
    //             -- If found, the loop will continue and try the next sequence number
    //         END LOOP;
    //
    //         RETURN new_pbr_id;
    //     END;
    //     $$ LANGUAGE plpgsql VOLATILE;
    // `);

    // Create custom trigger function in PostgreSQL
    // await prisma.$executeRaw(Prisma.sql`
    //     CREATE OR REPLACE FUNCTION generate_rescue_buoy_id_trigger()
    //     RETURNS TRIGGER AS $$
    //     BEGIN
    //         -- Only generate a new pbr_id if it hasn't been provided
    //         IF NEW.pbr_id IS NULL OR NEW.pbr_id = '' THEN
    //             NEW.pbr_id := generate_rescue_buoy_id(NEW.station_id);
    //         END IF;
    //         RETURN NEW;
    //     END;
    //     $$ LANGUAGE plpgsql;
    // `);

    // Assuming 'rescue_buoys' table is already created by Prisma migration
    // Attach the trigger to the 'rescue_buoys' table
    // await prisma.$executeRaw(Prisma.sql`
    //     CREATE TRIGGER set_pbr_id
    //     BEFORE INSERT ON rescue_buoys
    //     FOR EACH ROW
    //     EXECUTE FUNCTION generate_rescue_buoy_id_trigger();
    // `);

    // // Trigger for lat lon alt point gis etc
    // await prisma.$executeRaw(Prisma.sql`
    //     CREATE OR REPLACE FUNCTION update_rescue_buoy_location()
    //     RETURNS TRIGGER AS $$
    //     BEGIN
    //     NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
    //         RETURN NEW;
    //     END;
    //     $$ LANGUAGE plpgsql;
    // `);

    // await prisma.$executeRaw(Prisma.sql`
    //     CREATE TRIGGER trigger_update_rescue_buoy_location
    //     BEFORE INSERT OR UPDATE ON rescue_buoys
    //     FOR EACH ROW
    //     EXECUTE FUNCTION update_rescue_buoy_location();
    // `);


    // await prisma.$executeRaw(
    //     Prisma.sql`
    //     --
    //     CREATE OR REPLACE FUNCTION generate_signup_link_code()
    //     RETURNS TRIGGER AS $$
    //     BEGIN
    //     NEW.code := extensions.id_encode(NEW.id);
    //     RETURN NEW;
    //     END;
    //     $$ LANGUAGE plpgsql;
    //   `
    // );
    //
    // await prisma.$executeRaw(
    //     Prisma.sql`
    //     CREATE TRIGGER set_signup_link_code
    //     BEFORE INSERT OR UPDATE ON signup_links
    //     FOR EACH ROW
    //     EXECUTE FUNCTION generate_signup_link_code();
    // `
    // );


    // await prisma.$executeRaw(
    //     Prisma.sql`
    //     -- Create a policy for INSERT operation on the storage.buckets table
    //     CREATE POLICY insert_buckets_policy ON storage.buckets
    //     FOR INSERT
    //     TO authenticated -- Replace with the role that needs the insert permission
    //     WITH CHECK (true); -- Define the condition under which insert is allowed
    //     `
    // );
    //
    // await prisma.$executeRaw(
    //     Prisma.sql`
    //     -- Create a policy for UPDATE operation on the storage.buckets table
    //     CREATE POLICY update_buckets_policy ON storage.buckets
    //     FOR UPDATE
    //     TO authenticated -- Replace with the role that needs the update permission
    //     USING (true); -- Define the condition under which update is allowed
    //
    //     `
    // );
    //
    // await prisma.$executeRaw(
    //     Prisma.sql`
    //     -- Create a policy for SELECT operation on the storage.buckets table
    //     CREATE POLICY select_buckets_policy ON storage.buckets
    //     FOR SELECT
    //     TO authenticated -- Replace with the role that needs the select permission
    //     USING (true); -- Define the condition under which select is allowed
    //     `
    // );
    //
    // await prisma.$executeRaw(
    //     Prisma.sql`
    //     -- Create a policy for INSERT operation on the storage.objects table
    //     CREATE POLICY insert_objects_policy ON storage.objects
    //     FOR INSERT
    //     TO authenticated -- Replace with the role that needs the insert permission
    //     WITH CHECK (true); -- Define the condition under which insert is allowed
    //     `
    // );


    // add station 42
    let stations: { [key: string]: any } = {};
    const stations_data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'nsri_stations.json'), 'utf-8'));
    // for (const station of stations_data) {
    //     stations[station.station_number] = await prisma.nsri_stations.create({
    //         data: {
    //             id: Number(station.station_number),
    //             name: station.name,
    //
    //             created_at: new Date(),
    //             updated_at: new Date(),
    //             deleted_at: null,
    //
    //             emergency_number: station.emergency_number,
    //             lat: Number(station.lat),
    //             lng: Number(station.lng),
    //         }
    //     });
    // }

    // Coordinates for station 42 service area
    const station42Jurisdiction = [
        [18.79656642400815, -34.39480200151706],
        [18.81642630166825, -34.40877449773474],
        [18.84573693622454, -34.40936806308122],
        [18.88529609137226, -34.39386587320487],
        [18.92577591230862, -34.38498756239312],
        [18.97301485382371, -34.38569731963585],
        [19.02927742302949, -34.36750736514759],
        [19.07446278014822, -34.38073897708012],
        [19.09016917996846, -34.4098876110189],
        [19.10890518021321, -34.43255840429045],
        [19.1932128437798, -34.3752410226947],
        [19.16521185903071, -34.31435299198679],
        [18.83431130300026, -34.2415446534828],
        [18.8200190674088, -34.26461720487358],
        [18.79689302421487, -34.28573844176196],
        [18.79203295974738, -34.29890608570066],
        [18.80084682153768, -34.33292218470125],
        [18.79540951877116, -34.34107711659945],
        [18.79532118981166, -34.3705648411671],
        [18.79656642400815, -34.39480200151706] // Closing the loop
    ];

    // Convert the coordinates to a LINESTRING text representation
    const lineString = station42Jurisdiction.map(coord => coord.join(' ')).join(', ');
    const polygonText = `ST_GeomFromText('POLYGON((${lineString}))', 4326)`;
    const escapeSqlString = (value: string) => value.replace(/'/g, "''");

    // Update the query to include the service_area
    const stationQueries = stations_data.map((station: any) => {
        const id = Number(station.station_number);
        const name = escapeSqlString(station.name);
        const emergencyNumber = escapeSqlString(station.emergency_number || '');
        const location = station.lat !== undefined && station.lng !== undefined
            ? `ST_MakePoint(${station.lng}, ${station.lat}, 0)`
            : 'NULL';

        // Include service_area for station 42
        const serviceArea = Number(station.station_number) === 42 ? polygonText : 'NULL';

        return `(${id}, '${name}', '${emergencyNumber}', ${location}, ${serviceArea}, NOW(), NOW(), NULL)`;
    }).join(',\n    ');

    // const stationQueries = stations_data.map((station: any) => {
    //     const id = Number(station.station_number); // Assuming id is a number
    //     const name = escapeSqlString(station.name); // Assuming name is a string
    //     const emergencyNumber = escapeSqlString(station.emergency_number || ''); // Assuming emergency_number is a string
    //
    //     // Assuming you have altitude data as buoy.alt
    //     const altitude =  '0'; // Default to 0 if undefined
    //
    //     // Using ST_MakePoint to create a PointZ geometry
    //     const location = station.lat !== undefined && station.lng !== undefined
    //         ? `ST_MakePoint(${station.lng}, ${station.lat}, ${altitude})`
    //         : 'NULL';
    //
    //     // Format each station data as a tuple
    //     return `(${id}, '${name}', '${emergencyNumber}', ${location}, NOW(), NOW(), NULL)`;
    // }).join(',\n    ');

    const query = `INSERT INTO public.nsri_stations (id, name, emergency_number, location, service_area, created_at, updated_at, deleted_at)\nVALUES\n    ${stationQueries};`;
    console.log(query);
    await prisma.$executeRawUnsafe(query); // Using $executeRawUnsafe for raw string queries


    // Execute the INSERT queries
    // await prisma.$executeRaw(Prisma.sql(stationQueries.join('\n')));

    // for (const query of stationQueries) {
    //     await prisma.$executeRaw(Prisma.sql(query));
    // }


    const role_super_admin = await prisma.roles.create({
        data: {
            name: "super-admin",
            level: 0,
        }
    });

    const role_station_admin = await prisma.roles.create({
        data: {
            name: "station-admin",
            level: 1,
        }
    });

    const role_user = await prisma.roles.create({
        data: {
            name: "station-user",
            level: 2,
        }
    });

    // const role_public_user = await prisma.roles.create({
    //     data: {
    //         name: "public-user",
    //         level: 3,
    //     }
    // });

    const super_admin_response = await supabase.auth.signUp({
        phone: "+31646275883",
        password: process.env.MY_PASSWORD || "password",
        options: {
            data: {
                name: "Geoffrey",
                role: "super-admin",
            }
        }
    });

    const user_id = "4c36a414-379a-4a77-adca-374daa57676f";

    const geoffrey = await prisma.users.create({
        data: {
            id: user_id,
            first_name: "Geoffrey",
            last_name: "Garrett",
            phone: "+31646275883",
        }
    });

    const roleships = await prisma.roleships.createMany({
        data: [
            {
                user_id: user_id,
                role_id: role_super_admin.id,
            },
            {
                user_id: user_id,
                role_id: role_station_admin.id,
                station_id: 42,
            },
            {
                user_id: user_id,
                role_id: role_user.id,
                station_id: 42,
            }
        ]
    });


    // const rescue_buoys_data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'prb_station_42.json'), 'utf-8'));
    // await prisma.rescue_buoys.createMany(
    //     {
    //         data: rescue_buoys_data.map((buoy: any) => {
    //             return {
    //                 name: buoy.name,
    //                 station_id: 42,
    //                 buoy_id: Number(buoy.id.split("-")[1]),
    //                 lat: Number(buoy.lat),
    //                 lng: Number(buoy.lng),
    //                 alt: Number(buoy.alt),
    //                 old_id: buoy.old_id,
    //                 status: buoy.status === "MAINTENANCE" ? "ATTENTION" : buoy.status,
    //                 metadata: {
    //                     raw_name: buoy.raw_name,
    //                 }
    //             }
    //         })
    //     }
    // );

    // Read and parse the JSON file
    const rescueBuoysData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'prb_station_42.json'), 'utf-8'));
    //
    // Construct INSERT queries for rescue buoys
    const rescueBuoysQueries = rescueBuoysData.map((buoy: any) => {
        const name = escapeSqlString(buoy.name);
        const stationId = 42; // Assuming station_id is always 42
        const buoyId = Number(buoy.id.split("-")[1]);
        // const lat = Number(buoy.lat);
        // const lng = Number(buoy.lng);
        // const alt = Number(buoy.alt);
        // Assuming you have altitude data as buoy.alt
        const altitude = buoy.alt !== undefined ? buoy.alt : '0'; // Default to 0 if undefined

        // Using ST_MakePoint to create a PointZ geometry
        const location = buoy.lat !== undefined && buoy.lng !== undefined
            ? `ST_MakePoint(${buoy.lng}, ${buoy.lat}, ${altitude})`
            : 'NULL';

        const oldId = String(buoy.old_id); // Assuming old_id is a number
        const status = buoy.status === "MAINTENANCE" ? "ATTENTION" : buoy.status;
        const metadata = JSON.stringify({raw_name: buoy.raw_name});

        return `(${buoyId}, '${name}', ${stationId}, ${location}, '${oldId ?? ''}', '${status}', '${metadata}')`;
    }).join(',\n    ');

    const rescueBuoysQuery = `INSERT INTO public.rescue_buoys (buoy_id, name, station_id, location, old_id, status, metadata)\nVALUES\n    ${rescueBuoysQueries};`;
    console.log(rescueBuoysQuery); // You can log or execute this query
    await prisma.$executeRawUnsafe(rescueBuoysQuery); // Using $executeRawUnsafe for raw string queries

    // for (const buoy of rescue_buoys_data) {
    //     const status = buoy.status === "MAINTENANCE" ? "ATTENTION" : buoy.status;
    //     await prisma.rescue_buoys.create({
    //         data: {
    //             // id: buoy.id,
    //             name: buoy.name,
    //             station_id: stations[42].id,
    //             buoy_id: Number(buoy.id.split("-")[1]),
    //             lat: Number(buoy.lat),
    //             lng: Number(buoy.lng),
    //             alt: Number(buoy.alt),
    //             old_id: buoy.old_id,
    //             status: status,
    //             // formatted_address: buoy.formatted_address,
    //             // town: buoy.town,
    //             // town_code: buoy.town_code
    //         }
    //     });
    // }

    // {
    //     "name": "- AL-02",
    //     "station": null,
    //     "location": null,
    //     "number": null,
    //     "raw_name": "- AL-02",
    //     "lat": "-26.726379",
    //     "lng": "32.900897"
    // },

    // const site_prb_data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'nsri_prb.json'), 'utf-8'));
    // await prisma.rescue_buoys.createMany(
    //     {
    //         data: site_prb_data.map((buoy: any) => {
    //             return {
    //                 name: buoy.name,
    //                 station_id: buoy.station ? (stations.hasOwnProperty(buoy.station) ? buoy.station : null) : null,
    //                 buoy_id: buoy.number ? Number(buoy.number) : null,
    //                 lat: buoy.lat,
    //                 lng: buoy.lng,
    //                 status: BuoyStatus.UNKNOWN,
    //                 metadata: {
    //                     raw_name: buoy.raw_name,
    //                     location: buoy.location,
    //                 }
    //             }
    //         })
    //     }
    // );

    // Read and parse the JSON file
    const sitePrbData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'nsri_prb.json'), 'utf-8'));
    //
    // // Construct INSERT queries for rescue buoys
    // const siteRescueBuoys = sitePrbData.map((buoy: any) => {
    //     const name = buoy.name ? `'${escapeSqlString(buoy.name)}'` : 'NULL';
    //     const stationId = buoy.station && stations.hasOwnProperty(buoy.station) ? buoy.station : 'NULL';
    //
    //     // Check if buoy.number is a valid number; if not, default to 'NULL'
    //     const buoyId = !isNaN(parseFloat(buoy.number)) && isFinite(buoy.number) ? Number(buoy.number) : 'NULL';
    //
    //     const lat = buoy.lat !== undefined ? buoy.lat : 'NULL';
    //     const lng = buoy.lng !== undefined ? buoy.lng : 'NULL';
    //     const status = `'${BuoyStatus.UNKNOWN}'`;
    //     const metadata = buoy.raw_name || buoy.location ? `'${JSON.stringify({ raw_name: buoy.raw_name, location: buoy.location }).replace(/'/g, "''")}'` : 'NULL';
    //
    //     return `(${buoyId}, ${name}, ${stationId}, ${lat}, ${lng}, ${status}, ${metadata})`;
    // }).join(',\n    ');
    //
    // const siteRescueBuoysQuery = `INSERT INTO public.rescue_buoys (buoy_id, name, station_id, lat, lng, status, metadata)\nVALUES\n    ${siteRescueBuoys};`;
    // console.log(siteRescueBuoysQuery); // You can log or execute this query
    // await prisma.$executeRawUnsafe(siteRescueBuoysQuery); // Using $executeRawUnsafe for raw string queries
    const siteRescueBuoys = sitePrbData.map((buoy: any) => {
        const name = buoy.name ? `'${escapeSqlString(buoy.name)}'` : 'NULL';
        const stationId = buoy.station && stations.hasOwnProperty(buoy.station) ? buoy.station : 'NULL';
        const buoyId = !isNaN(parseFloat(buoy.number)) && isFinite(buoy.number) ? Number(buoy.number) : 'NULL';

        // Assuming you have altitude data as buoy.alt
        const altitude = buoy.alt !== undefined ? buoy.alt : '0'; // Default to 0 if undefined

        // Using ST_MakePoint to create a PointZ geometry
        const location = buoy.lat !== undefined && buoy.lng !== undefined
            ? `ST_MakePoint(${buoy.lng}, ${buoy.lat}, ${altitude})`
            : 'NULL';

        const status = `'${BuoyStatus.UNKNOWN}'`;
        const metadata = buoy.raw_name || buoy.location ? `'${JSON.stringify({
            raw_name: buoy.raw_name,
            location: buoy.location
        }).replace(/'/g, "''")}'` : 'NULL';

        return `(${buoyId}, ${name}, ${stationId}, ${location}, ${status}, ${metadata})`;
    }).join(',\n    ');

    const siteRescueBuoysQuery = `INSERT INTO public.rescue_buoys (buoy_id, name, station_id, location, status, metadata)\nVALUES\n    ${siteRescueBuoys};`;
    console.log(siteRescueBuoysQuery); // You can log or execute this query
    await prisma.$executeRawUnsafe(siteRescueBuoysQuery); // Using $executeRawUnsafe for raw string queries


}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
