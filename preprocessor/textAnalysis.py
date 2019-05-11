import re
word_lst = []
reg_pairs = []


def initialize():
    global word_lst
    global reg_pairs
    fp = open("./data/foodWord.txt", 'r')
    word = fp.readline()
    while word:
        word = word.rstrip('\n')
        word_lst.append(word)
        pair = re.compile(r'(^|[^\w])' + word + r'($|[^\w])')
        reg_pairs.append(pair)
        word = fp.readline()
    fp.close()


# isGlutonny takes a string text and a list of string hashtags, return keywords in the text and hashtags
def glutonnyWords(text, hashtags):
    text = text.lower()
    keyWord = []
    for i in range(len(word_lst)):
        w = word_lst[i]
        r = reg_pairs[i]
        if r.search(text):
            keyWord.append(w)
            continue
        for h in hashtags:
            h = h.lower()
            if r.search(h):
                keyWord.append(w)
                break
    return keyWord
