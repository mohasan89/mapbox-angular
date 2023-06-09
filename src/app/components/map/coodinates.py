from pyproj import * 

source_crs = CRS.from_string('''PROJCS["63_C3",GEOGCS["GCS_Pulkovo_1942",DATUM["D_Pulkovo_1942",SPHEROID["Krasovsky_1940",6378245.0,298.3]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Gauss_Kruger"],PARAMETER["False_Easting",3250000.0],PARAMETER["False_Northing",-11057.63],PARAMETER["Central_Meridian",30.95],PARAMETER["Scale_Factor",1.0],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]''')
target_crs = CRS.from_epsg(4326)  

transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)

x = 3315834.0
y = 7628394.0
# x = 5000000
# y = 0 
# # lon, lat = transformer.transform(x, y)

# print(f'Longitude: {lon}')
# print(f'Latitude: {lat}')

matrix = transformer._transformer

print('{}', matrix)