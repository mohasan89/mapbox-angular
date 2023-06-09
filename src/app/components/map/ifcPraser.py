
fRes = open('../../../assets/testRes.ifc', 'w', )
from re import findall

def fixLine(line):
    findX4 = findall(r'\\X4\\0000+[\w]+\\X0\\', str(line))

    if findX4:
        for fx in findX4:
            X4 = str(fx)
            newX = str(fx).replace('\\X4\\0000', '\X2\\')
            line = line.replace(str(X4), newX)  # print ('Fant X4')
    print(line)    


with open('../../../assets/test1.ifc', 'r', encoding='cp1252') as f:
    iter = 0
    for line in f:
        
        fRes.write(line)
        iter += 1


        if (iter == 50):
            break


fRes.close()



