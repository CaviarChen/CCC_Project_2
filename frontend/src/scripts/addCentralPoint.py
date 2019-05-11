import json

with open('../melbourne.geojson') as f:
    data = json.load(f)

for area in data['features']:
    if area['geometry']['type'] == 'Polygon':
        coors = area['geometry']['coordinates'][0]
        max_coors = [max(i) for i in zip(*coors)]
        min_coors = [min(i) for i in zip(*coors)]
        avg_coors = [(x + y)/2 for x, y in zip(max_coors, min_coors)]
        area['properties']['AVG_LNG'] = avg_coors[0]
        area['properties']['AVG_LAT'] = avg_coors[1]
    elif area['geometry']['type'] == 'MultiPolygon':
        final_avg_coors = []
        for subarea in area['geometry']['coordinates']:
            coors = subarea[0]
            max_coors = [max(i) for i in zip(*coors)]
            min_coors = [min(i) for i in zip(*coors)]
            avg_coors = [(x + y)/2 for x, y in zip(max_coors, min_coors)]
            final_avg_coors.append(avg_coors)
        final_avg_coors = [sum(i)/len(final_avg_coors) for i in zip(*final_avg_coors)]
        area['properties']['AVG_LNG'] = final_avg_coors[0]
        area['properties']['AVG_LAT'] = final_avg_coors[1]

with open('../melbourne_avgpoints.geojson', 'w') as outfile:  
    json.dump(data, outfile)
    
        

    