import json
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon


geodict = {}
def initialize():
    global geodict
    with open('./data/melbourne.geojson') as json_file:
        data = json.load(json_file)
        for p in data['features']:
            id = p['id']
            name = p['properties']['SA2_NAME16']
            geodict[id] = {}
            geodict[id]['name'] = name
            if p['geometry']['type'] == 'Polygon':
                geodict[id]['type'] = 'polygon'
                coorlists = p['geometry']['coordinates'][0]
                polygonlist = []
                for coor in coorlists:
                    polygonlist.append((coor[0],coor[1]))
                polygon = Polygon(polygonlist)
                geodict[id]['polygon'] = polygon
            else:
                geodict[id]['type'] = 'MultiPolygon'
                geodict[id]['polygons'] = []
                for polyCoors in p['geometry']['coordinates']:
                    polygonlist = []
                    for coor in polyCoors[0]:
                        polygonlist.append((coor[0],coor[1]))
                    geodict[id]['polygons'].append(Polygon(polygonlist))


def whichSurburb(longtitude, latitude):
    point = Point(longtitude, latitude)
    for i in geodict.keys():
        if geodict[i]['type'] == 'polygon':
            if geodict[i]['polygon'].contains(point):
                return i
        else:
            for polygon in geodict[i]['polygons']:
                if polygon.contains(point):
                    return i
    return -1


def handle_raw(raw):
    longtitude = raw['geo']['coordinates'][1]
    latitude = raw['geo']['coordinates'][0]
    return whichSurburb(longtitude, latitude), longtitude, latitude
