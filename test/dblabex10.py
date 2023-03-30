from functools import reduce
def min(li):
    return reduce(lambda x,y:x if x<=y else y,li)
def max(li):
    return reduce(lambda x,y:x if x>=y else y,li)
print(min([32,63,7,10,100]))
print(max([32,63,7,10,100]))

